import React from 'react';
import { useConfirm } from '../../contexts/ConfirmContext';
import { Trash2, AlertTriangle, Info, X } from 'lucide-react';

const GlobalConfirmModal: React.FC = () => {
  const { modalState, closeModal } = useConfirm();

  if (!modalState) return null;

  const { title, message, type, confirmText, cancelText, resolve } = modalState;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 size={32} strokeWidth={2.5} className="text-rose-600" />;
      case 'warning': return <AlertTriangle size={32} strokeWidth={2.5} className="text-amber-600" />;
      default: return <Info size={32} strokeWidth={2.5} className="text-indigo-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'danger': return 'bg-rose-50';
      case 'warning': return 'bg-amber-50';
      default: return 'bg-indigo-50';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={closeModal}
          className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className={`h-20 w-20 rounded-[2rem] ${getBgColor()} flex items-center justify-center mb-8 shadow-inner`}>
          {getIcon()}
        </div>

        <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-3 leading-tight">{title}</h4>
        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10 px-2">{message}</p>
        
        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={() => resolve(true)}
            className={`w-full py-4 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl ${
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 
              type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 
              'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            {confirmText || 'Confirm & Proceed'}
          </button>
          <button 
            onClick={() => resolve(false)}
            className="w-full py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            {cancelText || 'Discard Action'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalConfirmModal;
