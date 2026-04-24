import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  FileText,
  Trash2,
  Search,
  BadgeCheck,
  FileSearch,
  ClipboardList,
  Stethoscope,
} from 'lucide-react';
import {
  getProntuarios,
  criarProntuario,
  atualizarProntuario,
  deletarProntuario,
} from '../../services/prontuarioService';
import { getConsultas } from '../../services/consultaService';
import { useToast } from '../../hooks/useToast';
import ProntuarioTable from './ProntuariosTable';
import ProntuarioFormModal from './ProntuariosFormModal';
import ProntuarioDeleteDialog from './ProntuariosDeleteDialog';
import ProntuarioViewModal from './ProntuarioViewModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function ProntuariosPage() {
  const [prontuarios, setProntuarios] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selecionados, setSelecionados] = useState([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [prontuarioEditando, setProntuarioEditando] = useState(null);
  const [prontuarioDeletando, setProntuarioDeletando] = useState(null);
  const [prontuarioVisualizando, setProntuarioVisualizando] = useState(null);

  const toast = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [dadosProntuarios, dadosConsultas] = await Promise.all([
        getProntuarios(),
        getConsultas().catch(() => []),
      ]);

      setProntuarios(dadosProntuarios || []);
      setConsultas(dadosConsultas || []);
    } catch (error) {
      toast.error('Não foi possível carregar os dados.');
      console.error('Erro ao carregar prontuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setProntuarioEditando(null);
    setIsFormModalOpen(true);
  };

  const handleEditar = (prontuario) => {
    setProntuarioEditando(prontuario);
    setIsFormModalOpen(true);
  };

  const handleVisualizar = (prontuario) => {
    setProntuarioVisualizando(prontuario);
    setIsViewModalOpen(true);
  };

  const handleSalvar = async (prontuario) => {
    try {
      if (prontuarioEditando) {
        await atualizarProntuario(prontuario);
        toast.success('Prontuário atualizado com sucesso!');
      } else {
        await criarProntuario(prontuario);
        toast.success('Prontuário cadastrado com sucesso!');
      }

      setIsFormModalOpen(false);
      setProntuarioEditando(null);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar o prontuário.';

      toast.error(mensagem);
      console.error('Erro ao salvar prontuário:', error);
    }
  };

  const handleConfirmarDelete = (prontuario) => {
    setProntuarioDeletando(prontuario);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletar = async () => {
    try {
      await deletarProntuario(prontuarioDeletando.id);
      toast.success('Prontuário removido com sucesso!');

      setIsDeleteDialogOpen(false);
      setProntuarioDeletando(null);
      setSelecionados((prev) => prev.filter((id) => id !== prontuarioDeletando.id));

      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao deletar o prontuário.';

      toast.error(mensagem);
      console.error('Erro ao deletar prontuário:', error);
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

      const prontuariosSelecionados = prontuarios.filter((p) => selecionados.includes(p.id));

      const resultados = await Promise.allSettled(
        prontuariosSelecionados.map(async (prontuario) => {
          try {
            await deletarProntuario(prontuario.id);
            return {
              sucesso: true,
              id: prontuario.id,
            };
          } catch (error) {
            return {
              sucesso: false,
              id: prontuario.id,
              mensagem:
                error?.response?.data?.mensagem || 'Erro ao excluir prontuário.',
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
              ? 'prontuário excluído com sucesso!'
              : 'prontuários excluídos com sucesso!'
          }`
        );
      } else if (sucessos.length > 0 && falhas.length > 0) {
        toast.success(
          `${sucessos.length} ${
            sucessos.length === 1 ? 'prontuário excluído' : 'prontuários excluídos'
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
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem ||
        'Erro ao excluir os prontuários selecionados.';

      toast.error(mensagem);
      console.error(error);
    } finally {
      setBulkDeleting(false);
    }
  };

  const prontuariosFiltrados = useMemo(() => {
    const termo = searchTerm.toLowerCase().trim();

    if (!termo) return prontuarios;

    return prontuarios.filter((prontuario) => {
      return (
        String(prontuario.id || '').includes(termo) ||
        (prontuario.diagnostico || '').toLowerCase().includes(termo) ||
        (prontuario.receita || '').toLowerCase().includes(termo) ||
        (prontuario.observacoes || '').toLowerCase().includes(termo) ||
        String(prontuario.consultaId || '').includes(termo) ||
        (prontuario.consulta?.paciente?.nome || '').toLowerCase().includes(termo) ||
        (prontuario.consulta?.medico?.nome || '').toLowerCase().includes(termo)
      );
    });
  }, [prontuarios, searchTerm]);

  const totalProntuarios = prontuarios.length;
  const totalSelecionados = selecionados.length;
  const totalComDiagnostico = prontuarios.filter((p) => (p.diagnostico || '').trim()).length;
  const totalConsultasDisponiveis = consultas.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">Prontuários</h1>
            <p className="text-sm text-gray-500">
              Gerencie prontuários, seleções em lote e registros clínicos com mais organização
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarDados}
            title="Recarregar lista"
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
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
            Novo Prontuário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumoCard
          titulo="Total de Prontuários"
          valor={totalProntuarios}
          descricao="Registros cadastrados"
          icon={FileText}
          cor="blue"
        />
        <ResumoCard
          titulo="Filtrados"
          valor={prontuariosFiltrados.length}
          descricao="Resultado da busca atual"
          icon={Search}
          cor="amber"
        />
        <ResumoCard
          titulo="Com Diagnóstico"
          valor={totalComDiagnostico}
          descricao="Prontuários preenchidos"
          icon={ClipboardList}
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
              placeholder="Buscar por ID, paciente, médico, diagnóstico, receita, observação ou consulta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              <span>
                {prontuariosFiltrados.length}{' '}
                {prontuariosFiltrados.length === 1 ? 'prontuário encontrado' : 'prontuários encontrados'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {totalConsultasDisponiveis > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                  <FileSearch className="w-3.5 h-3.5" />
                  {totalConsultasDisponiveis} consultas disponíveis
                </span>
              )}

              {totalSelecionados > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {totalSelecionados} selecionado{totalSelecionados > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-500">Carregando prontuários...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ProntuarioTable
            prontuarios={prontuariosFiltrados}
            onVisualizar={handleVisualizar}
            onEditar={handleEditar}
            onDeletar={handleConfirmarDelete}
            selecionados={selecionados}
            setSelecionados={setSelecionados}
          />
        </div>
      )}

      <ProntuarioFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setProntuarioEditando(null);
        }}
        prontuarioEditando={prontuarioEditando}
        onSalvar={handleSalvar}
        consultas={consultas}
      />

      <ProntuarioViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setProntuarioVisualizando(null);
        }}
        prontuario={prontuarioVisualizando}
      />

      <ProntuarioDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProntuarioDeletando(null);
        }}
        onConfirm={handleDeletar}
        prontuario={prontuarioDeletando}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => {
          if (bulkDeleting) return;
          setIsBulkDeleteModalOpen(false);
        }}
        onConfirm={handleExcluirSelecionados}
        title="Excluir prontuários"
        message={`Você deseja excluir ${selecionados.length} ${
          selecionados.length === 1 ? 'prontuário selecionado' : 'prontuários selecionados'
        }?`}
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

export default ProntuariosPage;