import {
  X,
  CreditCard,
  User,
  Stethoscope,
  CalendarDays,
  DollarSign,
  ClipboardList,
} from 'lucide-react';

import PagamentoStatusBadge from './PagamentoStatusBadge';

function PagamentoViewModal({ isOpen, onClose, pagamento }) {
  if (!isOpen || !pagamento) return null;

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data) {
    if (!data) return 'Não informado';

    return new Date(data).toLocaleDateString('pt-BR');
  }

  function formatarDataAgendamento(data) {
    if (!data) return 'Não informado';

    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-sky-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black">
                Detalhes do pagamento #{pagamento.id}
              </h2>
              <p className="text-xs text-sky-100">
                Informações financeiras vinculadas ao agendamento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <InfoCard
              icon={DollarSign}
              label="Valor"
              value={formatarValor(pagamento.valor)}
              destaque
            />

            <InfoCard
              icon={CreditCard}
              label="Forma de pagamento"
              value={pagamento.formaPagamento || 'Não informado'}
            />

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Status
              </p>
              <div className="mt-3">
                <PagamentoStatusBadge status={pagamento.statusPagamento} />
              </div>
            </div>

            <InfoCard
              icon={CalendarDays}
              label="Data do pagamento"
              value={formatarData(pagamento.dataPagamento)}
            />
          </div>

          <section className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-black text-sky-900">
                Agendamento vinculado
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <LinhaDetalhe
                label="ID do agendamento"
                value={`#${pagamento.agendamentoId}`}
              />

              <LinhaDetalhe
                label="Data"
                value={formatarDataAgendamento(
                  pagamento.agendamento?.dataAgendamento
                )}
              />

              <LinhaDetalhe
                icon={User}
                label="Paciente"
                value={pagamento.agendamento?.paciente?.nome || 'Não informado'}
              />

              <LinhaDetalhe
                icon={Stethoscope}
                label="Médico"
                value={pagamento.agendamento?.medico?.nome || 'Não informado'}
              />
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-black text-gray-900">
                Observações
              </h3>
            </div>

            <p className="min-h-24 whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">
              {pagamento.observacoes || 'Nenhuma observação cadastrada.'}
            </p>
          </section>
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white transition hover:bg-sky-700"
            type="button"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, destaque }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        destaque
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black ${
          destaque ? 'text-green-700' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function LinhaDetalhe({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-white p-3">
      <div className="mb-1 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-sky-600" />}
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
          {label}
        </p>
      </div>

      <p className="text-sm font-black text-gray-900">
        {value}
      </p>
    </div>
  );
}

export default PagamentoViewModal;