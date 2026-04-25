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

  function formatarDataConsulta(data) {
    if (!data) return 'Não informado';

    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Detalhes do pagamento #{pagamento.id}
              </h2>
              <p className="text-sm text-gray-500">
                Informações da cobrança vinculada à consulta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </p>
              <div className="mt-2">
                <PagamentoStatusBadge status={pagamento.statusPagamento} />
              </div>
            </div>

            <InfoCard
              icon={CalendarDays}
              label="Data do pagamento"
              value={formatarData(pagamento.dataPagamento)}
            />
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">
                Consulta vinculada
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <p className="text-sm text-gray-700">
                <strong>ID da consulta:</strong> #{pagamento.consultaId}
              </p>

              <p className="text-sm text-gray-700">
                <strong>Data:</strong>{' '}
                {formatarDataConsulta(pagamento.consulta?.dataConsulta)}
              </p>

              <p className="text-sm text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>
                  <strong>Paciente:</strong>{' '}
                  {pagamento.consulta?.paciente?.nome || 'Não informado'}
                </span>
              </p>

              <p className="text-sm text-gray-700 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-gray-500" />
                <span>
                  <strong>Médico:</strong>{' '}
                  {pagamento.consulta?.medico?.nome || 'Não informado'}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800">
                Observações
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {pagamento.observacoes || 'Nenhuma observação cadastrada.'}
            </p>
          </div>

          <div className="flex justify-end border-t border-gray-200 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              type="button"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, destaque }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            destaque ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p
            className={`mt-1 text-sm font-semibold ${
              destaque ? 'text-green-700' : 'text-gray-800'
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PagamentoViewModal;