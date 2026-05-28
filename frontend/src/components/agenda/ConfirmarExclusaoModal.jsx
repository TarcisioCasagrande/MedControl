// src/components/agenda/ConfirmarExclusaoModal.jsx
import { AlertTriangle, X } from 'lucide-react';

function ConfirmarExclusaoModal({
  isOpen,
  titulo = 'Confirmar exclusão',
  mensagem = 'Deseja realmente excluir este item?',
  processando = false,
  onClose,
  onConfirmar,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">{titulo}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{mensagem}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processando}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={processando}
            className="h-10 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={processando}
            className="h-10 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {processando ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmarExclusaoModal;