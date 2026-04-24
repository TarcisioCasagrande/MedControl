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

  const carregarDados = async () => {
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
  };

  const handleEditar = (consulta) => {
    setConsultaEditando(consulta);
    setIsFormModalOpen(true);
  };

  const handleSalvar = async (consulta) => {
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
  };

  const handleConfirmarDelete = (consulta) => {
    setConsultaDeletando(consulta);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletar = async () => {
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
  };

  const handleAtualizarStatus = async (consulta, novoStatus) => {
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
  };

  const handleIniciarAtendimento = async (consulta) => {
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
  };

  const handleFinalizarAtendimento = async (consulta) => {
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
  };

  const handleAbrirProntuario = (consulta) => {
    setConsultaSelecionada(consulta);
    setProntuarioEditando(consulta.prontuario || null);
    setIsProntuarioModalOpen(true);
  };

  const handleSalvarProntuario = async (prontuario) => {
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
  };

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

        if (!grupos[chave]) {
          grupos[chave] = [];
        }

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
    };
  }, [consultas]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">Agenda</h1>
            <p className="text-sm text-gray-500">
              Visualize e gerencie consultas organizadas por dia
            </p>
          </div>
        </div>

        <button
          onClick={carregarDados}
          className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          title="Atualizar agenda"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ResumoCard
          titulo="Total de Consultas"
          valor={resumo.total}
          descricao="Consultas registradas"
          icon={CalendarDays}
          cor="blue"
        />
        <ResumoCard
          titulo="Consultas Hoje"
          valor={resumo.hoje}
          descricao="Agendadas para hoje"
          icon={Clock3}
          cor="amber"
        />
        <ResumoCard
          titulo="Em andamento"
          valor={resumo.emAndamento}
          descricao="Atendimentos iniciados"
          icon={Activity}
          cor="cyan"
        />
        <ResumoCard
          titulo="Finalizadas"
          valor={resumo.finalizadas}
          descricao="Consultas encerradas"
          icon={BadgeCheck}
          cor="green"
        />
        <ResumoCard
          titulo="Pendentes"
          valor={resumo.pendentes}
          descricao="Aguardando atendimento"
          icon={Filter}
          cor="violet"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, médico, paciente ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-500">Carregando agenda...</span>
        </div>
      ) : consultasAgrupadas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            Nenhuma consulta encontrada para os filtros informados.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {consultasAgrupadas.map(([data, consultasDoDia]) => (
            <div
              key={data}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {formatarDataBonita(data)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {consultasDoDia.length}{' '}
                      {consultasDoDia.length === 1 ? 'consulta' : 'consultas'}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <CalendarDays className="w-4 h-4" />
                    Agenda do dia
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {consultasDoDia.map((consulta) => (
                  <AgendaItem
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
            </div>
          ))}
        </div>
      )}

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

function AgendaItem({
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
  const dataInicioAtendimento = obterDataInicioAtendimento(consulta);
  const dataFimAtendimento = obterDataFimAtendimento(consulta);

  const podeIniciarAtendimento = podeIniciarConsulta(statusNormalizado);
  const podeFinalizarAtendimento = statusNormalizado === 'emandamento';
  const mostrarBotaoFinalizada = !ehStatusFinal(statusNormalizado) && statusNormalizado !== 'emandamento';
  const mostrarBotaoCancelada = !ehStatusFinal(statusNormalizado);
  const mostrarBotaoPendente = !ehStatusFinal(statusNormalizado) && statusNormalizado !== 'emandamento';

  const duracao = calcularDuracao(dataInicioAtendimento, dataFimAtendimento);

  return (
    <div className="p-5 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Clock3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Horário
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900">
                {formatarHora(consulta.dataConsulta)}
              </p>

              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                <Hash className="w-3 h-3" />
                {consulta.id}
              </span>
            </div>

            <StatusBadge status={consulta.status} />

            {dataInicioAtendimento && (
              <p className="mt-2 text-xs text-cyan-700 font-medium">
                Iniciado às {formatarHora(dataInicioAtendimento)}
              </p>
            )}

            {dataFimAtendimento && (
              <p className="mt-1 text-xs text-green-700 font-medium">
                Finalizado às {formatarHora(dataFimAtendimento)}
              </p>
            )}

            {duracao && (
              <p className="mt-1 text-xs text-gray-600 font-medium">
                Duração: {duracao}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <UserRound className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Paciente
            </p>
            <p className="text-sm font-medium text-gray-900">
              {consulta.paciente?.nome || 'Não informado'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Médico
            </p>
            <p className="text-sm font-medium text-gray-900">
              {consulta.medico?.nome || 'Não informado'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">
            Valor
          </p>
          <p className="text-sm font-semibold text-green-600">
            {consulta.valorCobrado !== undefined && consulta.valorCobrado !== null
              ? new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(consulta.valorCobrado))
              : '—'}
          </p>

          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mt-3 mb-1">
            Observações
          </p>
          <p className="text-sm text-gray-600">
            {consulta.observacoes || 'Sem observações'}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
              Ações rápidas
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onProntuario(consulta)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  temProntuario
                    ? 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                {temProntuario ? 'Ver prontuário' : 'Criar prontuário'}
              </button>

              <button
                onClick={() => onEditar(consulta)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </button>

              <button
                onClick={() => onDeletar(consulta)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
              Alterar status
            </p>

            <div className="flex flex-wrap gap-2">
              {podeIniciarAtendimento && (
                <button
                  onClick={() => onIniciarAtendimento(consulta)}
                  disabled={carregandoStatus}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  Iniciar atendimento
                </button>
              )}

              {podeFinalizarAtendimento && (
                <button
                  onClick={() => onFinalizarAtendimento(consulta)}
                  disabled={carregandoStatus}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <Square className="w-3.5 h-3.5" />
                  Finalizar atendimento
                </button>
              )}

              {mostrarBotaoFinalizada && (
                <button
                  onClick={() => onAtualizarStatus(consulta, 'Finalizada')}
                  disabled={carregandoStatus}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Finalizada
                </button>
              )}

              {mostrarBotaoCancelada && (
                <button
                  onClick={() => onAtualizarStatus(consulta, 'Cancelada')}
                  disabled={carregandoStatus}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelada
                </button>
              )}

              {mostrarBotaoPendente && (
                <button
                  onClick={() => onAtualizarStatus(consulta, 'Pendente')}
                  disabled={carregandoStatus}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  <Hourglass className="w-3.5 h-3.5" />
                  Pendente
                </button>
              )}
            </div>
          </div>
        </div>
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
      className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${
        estilos[valor] || estilos['Sem status']
      }`}
    >
      {valor}
    </span>
  );
}

function ResumoCard({ titulo, valor, descricao, icon: Icon, cor }) {
  const cores = {
    blue: {
      box: 'bg-blue-50 border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      value: 'text-blue-900',
    },
    amber: {
      box: 'bg-amber-50 border-amber-200',
      icon: 'bg-amber-100 text-amber-600',
      value: 'text-amber-900',
    },
    green: {
      box: 'bg-green-50 border-green-200',
      icon: 'bg-green-100 text-green-600',
      value: 'text-green-900',
    },
    violet: {
      box: 'bg-violet-50 border-violet-200',
      icon: 'bg-violet-100 text-violet-600',
      value: 'text-violet-900',
    },
    cyan: {
      box: 'bg-cyan-50 border-cyan-200',
      icon: 'bg-cyan-100 text-cyan-600',
      value: 'text-cyan-900',
    },
  };

  const estilo = cores[cor] || cores.blue;

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${estilo.box}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">{titulo}</p>
          <h3 className={`mt-2 text-2xl font-bold ${estilo.value}`}>{valor}</h3>
          <p className="mt-1 text-xs text-gray-500">{descricao}</p>
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${estilo.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
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
  if (valor === 'finalizada' || valor === 'realizada' || valor === 'concluida') return 'Finalizada';
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