import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/adminStore';

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const { products } = useAdminStore();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (!isOpen) { // We can't actually toggle from inside unless we emit, but this handles if the event bubbles. The global listener should be in Navbar or App
                }
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const results = query.trim() === '' ? [] : products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit results

    const handleSelect = (slug: string) => {
        navigate(`/producto/${slug}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border z-[100] overflow-hidden"
                    >
                        <div className="flex items-center px-4 py-4 border-b border-border">
                            <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar muebles, categorías..."
                                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                            />
                            <button onClick={onClose} className="p-1 hover:bg-muted rounded-full ml-3">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {query.trim() === '' ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p className="text-sm">Escribe para empezar a buscar...</p>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-1">
                                    {results.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSelect(product.slug)}
                                            className="w-full flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors text-left"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-black/5 overflow-hidden shrink-0">
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    width={48}
                                                    height={48}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                                                <p className="text-sm text-muted-foreground truncate">{product.category}</p>
                                            </div>
                                            <div className="text-gold font-medium shrink-0">
                                                ${product.price.toLocaleString('es-CO')}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p className="text-sm">No encontramos resultados para "{query}"</p>
                                </div>
                            )}
                        </div>
                        <div className="px-4 py-3 bg-muted/50 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span>Navega con flechas</span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">Esc</kbd> para cerrar
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
