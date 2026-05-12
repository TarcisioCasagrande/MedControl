import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  CalendarDays,
  Trash2,
  Search,
  BadgeCheck,
  Clock3,
  Stethoscope,
} from 'lucide-react';

import {
  getAgendamentos,
  criarAgendamento,
  atualizarAgendamento,
  deletarAgendamento,
} from '../../services/agendamentoService';

import { getMedicos } from '../../services/medicoService';
import { getPacientes } from '../../services/pacienteService';
import { useToast } from '../../hooks/useToast';

import AgendamentoTable from './AgendamentosTable';
import AgendamentoFormModal from './AgendamentosFormModal';
import AgendamentoDeleteDialog from './AgendamentosDeleteDialog';
import AgendamentoViewModal from './AgendamentoViewModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selecionados, setSelecionados] = useState([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [agendamentoPreenchido, setAgendamentoPreenchido] = useState(null);
  const [agendamentoDeletando, setAgendamentoDeletando] = useState(null);
  const [agendamentoVisualizando, setAgendamentoVisualizando] = useState(null);

  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (location.state?.abrirNovoAgendamento && location.state?.agendamentoPreenchido) {
      setAgendamentoEditando(null);
      setAgendamentoPreenchido(location.state.agendamentoPreenchido);
      setIsFormModalOpen(true);

      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  async function carregarDados() {
    try {
      setLoading(true);

      const [dadosAgendamentos, dadosMedicos, dadosPacientes] = await Promise.all([
        getAgendamentos(),
        getMedicos(),
        getPacientes(),
      ]);

      setAgendamentos(dadosAgendamentos || []);
      setMedicos(dadosMedicos || []);
      setPacientes(dadosPacientes || []);
    } catch (error) {
      toast.error('Não foi possível carregar os agendamentos.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleNovo() {
    setAgendamentoEditando(null);
    setAgendamentoPreenchido(null);
    setIsFormModalOpen(true);
  }

  function handleVisualizar(agendamento) {
    setAgendamentoVisualizando(agendamento);
    setIsViewModalOpen(true);
  }

  function handleEditar(agendamento) {
    setAgendamentoPreenchido(null);
    setAgendamentoEditando(agendamento);
    setIsFormModalOpen(true);
  }

  async function handleSalvar(agendamento) {
    try {
      if (agendamentoEditando) {
        await atualizarAgendamento(agendamento);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await criarAgendamento(agendamento);
        toast.success('Agendamento cadastrado com sucesso!');
      }

      setIsFormModalOpen(false);
      setAgendamentoEditando(null);
      setAgendamentoPreenchido(null);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar o agendamento.';

      toast.error(mensagem);
      console.error(error);
    }
  }

  function handleConfirmarDelete(agendamento) {
    setAgendamentoDeletando(agendamento);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeletar() {
    try {
      await deletarAgendamento(agendamentoDeletando.id);
      toast.success('Agendamento removido com sucesso!');

      setIsDeleteDialogOpen(false);
      setAgendamentoDeletando(null);
      setSelecionados((prev) =>
        prev.filter((id) => id !== agendamentoDeletando.id)
      );

      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao deletar o agendamento.';

      toast.error(mensagem);
      console.error(error);
    }
  }

  function handleAbrirBulkDeleteModal() {
    if (selecionados.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  }

  async function handleExcluirSelecionados() {
    if (selecionados.length === 0) return;

    try {
      setBulkDeleting(true);

      const agendamentosSelecionados = agendamentos.filter((agendamento) =>
        selecionados.includes(agendamento.id)
      );

      const resultados = await Promise.allSettled(
        agendamentosSelecionados.map(async (agendamento) => {
          try {
            await deletarAgendamento(agendamento.id);
            return {
              sucesso: true,
              id: agendamento.id,
            };
          } catch (error) {
            return {
              sucesso: false,
              id: agendamento.id,
              mensagem:
                error?.response?.data?.mensagem || 'Erro ao excluir agendamento.',
            };
          }
        })
      );

      const sucessos = resultados
        .filter((resultado) => resultado.status === 'fulfilled')
        .map((resultado) => resultado.value)
        .filter((item) => item.sucesso);

      const falhas = resultados
        .filter((resultado) => resultado.status === 'fulfilled')
        .map((resultado) => resultado.value)
        .filter((item) => !item.sucesso);

      if (sucessos.length > 0 && falhas.length === 0) {
        toast.success(
          `${sucessos.length} ${
            sucessos.length === 1
              ? 'agendamento excluído com sucesso!'
              : 'agendamentos excluídos com sucesso!'
          }`
        );
      } else if (sucessos.length > 0 && falhas.length > 0) {
        toast.success(
          `${sucessos.length} ${
            sucessos.length === 1
              ? 'agendamento excluído'
              : 'agendamentos excluídos'
          }. ${falhas.length} ${
            falhas.length === 1
              ? 'não pôde ser excluído.'
              : 'não puderam ser excluídos.'
          }`
        );
      } else if (falhas.length > 0) {
        toast.error(falhas[0].mensagem);
      }

      const idsComFalha = falhas.map((item) => item.id);
      setSelecionados(idsComFalha);

      setIsBulkDeleteModalOpen(false);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem ||
        'Erro ao excluir os agendamentos selecionados.';

      toast.error(mensagem);
      console.error(error);
    } finally {
      setBulkDeleting(false);
    }
  }

  function fecharModalFormulario() {
    setIsFormModalOpen(false);
    setAgendamentoEditando(null);
    setAgendamentoPreenchido(null);
  }

  const agendamentosFiltrados = useMemo(() => {
    const termo = searchTerm.toLowerCase().trim();

    if (!termo) return agendamentos;

    return agendamentos.filter((agendamento) => {
      return (
        String(agendamento.id || '').includes(termo) ||
        (agendamento.status || '').toLowerCase().includes(termo) ||
        (agendamento.medico?.nome || '').toLowerCase().includes(termo) ||
        (agendamento.paciente?.nome || '').toLowerCase().includes(termo) ||
        (agendamento.procedimento?.nome || '').toLowerCase().includes(termo) ||
        (agendamento.procedimento?.codigo || '').toLowerCase().includes(termo) ||
        (agendamento.observacoes || '').toLowerCase().includes(termo) ||
        formatarDataBusca(agendamento.dataAgendamento).includes(termo)
      );
    });
  }, [agendamentos, searchTerm]);

  const totalAgendamentos = agendamentos.length;
  const totalSelecionados = selecionados.length;

  const agendamentosHoje = agendamentos.filter((agendamento) => {
    const hoje = new Date();
    const dataAgendamento = new Date(agendamento.dataAgendamento);

    return (
      dataAgendamento.getDate() === hoje.getDate() &&
      dataAgendamento.getMonth() === hoje.getMonth() &&
      dataAgendamento.getFullYear() === hoje.getFullYear()
    );
  }).length;

  const totalEmAndamento = agendamentos.filter((agendamento) => {
    const status = (agendamento.status || '').toLowerCase();
    return status.includes('andamento');
  }).length;

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Agendamentos</h1>
              <p className="text-xs text-gray-500">
                Gerencie agendamentos, agenda e seleções em lote
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={carregarDados}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              title="Recarregar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            {selecionados.length > 0 && (
              <button
                onClick={handleAbrirBulkDeleteModal}
                className="flex h-9 items-center gap-2 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Excluir ({selecionados.length})
              </button>
            )}

            <button
              onClick={handleNovo}
              className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <ResumoCard
            titulo="Agendamentos"
            valor={totalAgendamentos}
            descricao="Cadastrados"
            icon={CalendarDays}
            cor="blue"
          />

          <ResumoCard
            titulo="Filtrados"
            valor={agendamentosFiltrados.length}
            descricao="Resultado atual"
            icon={Search}
            cor="amber"
          />

          <ResumoCard
            titulo="Hoje"
            valor={agendamentosHoje}
            descricao="Agendamentos do dia"
            icon={Clock3}
            cor="violet"
          />

          <ResumoCard
            titulo="Selecionados"
            valor={totalSelecionados}
            descricao="Em lote"
            icon={BadgeCheck}
            cor="green"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Buscar por ID, paciente, médico, procedimento, status ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
              <Stethoscope className="mr-2 h-4 w-4 text-blue-500" />

              {agendamentosFiltrados.length}{' '}
              {agendamentosFiltrados.length === 1
                ? 'agendamento encontrado'
                : 'agendamentos encontrados'}

              {totalEmAndamento > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-1 text-[11px] font-medium text-cyan-700">
                  <Clock3 className="h-3 w-3" />
                  {totalEmAndamento} em andamento
                </span>
              )}

              {totalSelecionados > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-700">
                  <BadgeCheck className="h-3 w-3" />
                  {totalSelecionados} selecionado{totalSelecionados > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-3 text-sm text-gray-500">
                Carregando agendamentos...
              </span>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <AgendamentoTable
                agendamentos={agendamentosFiltrados}
                onVisualizar={handleVisualizar}
                onEditar={handleEditar}
                onDeletar={handleConfirmarDelete}
                selecionados={selecionados}
                setSelecionados={setSelecionados}
              />
            </div>
          )}
        </div>
      </div>

      <AgendamentoFormModal
        isOpen={isFormModalOpen}
        onClose={fecharModalFormulario}
        agendamentoEditando={agendamentoEditando || agendamentoPreenchido}
        onSalvar={handleSalvar}
        medicos={medicos}
        pacientes={pacientes}
      />

      <AgendamentoViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setAgendamentoVisualizando(null);
        }}
        agendamento={agendamentoVisualizando}
      />

      <AgendamentoDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setAgendamentoDeletando(null);
        }}
        onConfirm={handleDeletar}
        agendamento={agendamentoDeletando}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => {
          if (bulkDeleting) return;
          setIsBulkDeleteModalOpen(false);
        }}
        onConfirm={handleExcluirSelecionados}
        title="Excluir agendamentos"
        message={`Você deseja excluir ${selecionados.length} ${
          selecionados.length === 1
            ? 'agendamento selecionado'
            : 'agendamentos selecionados'
        }? Agendamentos com prontuário vinculado não poderão ser excluídos.`}
        confirmText="Excluir"
        loading={bulkDeleting}
      />
    </div>
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
  };

  const estilo = cores[cor] || cores.blue;

  return (
    <div className={`rounded-lg border px-3 py-2 shadow-sm ${estilo.box}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-xl font-bold leading-none ${estilo.value}`}>
              {valor}
            </h3>

            <p className="truncate text-xs font-semibold text-gray-700">
              {titulo}
            </p>
          </div>

          <p className="mt-1 truncate text-[11px] leading-none text-gray-500">
            {descricao}
          </p>
        </div>

        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${estilo.icon}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function formatarDataBusca(data) {
  if (!data) return '';

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return '';

  const dataBr = d.toLocaleDateString('pt-BR');
  const horaBr = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dataBr} ${horaBr}`.toLowerCase();
}

export default AgendamentosPage;
