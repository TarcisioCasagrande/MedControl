import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  RefreshCw,
  Search,
  Filter,
  Clock3,
  Stethoscope,
  UserRound,
  BadgeCheck,
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  Hourglass,
  Play,
  Activity,
  Square,
  Hash,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';

import {
  getConsultas,
  atualizarConsulta,
  deletarConsulta,
  iniciarAtendimento,
  finalizarAtendimento,
} from '../../services/consultaService';

import { getMedicos } from '../../services/medicoService';
import { getPacientes } from '../../services/pacienteService';

import {
  criarProntuario,
  atualizarProntuario,
} from '../../services/prontuarioService';

import { useToast } from '../../hooks/useToast';

import ConsultaFormModal from '../consultas/ConsultasFormModal';
import ConsultaDeleteDialog from '../consultas/ConsultasDeleteDialog';
import ProntuarioFormModal from '../prontuarios/ProntuariosFormModal';

function AgendaPage() {
  const [consultas, setConsultas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [painelAberto, setPainelAberto] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [medicoFiltro, setMedicoFiltro] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProntuarioModalOpen, setIsProntuarioModalOpen] = useState(false);

  const [consultaEditando, setConsultaEditando] = useState(null);
  const [consultaDeletando, setConsultaDeletando] = useState(null);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);
  const [prontuarioEditando, setProntuarioEditando] = useState(null);

  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const toast = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      const [dadosConsultas, dadosMedicos, dadosPacientes] = await Promise.all([
        getConsultas(),
        getMedicos(),
        getPacientes(),
      ]);

      setConsultas(dadosConsultas || []);
      setMedicos(dadosMedicos || []);
      setPacientes(dadosPacientes || []);
    } catch (error) {
      toast.error('Não foi possível carregar a agenda.');
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEditar(consulta) {
    setConsultaEditando(consulta);
    setIsFormModalOpen(true);
  }

  async function handleSalvar(consulta) {
    try {
      await atualizarConsulta(consulta);
      toast.success('Consulta atualizada com sucesso!');
      setIsFormModalOpen(false);
      setConsultaEditando(null);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar a consulta.';
      toast.error(mensagem);
      console.error(error);
    }
  }

  function handleConfirmarDelete(consulta) {
    setConsultaDeletando(consulta);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeletar() {
    try {
      await deletarConsulta(consultaDeletando.id);
      toast.success('Consulta removida com sucesso!');
      setIsDeleteDialogOpen(false);
      setConsultaDeletando(null);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao deletar a consulta.';
      toast.error(mensagem);
      console.error(error);
    }
  }

  async function handleAtualizarStatus(consulta, novoStatus) {
    try {
      setStatusLoadingId(consulta.id);

      const statusAtual = normalizarStatus(consulta.status);
      const proximoStatus = normalizarStatus(novoStatus);

      if (ehStatusFinal(statusAtual) && proximoStatus === 'emandamento') {
        toast.error('Não é possível colocar uma consulta finalizada em andamento.');
        return;
      }

      if (statusAtual === 'emandamento' && proximoStatus === 'finalizada') {
        await finalizarAtendimento(consulta.id);
        toast.success('Atendimento finalizado com sucesso!');
        await carregarDados();
        return;
      }

      const consultaAtualizada = {
        ...consulta,
        status: statusPadraoParaSalvar(novoStatus),
        medicoId: consulta.medicoId ?? consulta.medico?.id,
        pacienteId: consulta.pacienteId ?? consulta.paciente?.id,
        dataInicioAtendimento: obterDataInicioAtendimento(consulta),
        DataInicioAtendimento: obterDataInicioAtendimento(consulta),
        dataFimAtendimento: obterDataFimAtendimento(consulta),
        DataFimAtendimento: obterDataFimAtendimento(consulta),
      };

      await atualizarConsulta(consultaAtualizada);

      toast.success(`Status alterado para "${formatarLabelStatus(novoStatus)}".`);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao atualizar o status da consulta.';
      toast.error(mensagem);
      console.error(error);
    } finally {
      setStatusLoadingId(null);
    }
  }

  async function handleIniciarAtendimento(consulta) {
    try {
      setStatusLoadingId(consulta.id);

      const statusAtual = normalizarStatus(consulta.status);

      if (!podeIniciarConsulta(statusAtual)) {
        toast.error('Esta consulta não pode ser iniciada.');
        return;
      }

      await iniciarAtendimento(consulta.id);

      toast.success('Atendimento iniciado com sucesso!');
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao iniciar atendimento.';
      toast.error(mensagem);
      console.error(error);
    } finally {
      setStatusLoadingId(null);
    }
  }

  async function handleFinalizarAtendimento(consulta) {
    try {
      setStatusLoadingId(consulta.id);

      const statusAtual = normalizarStatus(consulta.status);

      if (statusAtual !== 'emandamento') {
        toast.error('A consulta precisa estar em andamento para ser finalizada.');
        return;
      }

      await finalizarAtendimento(consulta.id);

      toast.success('Atendimento finalizado com sucesso!');
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao finalizar atendimento.';
      toast.error(mensagem);
      console.error(error);
    } finally {
      setStatusLoadingId(null);
    }
  }

  function handleAbrirProntuario(consulta) {
    setConsultaSelecionada(consulta);
    setProntuarioEditando(consulta.prontuario || null);
    setIsProntuarioModalOpen(true);
  }

  async function handleSalvarProntuario(prontuario) {
    try {
      if (prontuarioEditando) {
        await atualizarProntuario(prontuario);
        toast.success('Prontuário atualizado com sucesso!');
      } else {
        await criarProntuario(prontuario);
        toast.success('Prontuário cadastrado com sucesso!');
      }

      setIsProntuarioModalOpen(false);
      setConsultaSelecionada(null);
      setProntuarioEditando(null);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar o prontuário.';
      toast.error(mensagem);
      console.error(error);
    }
  }

  const consultasFiltradas = useMemo(() => {
    return (consultas || []).filter((consulta) => {
      const termo = searchTerm.toLowerCase();

      const bateBusca =
        String(consulta.id || '').includes(termo) ||
        (consulta.medico?.nome || '').toLowerCase().includes(termo) ||
        (consulta.paciente?.nome || '').toLowerCase().includes(termo) ||
        (consulta.observacoes || '').toLowerCase().includes(termo) ||
        (formatarLabelStatus(consulta.status) || '').toLowerCase().includes(termo);

      const bateStatus = statusFiltro
        ? normalizarStatus(consulta.status) === normalizarStatus(statusFiltro)
        : true;

      const bateMedico = medicoFiltro
        ? String(consulta.medicoId ?? consulta.medico?.id) === String(medicoFiltro)
        : true;

      const bateData = dataFiltro
        ? formatarDataInput(consulta.dataConsulta) === dataFiltro
        : true;

      return bateBusca && bateStatus && bateMedico && bateData;
    });
  }, [consultas, searchTerm, statusFiltro, medicoFiltro, dataFiltro]);

  const consultasAgrupadas = useMemo(() => {
    const grupos = {};

    consultasFiltradas
      .slice()
      .sort((a, b) => new Date(a.dataConsulta) - new Date(b.dataConsulta))
      .forEach((consulta) => {
        const chave = formatarDataInput(consulta.dataConsulta);

        if (!grupos[chave]) grupos[chave] = [];

        grupos[chave].push(consulta);
      });

    return Object.entries(grupos);
  }, [consultasFiltradas]);

  const resumo = useMemo(() => {
    const hoje = new Date();
    const hojeStr = formatarDataInput(hoje);

    const consultasHoje = consultas.filter(
      (c) => formatarDataInput(c.dataConsulta) === hojeStr
    );

    const finalizadas = consultas.filter(
      (c) => normalizarStatus(c.status) === 'finalizada'
    );

    const emAndamento = consultas.filter(
      (c) => normalizarStatus(c.status) === 'emandamento'
    );

    const pendentes = consultas.filter((c) => {
      const status = normalizarStatus(c.status);
      return status === 'agendada' || status === 'pendente';
    });

    return {
      total: consultas.length,
      hoje: consultasHoje.length,
      finalizadas: finalizadas.length,
      emAndamento: emAndamento.length,
      pendentes: pendentes.length,
      filtradas: consultasFiltradas.length,
    };
  }, [consultas, consultasFiltradas]);

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div
        className={`grid h-full gap-3 transition-all duration-300 ${
          painelAberto ? 'grid-cols-[290px_1fr]' : 'grid-cols-[56px_1fr]'
        }`}
      >
        <aside className="flex min-h-0 flex-col gap-3">
          <button
            onClick={() => setPainelAberto((prev) => !prev)}
            className="flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-blue-600 shadow-sm transition hover:bg-blue-50"
            title={painelAberto ? 'Fechar painel' : 'Abrir painel'}
            type="button"
          >
            {painelAberto ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </button>

          {painelAberto && (
            <>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Agenda</h1>
                    <p className="text-xs text-gray-500">Controle dos atendimentos</p>
                  </div>
                </div>

                <button
                  onClick={carregarDados}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar agenda
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <MiniResumo titulo="Total" valor={resumo.total} icon={CalendarDays} cor="blue" />
                <MiniResumo titulo="Hoje" valor={resumo.hoje} icon={Clock3} cor="amber" />
                <MiniResumo titulo="Andamento" valor={resumo.emAndamento} icon={Activity} cor="cyan" />
                <MiniResumo titulo="Finalizadas" valor={resumo.finalizadas} icon={BadgeCheck} cor="green" />
                <MiniResumo titulo="Pendentes" valor={resumo.pendentes} icon={Filter} cor="violet" />
                <MiniResumo titulo="Filtradas" valor={resumo.filtradas} icon={Search} cor="blue" />
              </div>

              <div className="min-h-0 flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-gray-800">Filtros</h2>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os status</option>
                    <option value="Agendada">Agendada</option>
                    <option value="Pendente">Pendente</option>
                    <option value="EmAndamento">Em andamento</option>
                    <option value="Finalizada">Finalizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>

                  <select
                    value={medicoFiltro}
                    onChange={(e) => setMedicoFiltro(e.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os médicos</option>
                    {medicos.map((medico) => (
                      <option key={medico.id} value={medico.id}>
                        {medico.nome}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={dataFiltro}
                    onChange={(e) => setDataFiltro(e.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />

                  {(searchTerm || statusFiltro || medicoFiltro || dataFiltro) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFiltro('');
                        setMedicoFiltro('');
                        setDataFiltro('');
                      }}
                      className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </aside>

        <main className="min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Consultas da agenda
              </h2>
              <p className="text-xs text-gray-500">
                {consultasFiltradas.length}{' '}
                {consultasFiltradas.length === 1 ? 'consulta encontrada' : 'consultas encontradas'}
              </p>
            </div>

            {!painelAberto && (
              <button
                onClick={carregarDados}
                className="flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                type="button"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            )}
          </div>

          <div className="h-[calc(100%-57px)] overflow-auto bg-gray-50 p-3">
            {loading ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-gray-200 bg-white">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-3 text-sm text-gray-500">Carregando agenda...</span>
              </div>
            ) : consultasAgrupadas.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-gray-200 bg-white text-center">
                <CalendarDays className="mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  Nenhuma consulta encontrada para os filtros informados.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultasAgrupadas.map(([data, consultasDoDia]) => (
                  <section
                    key={data}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {formatarDataBonita(data)}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {consultasDoDia.length}{' '}
                          {consultasDoDia.length === 1 ? 'consulta' : 'consultas'}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Agenda do dia
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {consultasDoDia.map((consulta) => (
                        <AgendaLinha
                          key={consulta.id}
                          consulta={consulta}
                          onEditar={handleEditar}
                          onDeletar={handleConfirmarDelete}
                          onAtualizarStatus={handleAtualizarStatus}
                          onIniciarAtendimento={handleIniciarAtendimento}
                          onFinalizarAtendimento={handleFinalizarAtendimento}
                          onProntuario={handleAbrirProntuario}
                          statusLoadingId={statusLoadingId}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <ConsultaFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setConsultaEditando(null);
        }}
        consultaEditando={consultaEditando}
        onSalvar={handleSalvar}
        medicos={medicos}
        pacientes={pacientes}
      />

      <ConsultaDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setConsultaDeletando(null);
        }}
        onConfirm={handleDeletar}
        consulta={consultaDeletando}
      />

      <ProntuarioFormModal
        isOpen={isProntuarioModalOpen}
        onClose={() => {
          setIsProntuarioModalOpen(false);
          setConsultaSelecionada(null);
          setProntuarioEditando(null);
        }}
        prontuarioEditando={prontuarioEditando}
        consultaSelecionada={consultaSelecionada}
        onSalvar={handleSalvarProntuario}
        consultas={consultas}
      />
    </div>
  );
}

function AgendaLinha({
  consulta,
  onEditar,
  onDeletar,
  onAtualizarStatus,
  onIniciarAtendimento,
  onFinalizarAtendimento,
  onProntuario,
  statusLoadingId,
}) {
  const carregandoStatus = statusLoadingId === consulta.id;
  const temProntuario = !!consulta.prontuario;
  const statusNormalizado = normalizarStatus(consulta.status);

  const podeIniciarAtendimento = podeIniciarConsulta(statusNormalizado);
  const podeFinalizarAtendimento = statusNormalizado === 'emandamento';
  const mostrarBotaoFinalizada =
    !ehStatusFinal(statusNormalizado) && statusNormalizado !== 'emandamento';
  const mostrarBotaoCancelada = !ehStatusFinal(statusNormalizado);
  const mostrarBotaoPendente =
    !ehStatusFinal(statusNormalizado) && statusNormalizado !== 'emandamento';

  const dataInicio = obterDataInicioAtendimento(consulta);
  const dataFim = obterDataFimAtendimento(consulta);
  const duracao = calcularDuracao(dataInicio, dataFim);

  return (
    <div className="grid grid-cols-[90px_1.2fr_1.2fr_115px_1fr_250px] items-center gap-3 px-4 py-3 text-xs transition hover:bg-gray-50">
      <div>
        <div className="flex items-center gap-1.5">
          <Clock3 className="h-4 w-4 text-blue-500" />
          <span className="font-bold text-gray-900">
            {formatarHora(consulta.dataConsulta)}
          </span>
        </div>

        <div className="mt-1 inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
          <Hash className="h-3 w-3" />
          {consulta.id}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-gray-400">
          <UserRound className="h-3.5 w-3.5" />
          Paciente
        </div>
        <p className="truncate font-semibold text-gray-800">
          {consulta.paciente?.nome || 'Não informado'}
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-gray-400">
          <Stethoscope className="h-3.5 w-3.5" />
          Médico
        </div>
        <p className="truncate font-semibold text-gray-800">
          {consulta.medico?.nome || 'Não informado'}
        </p>
      </div>

      <div>
        <StatusBadge status={consulta.status} />

        <p className="mt-1 font-bold text-green-600">
          {formatarMoeda(consulta.valorCobrado)}
        </p>
      </div>

      <div className="min-w-0">
        {dataInicio && (
          <p className="truncate text-[11px] font-medium text-cyan-700">
            Início: {formatarHora(dataInicio)}
          </p>
        )}

        {dataFim && (
          <p className="truncate text-[11px] font-medium text-green-700">
            Fim: {formatarHora(dataFim)}
          </p>
        )}

        {duracao && (
          <p className="truncate text-[11px] font-medium text-gray-600">
            Duração: {duracao}
          </p>
        )}

        {!dataInicio && !dataFim && !duracao && (
          <p className="truncate text-[11px] text-gray-400">
            Atendimento não iniciado
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-1.5">
        <button
          onClick={() => onProntuario(consulta)}
          className={`inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-medium transition ${
            temProntuario
              ? 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
          title={temProntuario ? 'Ver prontuário' : 'Criar prontuário'}
        >
          <FileText className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => onEditar(consulta)}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-2 text-blue-700 transition hover:bg-blue-100"
          title="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => onDeletar(consulta)}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2 text-red-700 transition hover:bg-red-100"
          title="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        {podeIniciarAtendimento && (
          <button
            onClick={() => onIniciarAtendimento(consulta)}
            disabled={carregandoStatus}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-cyan-600 px-2 text-white transition hover:bg-cyan-700 disabled:opacity-50"
            title="Iniciar atendimento"
          >
            <Play className="h-3.5 w-3.5" />
          </button>
        )}

        {podeFinalizarAtendimento && (
          <button
            onClick={() => onFinalizarAtendimento(consulta)}
            disabled={carregandoStatus}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-700 px-2 text-white transition hover:bg-slate-800 disabled:opacity-50"
            title="Finalizar atendimento"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        )}

        {mostrarBotaoFinalizada && (
          <button
            onClick={() => onAtualizarStatus(consulta, 'Finalizada')}
            disabled={carregandoStatus}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-green-600 px-2 text-white transition hover:bg-green-700 disabled:opacity-50"
            title="Marcar como finalizada"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        )}

        {mostrarBotaoCancelada && (
          <button
            onClick={() => onAtualizarStatus(consulta, 'Cancelada')}
            disabled={carregandoStatus}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-red-600 px-2 text-white transition hover:bg-red-700 disabled:opacity-50"
            title="Cancelar consulta"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        )}

        {mostrarBotaoPendente && (
          <button
            onClick={() => onAtualizarStatus(consulta, 'Pendente')}
            disabled={carregandoStatus}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-amber-500 px-2 text-white transition hover:bg-amber-600 disabled:opacity-50"
            title="Marcar como pendente"
          >
            <Hourglass className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function MiniResumo({ titulo, valor, icon: Icon, cor }) {
  const cores = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 shadow-sm ${cores[cor] || cores.blue}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-gray-600">{titulo}</p>
          <h3 className="text-xl font-bold leading-none">{valor}</h3>
        </div>

        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const valor = formatarLabelStatus(status);

  const estilos = {
    Agendada: 'bg-blue-100 text-blue-700',
    Pendente: 'bg-amber-100 text-amber-700',
    'Em andamento': 'bg-cyan-100 text-cyan-700',
    Finalizada: 'bg-green-100 text-green-700',
    Cancelada: 'bg-red-100 text-red-700',
    'Sem status': 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
        estilos[valor] || estilos['Sem status']
      }`}
    >
      {valor}
    </span>
  );
}

function formatarDataInput(data) {
  if (!data) return '';

  const d = new Date(data);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarHora(data) {
  if (!data) return '—';

  const d = new Date(data);

  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarDataBonita(dataString) {
  const [ano, mes, dia] = dataString.split('-');
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));

  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatarMoeda(valor) {
  if (valor === undefined || valor === null) return '—';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor));
}

function normalizarStatus(status) {
  return (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function ehStatusFinal(statusNormalizado) {
  return ['finalizada', 'cancelada'].includes(statusNormalizado);
}

function podeIniciarConsulta(statusNormalizado) {
  return ['agendada', 'pendente'].includes(statusNormalizado);
}

function statusPadraoParaSalvar(status) {
  const valor = normalizarStatus(status);

  if (valor === 'concluida' || valor === 'realizada' || valor === 'finalizada') {
    return 'Finalizada';
  }

  if (valor === 'emandamento') return 'EmAndamento';
  if (valor === 'agendada') return 'Agendada';
  if (valor === 'pendente') return 'Pendente';
  if (valor === 'cancelada') return 'Cancelada';

  return status;
}

function formatarLabelStatus(status) {
  const valor = normalizarStatus(status);

  if (valor === 'emandamento') return 'Em andamento';
  if (valor === 'finalizada' || valor === 'realizada' || valor === 'concluida') {
    return 'Finalizada';
  }
  if (valor === 'agendada') return 'Agendada';
  if (valor === 'pendente') return 'Pendente';
  if (valor === 'cancelada') return 'Cancelada';

  return 'Sem status';
}

function obterDataInicioAtendimento(consulta) {
  return consulta?.dataInicioAtendimento || consulta?.DataInicioAtendimento || null;
}

function obterDataFimAtendimento(consulta) {
  return consulta?.dataFimAtendimento || consulta?.DataFimAtendimento || null;
}

function calcularDuracao(dataInicio, dataFim) {
  if (!dataInicio || !dataFim) return null;

  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  const diferencaMs = fim - inicio;

  if (Number.isNaN(diferencaMs) || diferencaMs < 0) {
    return null;
  }

  const minutosTotais = Math.floor(diferencaMs / 60000);
  const horas = Math.floor(minutosTotais / 60);
  const minutos = minutosTotais % 60;

  if (horas > 0) {
    return `${horas}h ${minutos}min`;
  }

  return `${minutos} min`;
}

export default AgendaPage;