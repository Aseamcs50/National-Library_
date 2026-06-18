import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'confirm',
  onConfirm,
  onCancel,
  inputFields = [],
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {message && <p className="text-gray-700">{message}</p>}
          {type === 'prompt' && inputFields.map((field, idx) => (
            <div key={idx}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {field.label}
              </label>
              <input
                type="text"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent"
                autoFocus={idx === 0}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 p-5 pt-0 border-t border-gray-100">
          <button
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="flex-1 bg-primary-dark hover:bg-primary-dark text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}