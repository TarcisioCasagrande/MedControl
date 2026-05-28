import { useEffect, useMemo, useState } from 'react';
import {
  X,
  CreditCard,
  CalendarDays,
  DollarSign,
  ClipboardList,
  Save,
  Stethoscope,
  UserRound,
  AlertTriangle,
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

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    if (pagamentoEditando) {
      setFormData({
        id: pagamentoEditando.id || 0,
        agendamentoId: pagamentoEditando.agendamentoId || '',
        valor: pagamentoEditando.valor ?? '',
        formaPagamento: pagamentoEditando.formaPagamento || 'Pix',
        statusPagamento: pagamentoEditando.statusPagamento || 'Pendente',
        dataPagamento: pagamentoEditando.dataPagamento
          ? pagamentoEditando.dataPagamento.substring(0, 10)
          : '',
        observacoes: pagamentoEditando.observacoes || '',
      });

      return;
    }

    setFormData({
      id: 0,
      agendamentoId: '',
      valor: '',
      formaPagamento: 'Pix',
      statusPagamento: 'Pendente',
      dataPagamento: '',
      observacoes: '',
    });
  }, [isOpen, pagamentoEditando]);

  const agendamentosOrdenados = useMemo(() => {
    return [...(agendamentos || [])].sort((a, b) => {
      return new Date(b.dataAgendamento || 0) - new Date(a.dataAgendamento || 0);
    });
  }, [agendamentos]);

  const agendamentoSelecionado = useMemo(() => {
    return (agendamentos || []).find(
      (agendamento) => String(agendamento.id) === String(formData.agendamentoId)
    );
  }, [agendamentos, formData.agendamentoId]);

  function abrirAlerta(title, message) {
    setAlertModal({
      isOpen: true,
      title,
      message,
    });
  }

  function fecharAlerta() {
    setAlertModal({
      isOpen: false,
      title: '',
      message: '',
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === 'agendamentoId' && !pagamentoEditando) {
      const agendamentoSelecionadoAtual = agendamentos.find(
        (agendamento) => String(agendamento.id) === String(value)
      );

      setFormData((prev) => ({
        ...prev,
        agendamentoId: value,
        valor:
          agendamentoSelecionadoAtual?.valorCobrado ??
          agendamentoSelecionadoAtual?.procedimento?.valor ??
          prev.valor,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.agendamentoId) {
      abrirAlerta(
        'Agendamento obrigatório',
        'Selecione um agendamento antes de salvar o pagamento.'
      );
      return;
    }

    if (!formData.valor || Number(formData.valor) <= 0) {
      abrirAlerta(
        'Valor inválido',
        'Informe um valor válido para o pagamento.'
      );
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
      observacoes: formData.observacoes?.trim() || '',
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

    const valor = Number(
      agendamento.valorCobrado || agendamento.procedimento?.valor || 0
    ).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return `#${agendamento.id} - ${paciente} | ${medico} | ${data} | ${valor}`;
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarDataHora(data) {
    if (!data) return '-';

    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-sky-600 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <CreditCard className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black">
                  {pagamentoEditando ? 'Editar pagamento' : 'Novo pagamento'}
                </h2>
                <p className="text-xs text-sky-100">
                  Vincule o pagamento a um agendamento cadastrado
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

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
              <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sky-600" />
                  <h3 className="text-sm font-black text-gray-900">
                    Agendamento vinculado
                  </h3>
                </div>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />

                  <select
                    name="agendamentoId"
                    value={formData.agendamentoId}
                    onChange={handleChange}
                    disabled={Boolean(pagamentoEditando)}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  >
                    <option value="">Selecione um agendamento</option>

                    {agendamentosOrdenados.map((agendamento) => (
                      <option key={agendamento.id} value={agendamento.id}>
                        {formatarAgendamento(agendamento)}
                      </option>
                    ))}
                  </select>
                </div>

                {pagamentoEditando && (
                  <p className="mt-2 text-xs font-semibold text-gray-500">
                    O agendamento não pode ser alterado depois que o pagamento foi criado.
                  </p>
                )}

                {agendamentoSelecionado && (
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ResumoAgendamento
                      icon={UserRound}
                      label="Paciente"
                      value={agendamentoSelecionado.paciente?.nome || '-'}
                    />

                    <ResumoAgendamento
                      icon={Stethoscope}
                      label="Médico"
                      value={agendamentoSelecionado.medico?.nome || '-'}
                    />

                    <ResumoAgendamento
                      icon={DollarSign}
                      label="Valor previsto"
                      value={formatarMoeda(
                        agendamentoSelecionado.valorCobrado ||
                          agendamentoSelecionado.procedimento?.valor
                      )}
                    />
                  </div>
                )}
              </section>

              <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-sky-600" />
                  <h3 className="text-sm font-black text-gray-900">
                    Dados financeiros
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      Valor
                    </label>

                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />

                      <input
                        type="number"
                        name="valor"
                        step="0.01"
                        min="0"
                        value={formData.valor}
                        onChange={handleChange}
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        placeholder="Ex.: 150.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      Forma de pagamento
                    </label>

                    <select
                      name="formaPagamento"
                      value={formData.formaPagamento}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Convênio">Convênio</option>
                      <option value="Transferência">Transferência</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      Status
                    </label>

                    <select
                      name="statusPagamento"
                      value={formData.statusPagamento}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Pago">Pago</option>
                      <option value="Parcial">Parcial</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Estornado">Estornado</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      Data do pagamento
                    </label>

                    <input
                      type="date"
                      name="dataPagamento"
                      value={formData.dataPagamento}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </section>

              <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-sky-600" />
                  <h3 className="text-sm font-black text-gray-900">
                    Observações
                  </h3>
                </div>

                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={5}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder="Ex.: pagamento realizado na recepção, desconto aplicado, forma combinada, comprovante..."
                />

                <div className="mt-2 flex justify-end text-[11px] font-semibold text-gray-400">
                  {formData.observacoes.length}/500 caracteres
                </div>

                {pagamentoEditando?.dataAtualizacao && (
                  <p className="mt-2 text-xs text-gray-500">
                    Última atualização: {formatarDataHora(pagamentoEditando.dataAtualizacao)}
                  </p>
                )}
              </section>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-xl border border-gray-300 px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white transition hover:bg-sky-700"
              >
                <Save className="h-4 w-4" />
                Salvar pagamento
              </button>
            </div>
          </form>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={fecharAlerta}
        title={alertModal.title}
        message={alertModal.message}
      />
    </>
  );
}

function ResumoAgendamento({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4 text-sky-600" />
        <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">
          {label}
        </p>
      </div>

      <p className="truncate text-sm font-black text-gray-900">
        {value}
      </p>
    </div>
  );
}

function AlertModal({
  isOpen,
  onClose,
  title,
  message,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-amber-500 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-black">
                {title || 'Atenção'}
              </h2>
              <p className="text-xs text-amber-50">
                Verifique as informações antes de continuar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-gray-50 p-6">
          <p className="text-sm font-semibold leading-relaxed text-gray-700">
            {message}
          </p>
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-amber-500 px-5 text-sm font-bold text-white transition hover:bg-amber-600"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

export default PagamentoFormModal;