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

  const carregarPacientes = async () => {
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
  };

  const handleNovo = () => {
    setPacienteEditando(null);
    setIsFormModalOpen(true);
  };

  const handleVisualizar = (paciente) => {
    setPacienteVisualizando(paciente);
    setIsViewModalOpen(true);
  };

  const handleEditar = (paciente) => {
    setPacienteEditando(paciente);
    setIsFormModalOpen(true);
  };

  const handleSalvar = async (paciente) => {
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
  };

  const handleConfirmarDelete = (paciente) => {
    setPacienteDeletando(paciente);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletar = async () => {
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
  };

  const handleAbrirBulkDeleteModal = () => {
    if (selecionados.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const handleExcluirSelecionados = async () => {
    if (selecionados.length === 0) return;

    try {
      setBulkDeleting(true);

      const pacientesSelecionados = pacientes.filter((p) => selecionados.includes(p.id));

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
            falhas.length === 1 ? 'não pôde ser excluído.' : 'não puderam ser excluídos.'
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
  };

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
  const pacientesComTelefone = pacientes.filter((p) => (p.telefone || '').trim()).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserRound className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">Pacientes</h1>
            <p className="text-sm text-gray-500">
              Gerencie pacientes, seleções em lote e cadastros com mais organização
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarPacientes}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {selecionados.length > 0 && (
            <button
              onClick={handleAbrirBulkDeleteModal}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir ({selecionados.length})
            </button>
          )}

          <button
            onClick={handleNovo}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Paciente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumoCard
          titulo="Total de Pacientes"
          valor={totalPacientes}
          descricao="Pacientes cadastrados"
          icon={Users}
          cor="blue"
        />
        <ResumoCard
          titulo="Filtrados"
          valor={pacientesFiltrados.length}
          descricao="Resultado da busca atual"
          icon={FileSearch}
          cor="amber"
        />
        <ResumoCard
          titulo="Com Telefone"
          valor={pacientesComTelefone}
          descricao="Cadastros com contato"
          icon={IdCard}
          cor="violet"
        />
        <ResumoCard
          titulo="Selecionados"
          valor={totalSelecionados}
          descricao="Itens marcados em lote"
          icon={BadgeCheck}
          cor="green"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, nome, CPF, telefone, e-mail ou tipo sanguíneo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UserRound className="w-4 h-4 text-blue-500" />
              <span>
                {pacientesFiltrados.length}{' '}
                {pacientesFiltrados.length === 1 ? 'paciente encontrado' : 'pacientes encontrados'}
              </span>
            </div>

            {totalSelecionados > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                <BadgeCheck className="w-3.5 h-3.5" />
                {totalSelecionados} selecionado{totalSelecionados > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-500">Carregando pacientes...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
          selecionados.length === 1 ? 'paciente selecionado' : 'pacientes selecionados'
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

export default PacientesPage;