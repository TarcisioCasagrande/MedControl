import {
  X,
  ClipboardList,
  Hash,
  DollarSign,
  CheckCircle2,
  XCircle,
  FileText,
  BadgeCheck,
  CalendarDays,
} from 'lucide-react';

function ProcedimentoViewModal({
  isOpen,
  onClose,
  procedimento,
}) {
  if (!isOpen || !procedimento) return null;

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      }
    );
  }

  function formatarData(data) {
    if (!data) return '-';

    return new Date(data).toLocaleDateString(
      'pt-BR'
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between bg-blue-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black">
                Visualizar procedimento
              </h2>

              <p className="text-xs text-blue-100">
                Procedimento #{procedimento.id || '-'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            <InfoCard
              icon={ClipboardList}
              titulo="Nome"
              valor={procedimento.nome}
              cor="blue"
            />

            <InfoCard
              icon={Hash}
              titulo="Código"
              valor={procedimento.codigo}
              cor="violet"
            />

            <InfoCard
              icon={DollarSign}
              titulo="Valor"
              valor={formatarValor(procedimento.valor)}
              cor="green"
            />

          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">

            <InfoCard
              icon={BadgeCheck}
              titulo="Status"
              valor={
                procedimento.ativo
                  ? 'Procedimento ativo'
                  : 'Procedimento inativo'
              }
              cor={
                procedimento.ativo
                  ? 'green'
                  : 'red'
              }
            />

            <InfoCard
              icon={CalendarDays}
              titulo="Criado em"
              valor={formatarData(
                procedimento.criadoEm
              )}
              cor="amber"
            />

            <InfoCard
              icon={FileText}
              titulo="Observações"
              valor={
                procedimento.observacoes ||
                'Nenhuma observação cadastrada'
              }
              cor="blue"
            />

          </div>

          <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />

              <h3 className="text-sm font-black text-gray-900">
                Descrição do procedimento
              </h3>
            </div>

            <div className="max-h-[240px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-relaxed text-gray-700">
              {procedimento.descricao ||
                'Nenhuma descrição cadastrada.'}
            </div>

          </section>

        </div>

        <div className="flex justify-end border-t border-gray-200 bg-white px-6 py-4">

          <button
            onClick={onClose}
            className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Fechar
          </button>

        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  titulo,
  valor,
  cor,
}) {
  const cores = {
    blue: {
      box: 'border-blue-200 bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      title: 'text-blue-700',
    },

    green: {
      box: 'border-green-200 bg-green-50',
      icon: 'bg-green-100 text-green-600',
      title: 'text-green-700',
    },

    violet: {
      box: 'border-violet-200 bg-violet-50',
      icon: 'bg-violet-100 text-violet-600',
      title: 'text-violet-700',
    },

    amber: {
      box: 'border-amber-200 bg-amber-50',
      icon: 'bg-amber-100 text-amber-600',
      title: 'text-amber-700',
    },

    red: {
      box: 'border-red-200 bg-red-50',
      icon: 'bg-red-100 text-red-600',
      title: 'text-red-700',
    },
  };

  const estilo = cores[cor] || cores.blue;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${estilo.box}`}
    >
      <div className="flex items-start gap-3">

        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${estilo.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <p
            className={`text-[11px] font-bold uppercase tracking-wide ${estilo.title}`}
          >
            {titulo}
          </p>

          <div className="mt-1 break-words text-sm font-black text-gray-900">
            {valor || '-'}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProcedimentoViewModal;