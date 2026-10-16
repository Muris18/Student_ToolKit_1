import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Fons NEaizver logu (citādi, iezīmējot tekstu ar peli un atlaižot ārpus loga, tas aizvērās).
    // Aizver tikai ✕, Atcelt/Saglabāt pogas vai Esc.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div role="dialog" aria-modal="true" className="bg-white rounded-3xl shadow-soft w-full max-w-md overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-pop">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Aizvērt" className="text-slate-400 hover:text-slate-800 transition-colors w-8 h-8 rounded-lg hover:bg-slate-100 cursor-pointer">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 text-slate-600">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">{footer}</div>}
      </div>
    </div>
  );
}
