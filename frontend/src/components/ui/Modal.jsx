import { X } from 'lucide-react';

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) {
  if (!isOpen) return null;

  const tamanhos = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`relative w-full ${tamanhos[size] || tamanhos.md} rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {title ? (
            <>
              <div className="border-b border-gray-200 px-6 py-4 pr-12">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>

              <div className="max-h-[calc(90vh-73px)] overflow-y-auto px-6 py-6">
                {children}
              </div>
            </>
          ) : (
            <div className="max-h-[90vh] overflow-y-auto px-6 py-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;