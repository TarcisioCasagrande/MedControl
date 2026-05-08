import { useEffect, useMemo, useState } from 'react';
import {
  X,
  CreditCard,
  CalendarDays,
  DollarSign,
  ClipboardList,
} from 'lucide-react';

function PagamentoFormModal({
  isOpen,
  onClose,
  pagamentoEditando,
  onSalvar,
  agendamentos,
}) {
  const [formData, setFormData] = useState({
    id: 0,
    agendamentoId: '',
    valor: '',
    formaPagamento: 'Pix',
    statusPagamento: 'Pendente',
    dataPagamento: '',
    observacoes: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    if (pagamentoEditando) {
      setFormData({
        id: pagamentoEditando.id,
        agendamentoId: pagamentoEditando.agendamentoId || '',
        valor: pagamentoEditando.valor || '',
        formaPagamento: pagamentoEditando.formaPagamento || 'Pix',
        statusPagamento: pagamentoEditando.statusPagamento || 'Pendente',
        dataPagamento: pagamentoEditando.dataPagamento
          ? pagamentoEditando.dataPagamento.substring(0, 10)
          : '',
        observacoes: pagamentoEditando.observacoes || '',
      });
    } else {
      setFormData({
        id: 0,
        agendamentoId: '',
        valor: '',
        formaPagamento: 'Pix',
        statusPagamento: 'Pendente',
        dataPagamento: '',
        observacoes: '',
      });
    }
  }, [isOpen, pagamentoEditando]);

  const agendamentosOrdenadas = useMemo(() => {
    return [...(agendamentos || [])].sort((a, b) => {
      return new Date(b.dataAgendamento) - new Date(a.dataAgendamento);
    });
  }, [agendamentos]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'agendamentoId' && !pagamentoEditando) {
      const agendamentoSelecionada = agendamentos.find((c) => String(c.id) === String(value));

      if (agendamentoSelecionada?.valorCobrado !== undefined) {
        setFormData((prev) => ({
          ...prev,
          agendamentoId: value,
          valor: agendamentoSelecionada.valorCobrado,
        }));
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.agendamentoId) {
      alert('Selecione uma agendamento.');
      return;
    }

    if (!formData.valor || Number(formData.valor) <= 0) {
      alert('Informe um valor válido para o pagamento.');
      return;
    }

    const pagamento = {
      id: Number(formData.id || 0),
      agendamentoId: Number(formData.agendamentoId),
      valor: Number(formData.valor),
      formaPagamento: formData.formaPagamento,
      statusPagamento: formData.statusPagamento,
      dataPagamento: formData.dataPagamento
        ? new Date(formData.dataPagamento).toISOString()
        : null,
      observacoes: formData.observacoes || '',
    };

    onSalvar(pagamento);
  }

  function formatarAgendamento(agendamento) {
    const paciente = agendamento.paciente?.nome || 'Paciente não informado';
    const medico = agendamento.medico?.nome || 'Médico não informado';

    const data = agendamento.dataAgendamento
      ? new Date(agendamento.dataAgendamento).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      : 'Sem data';

    const valor = Number(agendamento.valorCobrado || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return `#${agendamento.id} - ${paciente} | ${medico} | ${data} | ${valor}`;
  }

  if (!isOpen) return null;

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
                {pagamentoEditando ? 'Editar pagamento' : 'Novo pagamento'}
              </h2>
              <p className="text-sm text-gray-500">
                Vincule o pagamento a uma agendamento cadastrada
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

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">
              Agendamento
            </label>

            <div className="relative">
              <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <select
                name="agendamentoId"
                value={formData.agendamentoId}
                onChange={handleChange}
                disabled={!!pagamentoEditando}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                required
              >
                <option value="">Selecione uma agendamento</option>

                {agendamentosOrdenadas.map((agendamento) => (
                  <option key={agendamento.id} value={agendamento.id}>
                    {formatarAgendamento(agendamento)}
                  </option>
                ))}
              </select>
            </div>

            {pagamentoEditando && (
              <p className="mt-1 text-xs text-gray-500">
                A agendamento não pode ser alterada depois que o pagamento foi criado.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Valor
              </label>

              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

                <input
                  type="number"
                  name="valor"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Ex.: 150.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Forma de pagamento
              </label>

              <select
                name="formaPagamento"
                value={formData.formaPagamento}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="Pix">Pix</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Convênio">Convênio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                name="statusPagamento"
                value={formData.statusPagamento}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Estornado">Estornado</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Data do pagamento
              </label>

              <input
                type="date"
                name="dataPagamento"
                value={formData.dataPagamento}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">
              Observações
            </label>

            <div className="relative">
              <ClipboardList className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                placeholder="Ex.: pagamento realizado na recepção..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Salvar pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PagamentoFormModal;