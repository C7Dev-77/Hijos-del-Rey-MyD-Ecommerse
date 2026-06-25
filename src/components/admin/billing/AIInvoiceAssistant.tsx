import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Sparkles, Send, Bot, User, CheckCircle2, X, Loader2, ChevronRight, AlertTriangle, RefreshCw, Zap, FileText } from "lucide-react";
import { useBillingClients } from "@/hooks/useBillingClients";
import { useBillingProducts } from "@/hooks/useBillingProducts";
import { useInvoices } from "@/hooks/useInvoices";
import { parseInvoiceWithGemini, chatWithGemini, type AIInvoiceResult } from "@/lib/gemini";
import { toast } from "sonner";

// ─── Utilidad de Moneda ──────────────────────────────────────────────────────
const formatCurrencyCOP = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    parsedInvoice?: AIInvoiceResult;
    isError?: boolean;
    isApiKeyError?: boolean;
    isLoading?: boolean;
}

interface AIInvoiceAssistantProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// ─── Detectar intención ──────────────────────────────────────────────────────
function isInvoiceRequest(text: string): boolean {
    const lower = text.toLowerCase().trim();
    const strongActionVerbs = ["crear", "crea", "generar", "genera", "emitir", "emite", "hacer", "haz", "nueva", "nuevo"];
    const invoicePatterns = [
        /^factura\s+para/i,
        /^factura\s+a\s+nombre/i,
        /^factura\s+al\s+cliente/i,
        /vendí/i,
        /vender/i,
        /\d+\s*(unidades|und|uds|piezas|pzs|cant|cantidades)/i,
        /\d+\s*x\s+/i,
    ];
    const hasStrongAction = strongActionVerbs.some(v => lower.includes(v));
    const matchesPattern = invoicePatterns.some(p => p.test(lower));
    const isQuestion = /^(qué|que|cómo|como|cuál|cual|dónde|donde|quién|quien|para\s+qué|para\s+que)/i.test(lower) || lower.includes("?");

    if (isQuestion && !hasStrongAction) return false;
    if (lower.length < 5 && !hasStrongAction) return false;
    if (["hola", "buenos días", "buenas tardes", "hey"].includes(lower)) return false;
    if (lower === "factura" || lower === "facturas") return false;

    return hasStrongAction || matchesPattern || (lower.includes("factura") && (lower.includes("con") || lower.includes("para")));
}

// ─── Render de markdown básico ────────────────────────────────────────────────
function RenderMarkdown({ text }: { text: string }) {
    const lines = text.split("\n");
    return (
        <>
            {lines.map((line, i) => {
                const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
                return (
                    <p key={i} className={cn("leading-relaxed", line === "" ? "mt-2" : i > 0 && "mt-0.5")}>
                        {parts.map((part, j) => {
                            if (part.startsWith("**") && part.endsWith("**")) return <strong key={j}>{part.slice(2, -2)}</strong>;
                            if (part.startsWith("*") && part.endsWith("*")) return <em key={j}>{part.slice(1, -1)}</em>;
                            if (part.startsWith("`") && part.endsWith("`")) return <code key={j} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
                            return <span key={j}>{part}</span>;
                        })}
                    </p>
                );
            })}
        </>
    );
}

// ─── Tarjeta de preview de factura ───────────────────────────────────────────
function InvoicePreviewCard({
    invoice,
    onConfirm,
    onCancel,
    creating,
}: {
    invoice: AIInvoiceResult;
    onConfirm: () => void;
    onCancel: () => void;
    creating: boolean;
}) {
    const total = invoice.items.reduce((s, i) => s + i.quantity * i.unit_price * (1 + i.tax / 100), 0);
    const hasPrice = invoice.items.some((i) => i.unit_price > 0);

    return (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
            {invoice.client_name && (
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-semibold text-foreground bg-primary/10 px-2 py-0.5 rounded-full">{invoice.client_name}</span>
                    {invoice.confidence === "high" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                </div>
            )}
            {invoice.items.length > 0 && (
                <div className="bg-background/60 rounded-lg border border-border/50 overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-muted/40">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Producto</th>
                                <th className="px-3 py-2 text-center font-medium text-muted-foreground">Cant.</th>
                                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Precio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {invoice.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="px-3 py-2 text-foreground font-medium">{item.description}</td>
                                    <td className="px-3 py-2 text-center text-muted-foreground">{item.quantity}</td>
                                    <td className="px-3 py-2 text-right">
                                        {item.unit_price > 0 ? <span className="font-semibold text-foreground">{formatCurrencyCOP(item.unit_price)}</span> : <span className="text-amber-500 italic">Por definir</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {hasPrice && (
                        <div className="px-3 py-2 bg-primary/5 border-t border-border/50 flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Total estimado (con IVA):</span>
                            <span className="text-sm font-bold text-primary">{formatCurrencyCOP(total)}</span>
                        </div>
                    )}
                </div>
            )}
            {!hasPrice && (
                <p className="text-xs flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Algunos precios quedaron en $0 — podrás editarlos después de crear la factura.
                </p>
            )}
            <div className="flex gap-2 pt-1">
                <Button size="sm" className="gap-1.5 flex-1 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white" onClick={onConfirm} disabled={creating || !invoice.client_id}>
                    {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {creating ? "Creando..." : "✅ Crear Factura"}
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-destructive" onClick={onCancel} disabled={creating}>
                    <X className="w-3.5 h-3.5" />
                    Cancelar
                </Button>
            </div>
            {!invoice.client_id && (
                <p className="text-xs text-destructive">⚠️ No se identificó el cliente. Dile al asistente el nombre exacto del cliente registrado.</p>
            )}
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function AIInvoiceAssistant({ open, onOpenChange }: AIInvoiceAssistantProps) {
    const { clients } = useBillingClients();
    const { products } = useBillingProducts();
    const { createInvoice } = useInvoices();

    const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY;

    const initialMessage: ChatMessage = {
        role: "assistant",
        content: hasApiKey
            ? "¡Hola! Soy **FacturaBot** 🤖, tu asistente de facturación con IA.\n\nDescríbeme la factura que necesitas crear y la generaré automáticamente.\n\n**Ejemplo:** *\"Factura para Empresa XYZ con 5 sillas ergonómicas y 2 escritorios\"*"
            : "⚠️ **API Key de Groq no configurada**\n\nPara usar el asistente necesitas configurar tu clave de Groq en el archivo `.env`.",
        isApiKeyError: !hasApiKey,
    };

    const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [pendingInvoice, setPendingInvoice] = useState<AIInvoiceResult | null>(null);
    const [creating, setCreating] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);

    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    useEffect(() => {
        if (open) {
            setMessages([initialMessage]);
            setInput("");
            setPendingInvoice(null);
            setCreating(false);
            setConversationHistory([]);
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [open]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isTyping || !hasApiKey) return;

        const userText = input.trim();
        setInput("");

        const userMsg: ChatMessage = { role: "user", content: userText };
        setMessages((prev) => [...prev, userMsg]);
        setIsTyping(true);

        const newHistory = [...conversationHistory, { role: "user", content: userText }];

        try {
            let assistantContent = "";
            let parsedInvoice: AIInvoiceResult | undefined;

            if (isInvoiceRequest(userText)) {
                const geminiClients = clients.map(c => ({ id: c.id, name: c.name, nit: c.nit }));
                const geminiProducts = products.map(p => ({ id: p.id, code: p.code, name: p.name, price: p.price, tax: p.tax }));

                const result = await parseInvoiceWithGemini(userText, geminiClients, geminiProducts, conversationHistory);
                parsedInvoice = result;
                assistantContent = result.message;

                if (result.client_id || result.items.length > 0) {
                    setPendingInvoice(result);
                }
            } else {
                assistantContent = await chatWithGemini(userText, conversationHistory);
            }

            const assistantMsg: ChatMessage = {
                role: "assistant",
                content: assistantContent,
                parsedInvoice,
            };

            setMessages((prev) => [...prev, assistantMsg]);
            setConversationHistory([...newHistory, { role: "model", content: assistantContent }]);
        } catch (err: any) {
            console.error("Error:", err);
            setMessages((prev) => [...prev, { role: "assistant", content: "❌ Error al comunicarse con la IA. " + (err.message || ""), isError: true }]);
        } finally {
            setIsTyping(false);
        }
    }, [input, isTyping, hasApiKey, clients, products, conversationHistory]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleConfirmCreate = async () => {
        if (!pendingInvoice?.client_id) {
            toast.error("No hay cliente identificado para crear la factura");
            return;
        }
        if (pendingInvoice.items.length === 0) {
            toast.error("La factura debe tener al menos un ítem");
            return;
        }

        setCreating(true);
        try {
            const { error } = await createInvoice({
                client_id: pendingInvoice.client_id,
                date: new Date().toISOString(),
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                notes: pendingInvoice.notes,
                items: pendingInvoice.items.map(i => ({
                    product_id: i.product_id,
                    description: i.description,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                    tax: i.tax
                }))
            });

            if (error) throw new Error(error.message);

            const successMsg: ChatMessage = {
                role: "assistant",
                content: "🎉 ¡Factura creada exitosamente!\n\nPuedes verla en la **lista de facturas**. Si necesitas editarla (por ejemplo ajustar precios), usa el menú de acciones ✏️.\n\n¿Necesitas crear otra factura?",
            };
            setMessages((prev) => [...prev, successMsg]);
            setPendingInvoice(null);
            toast.success("Factura creada");
        } catch (err: any) {
            toast.error("Error al crear la factura", { description: err.message });
        } finally {
            setCreating(false);
        }
    };

    const handleCancelInvoice = () => {
        setPendingInvoice(null);
        setMessages((prev) => prev.map((msg, i) => i === prev.length - 1 && msg.role === "assistant" ? { ...msg, parsedInvoice: undefined } : msg));
        setMessages((prev) => [...prev, { role: "assistant", content: "De acuerdo, cancelado. ¿Cómo quieres que la modifique?" }]);
    };

    const suggestions = [
        "Factura para mi primer cliente con 3 unidades del primer producto",
        "Crea una factura con los productos más recientes",
        "¿Cómo funciona la retención en la fuente en Colombia?",
        "¿Qué es una factura electrónica DIAN?",
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl h-[96vh] sm:h-[88vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-5 py-4 border-b shrink-0 bg-gradient-to-r from-violet-600/10 via-purple-500/10 to-primary/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold flex items-center gap-2">
                                    FacturaBot
                                    <span className="text-xs font-normal bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 py-0.5 rounded-full hidden sm:inline-block">
                                        Llama 3.3 · Groq
                                    </span>
                                </DialogTitle>
                                <DialogDescription className="text-xs mt-0.5">Asistente de IA para facturación</DialogDescription>
                            </div>
                        </div>
                        <div className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border", hasApiKey ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-destructive/30 bg-destructive/10 text-destructive")}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", hasApiKey ? "bg-emerald-500 animate-pulse" : "bg-destructive")} />
                            {hasApiKey ? "Conectado" : "Sin API Key"}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => {
                        const isUser = msg.role === "user";
                        const isLast = index === messages.length - 1;
                        return (
                            <div key={index} className={cn("flex gap-3 animate-fade-in", isUser ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md", isUser ? "bg-primary text-primary-foreground" : msg.isApiKeyError || msg.isError ? "bg-destructive/20 text-destructive" : "bg-gradient-to-br from-violet-500 to-purple-600 text-white")}>
                                    {isUser ? <User className="w-4 h-4" /> : msg.isApiKeyError ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn("max-w-[90%] sm:max-w-[82%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm shadow-sm", isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : msg.isApiKeyError ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-foreground rounded-tl-sm" : msg.isError ? "bg-destructive/10 border border-destructive/20 text-foreground rounded-tl-sm" : "bg-muted text-foreground rounded-tl-sm")}>
                                    <RenderMarkdown text={msg.content} />
                                    {!isUser && msg.parsedInvoice && (msg.parsedInvoice.client_id || msg.parsedInvoice.items.length > 0) && isLast && pendingInvoice && (
                                        <InvoicePreviewCard invoice={msg.parsedInvoice} onConfirm={handleConfirmCreate} onCancel={handleCancelInvoice} creating={creating} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                <div className="flex gap-1.5 items-center h-5">
                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {hasApiKey && messages.length <= 1 && (
                    <div className="px-4 pb-2 shrink-0">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Prueba con:</p>
                        <div className="flex flex-col gap-1.5">
                            {suggestions.map((s) => (
                                <button key={s} onClick={() => setInput(s)} className={cn("text-left text-xs px-3 py-2 rounded-lg border border-border bg-background hover:bg-violet-50 transition-all text-muted-foreground hover:text-foreground flex items-center gap-2")}>
                                    {s.toLowerCase().includes("factura") || s.toLowerCase().includes("crea") ? <FileText className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" /> : <Sparkles className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />}
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-4 pb-4 pt-2 border-t bg-background/95 shrink-0">
                    {hasApiKey ? (
                        <div className="flex gap-2 items-end">
                            <textarea ref={textareaRef} className={cn("flex-1 resize-none bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 placeholder:text-muted-foreground min-h-[46px] max-h-36 transition-all")} placeholder="Describe la factura o haz una pregunta... (Enter para enviar)" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} disabled={isTyping} />
                            <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="icon" className={cn("rounded-xl h-11 w-11 shadow-lg transition-all bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-40")}>
                                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mt-2">Configura la API Key VITE_GROQ_API_KEY en tu .env</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
