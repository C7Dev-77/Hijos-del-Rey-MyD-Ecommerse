import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2 } from 'lucide-react';
import { sendChatMessage, type ChatMessage } from '@/lib/groq';

interface DisplayMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const WELCOME_MESSAGE: DisplayMessage = {
    id: 'welcome',
    role: 'assistant',
    content: '¡Hola! 👋 Soy **Rey**, tu asistente virtual de M&D Hijos del Rey.\n\n¿En qué puedo ayudarte hoy? Puedo asesorarte sobre:\n\n🪑 Nuestros muebles artesanales\n🎨 Estilos de decoración\n🪵 Tipos de madera y materiales\n💰 Rangos de precios\n🚚 Envíos y garantías',
    timestamp: new Date(),
};

export function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Notificación visual cuando hay mensaje nuevo y el chat está cerrado
    useEffect(() => {
        if (!isOpen && messages.length > 1 && messages[messages.length - 1].role === 'assistant') {
            setHasNewMessage(true);
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isTyping) return;

        const userMsg: DisplayMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Preparar historial para Groq (últimos 10 mensajes para no exceder el contexto)
        const chatHistory: ChatMessage[] = messages
            .filter((m) => m.id !== 'welcome')
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content }));
        chatHistory.push({ role: 'user', content: trimmed });

        try {
            const response = await sendChatMessage(chatHistory);

            const assistantMsg: DisplayMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch (error) {
            const errorMsg: DisplayMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Disculpa, ocurrió un error. ¿Puedes intentar de nuevo? 🙏',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setHasNewMessage(false);
    };

    // Renderizar markdown básico (bold, newlines)
    const renderContent = (content: string) => {
        return content.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
                <span key={i}>
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                    })}
                    {i < content.split('\n').length - 1 && <br />}
                </span>
            );
        });
    };

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-[8.5rem] sm:bottom-[10.5rem] right-4 sm:right-6 z-40 w-[380px] max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-48px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border/50"
                        style={{
                            height: 'min(520px, calc(100vh - 14rem))',
                            maxHeight: 'calc(100vh - 14rem)',
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(250,247,242,0.98))',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* Header */}
                        <div className="relative px-5 py-4 bg-gradient-to-r from-charcoal via-charcoal to-charcoal/95 text-cream flex items-center gap-3 shrink-0">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-charcoal" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-charcoal" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-display font-semibold text-sm flex items-center gap-1.5">
                                    Rey
                                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                                </h3>
                                <p className="text-cream/60 text-xs">Asistente virtual • En línea</p>
                            </div>
                            <button
                                onClick={toggleChat}
                                className="p-1.5 rounded-lg hover:bg-cream/10 transition-colors"
                                aria-label="Cerrar chat"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" style={{ scrollbarGutter: 'stable' }}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'assistant'
                                            ? 'bg-gradient-to-br from-gold/20 to-gold/10'
                                            : 'bg-gradient-to-br from-charcoal/10 to-charcoal/5'
                                            }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <Bot className="w-3.5 h-3.5 text-gold" />
                                        ) : (
                                            <User className="w-3.5 h-3.5 text-charcoal/70" />
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${msg.role === 'assistant'
                                            ? 'bg-white text-charcoal shadow-sm border border-border/30 rounded-tl-md'
                                            : 'bg-gradient-to-br from-charcoal to-charcoal/90 text-cream rounded-tr-md shadow-md'
                                            }`}
                                    >
                                        {renderContent(msg.content)}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-2.5"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center shrink-0">
                                        <Bot className="w-3.5 h-3.5 text-gold" />
                                    </div>
                                    <div className="bg-white shadow-sm border border-border/30 px-4 py-3 rounded-2xl rounded-tl-md">
                                        <div className="flex gap-1.5">
                                            <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Suggestions (solo si hay pocos mensajes) */}
                        {messages.length <= 2 && !isTyping && (
                            <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
                                {['¿Qué muebles tienen?', '¿Hacen envíos?', 'Quiero cotizar'].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            setInput(suggestion);
                                            setTimeout(() => {
                                                setInput(suggestion);
                                                handleSend();
                                            }, 50);
                                        }}
                                        className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-gold/30 text-charcoal/70 hover:bg-gold/10 hover:border-gold/50 transition-all"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t border-border/50 bg-white/50 shrink-0">
                            <div className="flex items-center gap-2 bg-white rounded-xl border border-border/50 px-3 py-1.5 focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/20 transition-all">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Escribe tu pregunta..."
                                    className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/40 outline-none py-1.5"
                                    disabled={isTyping}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="p-2 rounded-lg bg-gold text-charcoal hover:bg-gold-light disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                                    aria-label="Enviar mensaje"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-charcoal/30 text-center mt-2">
                                Asistente IA de M&D Hijos del Rey · Respuestas generadas por IA
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={toggleChat}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2, type: 'spring', stiffness: 260, damping: 20 }}
                className={`fixed bottom-[4.5rem] sm:bottom-[6.5rem] right-4 sm:right-6 z-40 w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen
                    ? 'bg-charcoal/90 hover:bg-charcoal shadow-charcoal/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/40 ring-4 ring-blue-600/20 animate-pulse-soft'
                    } hover:scale-110 active:scale-95 group`}
                aria-label={isOpen ? 'Cerrar chat' : 'Abrir asistente virtual'}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6 text-cream" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Bot className="w-7 h-7 text-white group-hover:animate-bounce" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Badge de notificación */}
                {hasNewMessage && !isOpen && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center"
                    >
                        <span className="text-[10px] font-bold text-white">1</span>
                    </motion.div>
                )}
            </motion.button>
        </>
    );
}
