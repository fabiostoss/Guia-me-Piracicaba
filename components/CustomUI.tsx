
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LucideIcon, CheckCircle, XCircle, Info, AlertTriangle, X, Trash2, Check } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'primary';
    onConfirm: () => void;
    onCancel?: () => void;
}

interface UIContextType {
    showNotification: (message: string, type?: NotificationType) => void;
    showConfirm: (options: ConfirmOptions) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    }, []);

    const showConfirm = useCallback((options: ConfirmOptions) => {
        setConfirmOptions(options);
    }, []);

    const handleConfirm = () => {
        if (confirmOptions) {
            confirmOptions.onConfirm();
            setConfirmOptions(null);
        }
    };

    const handleCancel = () => {
        if (confirmOptions) {
            if (confirmOptions.onCancel) confirmOptions.onCancel();
            setConfirmOptions(null);
        }
    };

    return (
        <UIContext.Provider value={{ showNotification, showConfirm }}>
            {children}

            {/* Toast Notifications */}
            <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
                {notifications.map(n => (
                    <Toast key={n.id} notification={n} onClose={(id) => setNotifications(prev => prev.filter(nn => nn.id !== id))} />
                ))}
            </div>

            {/* Confirm Modal */}
            {confirmOptions && (
                <ConfirmModal
                    options={confirmOptions}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </UIContext.Provider>
    );
};

const Toast: React.FC<{ notification: Notification; onClose: (id: string) => void }> = ({ notification, onClose }) => {
    const icons: Record<NotificationType, any> = {
        success: <CheckCircle className="text-emerald-500" size={20} />,
        error: <XCircle className="text-rose-500" size={20} />,
        info: <Info className="text-brand-teal" size={20} />,
        warning: <AlertTriangle className="text-amber-500" size={20} />
    };

    const bgColors: Record<NotificationType, string> = {
        success: 'bg-emerald-50 border-emerald-100',
        error: 'bg-rose-50 border-rose-100',
        info: 'bg-brand-teal/5 border-brand-teal/10',
        warning: 'bg-amber-50 border-amber-100'
    };

    return (
        <div className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-xl animate-slide-in-right ${bgColors[notification.type]} min-w-[300px]`}>
            <div className="shrink-0">{icons[notification.type]}</div>
            <p className="text-sm font-bold text-slate-700 flex-grow">{notification.message}</p>
            <button onClick={() => onClose(notification.id)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
            </button>
        </div>
    );
};

const ConfirmModal: React.FC<{ options: ConfirmOptions; onConfirm: () => void; onCancel: () => void }> = ({ options, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2.5rem] max-w-sm w-full shadow-2xl animate-scale-in border border-slate-100 overflow-hidden">
                <div className="p-8 md:p-10 text-center space-y-6">
                    <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${options.type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-brand-teal/10 text-brand-teal'}`}>
                        {options.type === 'danger' ? <Trash2 size={32} /> : <Info size={32} />}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-brand-teal-deep uppercase tracking-tight">{options.title}</h3>
                        <p className="text-slate-500 font-bold text-sm leading-relaxed">{options.message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
                        >
                            {options.cancelLabel || 'Cancelar'}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${options.type === 'danger' ? 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600' : 'bg-brand-teal shadow-brand-teal/20 hover:bg-brand-teal-dark'}`}
                        >
                            {options.confirmLabel || (options.type === 'danger' ? 'Excluir' : 'Confirmar')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
