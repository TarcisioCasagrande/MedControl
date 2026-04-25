import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  UserRound,
  Trash2,
  Search,
  BadgeCheck,
  Users,
  IdCard,
  FileSearch,
} from 'lucide-react';

import {
  getPacientes,
  criarPaciente,
  atualizarPaciente,
  deletarPaciente,
} from '../../services/pacienteService';

import { useToast } from '../../hooks/useToast';

import PacienteTable from './PacientesTable';
import PacienteFormModal from './PacientesFormModal';
import PacienteDeleteDialog from './PacientesDeleteDialog';
import PacienteViewModal from './PacienteViewModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selecionados, setSelecionados] = useState([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [pacienteDeletando, setPacienteDeletando] = useState(null);
  const [pacienteVisualizando, setPacienteVisualizando] = useState(null);

  const toast = useToast();

  useEffect(() => {
    carregarPacientes();
  }, []);

  async function carregarPacientes() {
    try {
      setLoading(true);
      const dados = await getPacientes();
      setPacientes(dados || []);
    } catch (error) {
      toast.error('Não foi possível carregar os pacientes.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleNovo() {
    setPacienteEditando(null);
    setIsFormModalOpen(true);
  }

  function handleVisualizar(paciente) {
    setPacienteVisualizando(paciente);
    setIsViewModalOpen(true);
  }

  function handleEditar(paciente) {
    setPacienteEditando(paciente);
    setIsFormModalOpen(true);
  }

  async function handleSalvar(paciente) {
    try {
      if (pacienteEditando) {
        await atualizarPaciente(paciente);
        toast.success(`Paciente "${paciente.nome}" atualizado com sucesso!`);
      } else {
        await criarPaciente(paciente);
        toast.success(`Paciente "${paciente.nome}" cadastrado com sucesso!`);
      }

      setIsFormModalOpen(false);
      setPacienteEditando(null);
      await carregarPacientes();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar o paciente.';

      toast.error(mensagem);
      console.error(error);
    }
  }

  function handleConfirmarDelete(paciente) {
    setPacienteDeletando(paciente);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeletar() {
    try {
      await deletarPaciente(pacienteDeletando.id);

      toast.success(`Paciente "${pacienteDeletando.nome}" removido com sucesso!`);

      setIsDeleteDialogOpen(false);
      setPacienteDeletando(null);
      setSelecionados((prev) => prev.filter((id) => id !== pacienteDeletando.id));

      await carregarPacientes();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao deletar o paciente.';

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

      const pacientesSelecionados = pacientes.filter((p) =>
        selecionados.includes(p.id)
      );

      const resultados = await Promise.allSettled(
        pacientesSelecionados.map(async (paciente) => {
          try {
            await deletarPaciente(paciente.id);
            return {
              sucesso: true,
              id: paciente.id,
              nome: paciente.nome,
            };
          } catch (error) {
            return {
              sucesso: false,
              id: paciente.id,
              nome: paciente.nome,
              mensagem:
                error?.response?.data?.mensagem || 'Erro ao excluir paciente.',
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
              ? 'paciente excluído com sucesso!'
              : 'pacientes excluídos com sucesso!'
          }`
        );
      } else if (sucessos.length > 0 && falhas.length > 0) {
        toast.success(
          `${sucessos.length} ${
            sucessos.length === 1 ? 'paciente excluído' : 'pacientes excluídos'
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
      await carregarPacientes();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem ||
        'Erro ao excluir os pacientes selecionados.';

      toast.error(mensagem);
      console.error(error);
    } finally {
      setBulkDeleting(false);
    }
  }

  const pacientesFiltrados = useMemo(() => {
    const termo = searchTerm.toLowerCase().trim();

    if (!termo) return pacientes;

    return pacientes.filter((paciente) => {
      return (
        String(paciente.id || '').includes(termo) ||
        (paciente.nome || '').toLowerCase().includes(termo) ||
        (paciente.cpf || '').toLowerCase().includes(termo) ||
        (paciente.telefone || '').toLowerCase().includes(termo) ||
        (paciente.email || '').toLowerCase().includes(termo) ||
        (paciente.tipoSanguineo || '').toLowerCase().includes(termo)
      );
    });
  }, [pacientes, searchTerm]);

  const totalPacientes = pacientes.length;
  const totalSelecionados = selecionados.length;
  const pacientesComTelefone = pacientes.filter((p) =>
    (p.telefone || '').trim()
  ).length;

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <UserRound className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Pacientes</h1>
              <p className="text-xs text-gray-500">
                Gerencie cadastros, contatos e dados dos pacientes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={carregarPacientes}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              title="Atualizar lista"
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
              Novo Paciente
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <ResumoCard
            titulo="Pacientes"
            valor={totalPacientes}
            descricao="Cadastrados"
            icon={Users}
            cor="blue"
          />

          <ResumoCard
            titulo="Filtrados"
            valor={pacientesFiltrados.length}
            descricao="Resultado atual"
            icon={FileSearch}
            cor="amber"
          />

          <ResumoCard
            titulo="Telefone"
            valor={pacientesComTelefone}
            descricao="Com contato"
            icon={IdCard}
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
                placeholder="Buscar por ID, nome, CPF, telefone, e-mail ou tipo sanguíneo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
              <UserRound className="mr-2 h-4 w-4 text-blue-500" />

              {pacientesFiltrados.length}{' '}
              {pacientesFiltrados.length === 1
                ? 'paciente encontrado'
                : 'pacientes encontrados'}

              {totalSelecionados > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-700">
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
              <span className="ml-3 text-sm text-gray-500">Carregando pacientes...</span>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <PacienteTable
                pacientes={pacientesFiltrados}
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

      <PacienteFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setPacienteEditando(null);
        }}
        pacienteEditando={pacienteEditando}
        onSalvar={handleSalvar}
      />

      <PacienteViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setPacienteVisualizando(null);
        }}
        paciente={pacienteVisualizando}
      />

      <PacienteDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPacienteDeletando(null);
        }}
        onConfirm={handleDeletar}
        paciente={pacienteDeletando}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => {
          if (bulkDeleting) return;
          setIsBulkDeleteModalOpen(false);
        }}
        onConfirm={handleExcluirSelecionados}
        title="Excluir pacientes"
        message={`Você deseja excluir ${selecionados.length} ${
          selecionados.length === 1
            ? 'paciente selecionado'
            : 'pacientes selecionados'
        }? Pacientes com consultas vinculadas não poderão ser excluídos.`}
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

export default PacientesPage;