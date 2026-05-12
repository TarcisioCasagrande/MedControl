import {
  X,
  ClipboardList,
  Hash,
  DollarSign,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

function ProcedimentoViewModal({ isOpen, onClose, procedimento }) {
  if (!isOpen || !procedimento) return null;

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data) {
    if (!data) return '-';

    return new Date(data).toLocaleDateString('pt-BR');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Detalhes do procedimento
              </h2>
              <p className="text-xs text-gray-500">
                Informações cadastradas no sistema
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <InfoItem
            icon={ClipboardList}
            label="Nome"
            value={procedimento.nome}
          />

          <InfoItem icon={Hash} label="Código" value={procedimento.codigo} />

          <InfoItem
            icon={DollarSign}
            label="Valor"
            value={formatarValor(procedimento.valor)}
          />

          <InfoItem
            icon={CalendarDays}
            label="Data de cadastro"
            value={formatarData(procedimento.dataCadastro)}
          />

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              Status
            </p>

            {procedimento.ativo ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Procedimento ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                <XCircle className="h-4 w-4" />
                Procedimento inativo
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );
}

export default ProcedimentoViewModal;