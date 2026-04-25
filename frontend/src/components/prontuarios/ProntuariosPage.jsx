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

  async function carregarDados() {
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
  }

  function handleNovo() {
    setProntuarioEditando(null);
    setIsFormModalOpen(true);
  }

  function handleEditar(prontuario) {
    setProntuarioEditando(prontuario);
    setIsFormModalOpen(true);
  }

  function handleVisualizar(prontuario) {
    setProntuarioVisualizando(prontuario);
    setIsViewModalOpen(true);
  }

  async function handleSalvar(prontuario) {
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
  }

  function handleConfirmarDelete(prontuario) {
    setProntuarioDeletando(prontuario);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeletar() {
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
  }

  function handleAbrirBulkDeleteModal() {
    if (selecionados.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  }

  async function handleExcluirSelecionados() {
    if (selecionados.length === 0) return;

    try {
      setBulkDeleting(true);

      const prontuariosSelecionados = prontuarios.filter((p) =>
        selecionados.includes(p.id)
      );

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
        'Erro ao excluir os prontuários selecionados.';

      toast.error(mensagem);
      console.error(error);
    } finally {
      setBulkDeleting(false);
    }
  }

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

  const totalComDiagnostico = prontuarios.filter((p) =>
    (p.diagnostico || '').trim()
  ).length;

  const totalConsultasDisponiveis = consultas.length;

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Prontuários</h1>
              <p className="text-xs text-gray-500">
                Gerencie registros clínicos, diagnósticos e receitas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={carregarDados}
              title="Recarregar lista"
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
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
              Novo Prontuário
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <ResumoCard
            titulo="Prontuários"
            valor={totalProntuarios}
            descricao="Cadastrados"
            icon={FileText}
            cor="blue"
          />

          <ResumoCard
            titulo="Filtrados"
            valor={prontuariosFiltrados.length}
            descricao="Resultado atual"
            icon={Search}
            cor="amber"
          />

          <ResumoCard
            titulo="Diagnóstico"
            valor={totalComDiagnostico}
            descricao="Preenchidos"
            icon={ClipboardList}
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
                placeholder="Buscar por ID, paciente, médico, diagnóstico, receita, observação ou consulta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
              <Stethoscope className="mr-2 h-4 w-4 text-blue-500" />

              {prontuariosFiltrados.length}{' '}
              {prontuariosFiltrados.length === 1
                ? 'prontuário encontrado'
                : 'prontuários encontrados'}

              {totalConsultasDisponiveis > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-1 text-[11px] font-medium text-violet-700">
                  <FileSearch className="h-3 w-3" />
                  {totalConsultasDisponiveis} consultas
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
                Carregando prontuários...
              </span>
            </div>
          ) : (
            <div className="h-full overflow-auto">
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
        </div>
      </div>

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
          selecionados.length === 1
            ? 'prontuário selecionado'
            : 'prontuários selecionados'
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

export default ProntuariosPage;