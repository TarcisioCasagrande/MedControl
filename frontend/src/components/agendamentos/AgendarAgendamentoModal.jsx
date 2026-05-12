import { useEffect, useMemo, useState } from 'react';
import {
  CalendarPlus,
  User,
  UserPlus,
  CalendarDays,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle2,
  BadgeDollarSign,
} from 'lucide-react';
import Modal from '../ui/Modal';
import { getPacientes } from '../../services/pacienteService';
import { getAgendamentos } from '../../services/agendamentoService';
import { getProcedimentos } from '../../services/procedimentosService';

function AgendarAgendamentoModal({
  isOpen,
  onClose,
  medico,
  onSalvar,
  onCadastrarNovoPaciente,
}) {
  const [pacientes, setPacientes] = useState([]);
  const [procedimentos, setProcedimentos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [mostrarListaPacientes, setMostrarListaPacientes] = useState(false);

  const [buscaProcedimento, setBuscaProcedimento] = useState('');
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState(null);
  const [mostrarListaProcedimentos, setMostrarListaProcedimentos] = useState(false);

  const [dataAgendamento, setDataAgendamento] = useState('');
  const [motivoAgendamento, setMotivoAgendamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [erroConflitoMedico, setErroConflitoMedico] = useState('');
  const [erroConflitoPaciente, setErroConflitoPaciente] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    carregarDados();
    limparFormulario();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    validarConflitos();
  }, [dataAgendamento, medico, pacienteSelecionado, agendamentos, isOpen]);

  async function carregarDados() {
    try {
      setCarregando(true);

      const [dadosPacientes, dadosAgendamentos, dadosProcedimentos] =
        await Promise.all([
          getPacientes(),
          getAgendamentos().catch(() => []),
          getProcedimentos(),
        ]);

      setPacientes(dadosPacientes || []);
      setAgendamentos(dadosAgendamentos || []);
      setProcedimentos(dadosProcedimentos || []);
    } catch (error) {
      console.error('Erro ao carregar dados do agendamento:', error);
    } finally {
      setCarregando(false);
    }
  }

  function limparFormulario() {
    setBuscaPaciente('');
    setPacienteSelecionado(null);
    setMostrarListaPacientes(false);
    setBuscaProcedimento('');
    setProcedimentoSelecionado(null);
    setMostrarListaProcedimentos(false);
    setDataAgendamento('');
    setMotivoAgendamento('');
    setObservacoes('');
    setErroConflitoMedico('');
    setErroConflitoPaciente('');
  }

  const pacientesFiltrados = useMemo(() => {
    const termo = buscaPaciente.toLowerCase().trim();

    if (!termo) return pacientes.slice(0, 8);

    return pacientes
      .filter((paciente) =>
        `${paciente.nome || ''} ${paciente.cpf || ''} ${paciente.telefone || ''}`
          .toLowerCase()
          .includes(termo)
      )
      .slice(0, 8);
  }, [pacientes, buscaPaciente]);

  const procedimentosFiltrados = useMemo(() => {
    const termo = buscaProcedimento.toLowerCase().trim();

    const listaAtiva = procedimentos.filter(
      (procedimento) => procedimento.ativo === undefined || procedimento.ativo === true
    );

    if (!termo) return listaAtiva.slice(0, 8);

    return listaAtiva
      .filter((procedimento) =>
        `${procedimento.nome || ''} ${procedimento.codigo || ''}`
          .toLowerCase()
          .includes(termo)
      )
      .slice(0, 8);
  }, [procedimentos, buscaProcedimento]);

  const valorProcedimento = Number(procedimentoSelecionado?.valor || 0);

  function selecionarPaciente(paciente) {
    setPacienteSelecionado(paciente);
    setBuscaPaciente(paciente.nome || '');
    setMostrarListaPacientes(false);
  }

  function selecionarProcedimento(procedimento) {
    setProcedimentoSelecionado(procedimento);
    setBuscaProcedimento(
      `${procedimento.codigo ? `${procedimento.codigo} - ` : ''}${procedimento.nome || ''}`
    );
    setMostrarListaProcedimentos(false);
  }

  function normalizarDataHora(valor) {
    if (!valor) return '';

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
      return valor?.slice?.(0, 16) || '';
    }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');

    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
  }

  function statusCancelado(status) {
    return (status || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim() === 'cancelada';
  }

  function validarConflitos() {
    if (!dataAgendamento) {
      setErroConflitoMedico('');
      setErroConflitoPaciente('');
      return;
    }

    const dataHoraSelecionada = normalizarDataHora(dataAgendamento);

    const conflitoMedico = agendamentos.some((agendamento) => {
      const mesmoMedico = Number(agendamento.medicoId) === Number(medico?.id);
      const mesmaDataHora =
        normalizarDataHora(agendamento.dataAgendamento) === dataHoraSelecionada;

      return mesmoMedico && mesmaDataHora && !statusCancelado(agendamento.status);
    });

    const conflitoPaciente = agendamentos.some((agendamento) => {
      const mesmoPaciente =
        Number(agendamento.pacienteId) === Number(pacienteSelecionado?.id);
      const mesmaDataHora =
        normalizarDataHora(agendamento.dataAgendamento) === dataHoraSelecionada;

      return mesmoPaciente && mesmaDataHora && !statusCancelado(agendamento.status);
    });

    setErroConflitoMedico(
      conflitoMedico
        ? 'O médico já possui um agendamento nesse horário. Escolha outro horário disponível.'
        : ''
    );

    setErroConflitoPaciente(
      pacienteSelecionado?.id && conflitoPaciente
        ? 'O paciente já possui um agendamento nesse mesmo horário.'
        : ''
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!pacienteSelecionado?.id) return;
    if (!procedimentoSelecionado?.id) return;
    if (!dataAgendamento) return;
    if (erroConflitoMedico || erroConflitoPaciente) return;

    onSalvar({
      medicoId: medico.id,
      pacienteId: pacienteSelecionado.id,
      procedimentoId: procedimentoSelecionado.id,
      dataAgendamento,
      status: 'Agendado',
      motivoAgendamento: motivoAgendamento.trim(),
      observacoes,
      tipoAtendimento: 'Presencial',
      valorCobrado: valorProcedimento,
    });
  }

  if (!medico) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        limparFormulario();
        onClose();
      }}
      title="Novo Agendamento"
    >
      <div className="max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <CalendarPlus className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Agendamento
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Selecione o paciente, procedimento, data e horário para registrar o novo agendamento.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-800">
                Médico selecionado
              </h3>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">{medico.nome}</p>
              <p className="mt-1 text-xs text-gray-500">
                {medico.especialidade || 'Especialidade não informada'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-800">
                Dados do agendamento
              </h3>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Paciente <span className="text-red-500">*</span>
                  </label>

                  {onCadastrarNovoPaciente && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={onCadastrarNovoPaciente}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Novo paciente
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={buscaPaciente}
                    onChange={(e) => {
                      setBuscaPaciente(e.target.value);
                      setPacienteSelecionado(null);
                      setMostrarListaPacientes(true);
                    }}
                    onFocus={() => setMostrarListaPacientes(true)}
                    onBlur={() => setTimeout(() => setMostrarListaPacientes(false), 150)}
                    placeholder="Pesquise por nome, CPF ou telefone"
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {mostrarListaPacientes && (
                  <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    {carregando ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Carregando pacientes...
                      </div>
                    ) : pacientesFiltrados.length > 0 ? (
                      pacientesFiltrados.map((paciente) => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => selecionarPaciente(paciente)}
                          className="flex w-full flex-col items-start border-b border-gray-100 px-4 py-3 text-left transition hover:bg-blue-50 last:border-b-0"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {paciente.nome}
                          </span>
                          <span className="mt-1 text-xs text-gray-500">
                            {paciente.cpf ? `CPF: ${paciente.cpf}` : 'CPF não informado'}
                            {paciente.telefone ? ` • Tel: ${paciente.telefone}` : ''}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Nenhum paciente encontrado.
                      </div>
                    )}
                  </div>
                )}

                {pacienteSelecionado && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Paciente selecionado: {pacienteSelecionado.nome}
                      </p>
                      <p className="mt-1 text-xs text-green-700">
                        {pacienteSelecionado.cpf
                          ? `CPF: ${pacienteSelecionado.cpf}`
                          : 'CPF não informado'}
                        {pacienteSelecionado.telefone
                          ? ` • Tel: ${pacienteSelecionado.telefone}`
                          : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Procedimento <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={buscaProcedimento}
                    onChange={(e) => {
                      setBuscaProcedimento(e.target.value);
                      setProcedimentoSelecionado(null);
                      setMostrarListaProcedimentos(true);
                    }}
                    onFocus={() => setMostrarListaProcedimentos(true)}
                    onBlur={() => setTimeout(() => setMostrarListaProcedimentos(false), 150)}
                    placeholder="Pesquise por nome ou código do procedimento"
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {mostrarListaProcedimentos && (
                  <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    {carregando ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Carregando procedimentos...
                      </div>
                    ) : procedimentosFiltrados.length > 0 ? (
                      procedimentosFiltrados.map((procedimento) => (
                        <button
                          key={procedimento.id}
                          type="button"
                          onClick={() => selecionarProcedimento(procedimento)}
                          className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-blue-50 last:border-b-0"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {procedimento.nome}
                            </span>
                            <span className="mt-1 block text-xs text-gray-500">
                              {procedimento.codigo
                                ? `Código: ${procedimento.codigo}`
                                : 'Código não informado'}
                            </span>
                          </div>

                          <span className="text-sm font-semibold text-green-700">
                            {formatarMoeda(procedimento.valor)}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Nenhum procedimento encontrado.
                      </div>
                    )}
                  </div>
                )}

                {procedimentoSelecionado && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Procedimento selecionado: {procedimentoSelecionado.nome}
                      </p>
                      <p className="mt-1 text-xs text-green-700">
                        {procedimentoSelecionado.codigo
                          ? `Código: ${procedimentoSelecionado.codigo}`
                          : 'Código não informado'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BadgeDollarSign className="h-4 w-4 text-green-600" />
                  Valor do procedimento
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {procedimentoSelecionado
                    ? formatarMoeda(valorProcedimento)
                    : 'Selecione um procedimento'}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Data e horário <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={dataAgendamento}
                  onChange={(e) => setDataAgendamento(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {erroConflitoMedico && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Conflito de agenda do médico
                    </p>
                    <p className="mt-1 text-sm text-red-700">{erroConflitoMedico}</p>
                  </div>
                </div>
              )}

              {erroConflitoPaciente && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Conflito de agenda do paciente
                    </p>
                    <p className="mt-1 text-sm text-amber-700">{erroConflitoPaciente}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Motivo do agendamento
                </label>
                <input
                  type="text"
                  value={motivoAgendamento}
                  onChange={(e) => setMotivoAgendamento(e.target.value)}
                  placeholder="Opcional"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                  placeholder="Informações adicionais sobre o agendamento"
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                limparFormulario();
                onClose();
              }}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                !pacienteSelecionado ||
                !procedimentoSelecionado ||
                !dataAgendamento ||
                !!erroConflitoMedico ||
                !!erroConflitoPaciente
              }
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default AgendarAgendamentoModal;
