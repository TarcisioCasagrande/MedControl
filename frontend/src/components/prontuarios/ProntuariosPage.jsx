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
  Eye,
  Pencil,
} from 'lucide-react';

import {
  getProntuarios,
  criarProntuario,
  atualizarProntuario,
  deletarProntuario,
} from '../../services/prontuarioService';

import { getAgendamentos } from '../../services/agendamentoService';
import { useToast } from '../../hooks/useToast';

import ProntuarioFormModal from './ProntuariosFormModal';
import ProntuarioDeleteDialog from './ProntuariosDeleteDialog';
import ProntuarioViewModal from './ProntuarioViewModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function ProntuariosPage() {
  const [prontuarios, setProntuarios] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
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

      const [dadosProntuarios, dadosAgendamentos] = await Promise.all([
        getProntuarios(),
        getAgendamentos().catch(() => []),
      ]);

      setProntuarios(dadosProntuarios || []);
      setAgendamentos(dadosAgendamentos || []);
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

      setSelecionados((prev) =>
        prev.filter((id) => id !== prontuarioDeletando.id)
      );

      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem ||
        'Erro ao deletar o prontuário.';

      toast.error(mensagem);

      console.error('Erro ao deletar prontuário:', error);
    }
  }

  const prontuariosFiltrados = useMemo(() => {
    const termo = searchTerm.toLowerCase().trim();

    if (!termo) return prontuarios;

    return prontuarios.filter((prontuario) => {
      return (
        String(prontuario.id || '').includes(termo) ||
        (prontuario.diagnostico || '')
          .toLowerCase()
          .includes(termo) ||
        (prontuario.receita || '')
          .toLowerCase()
          .includes(termo) ||
        (prontuario.observacoes || '')
          .toLowerCase()
          .includes(termo) ||
        String(prontuario.agendamentoId || '').includes(termo) ||
        (
          prontuario.agendamento?.paciente?.nome || ''
        )
          .toLowerCase()
          .includes(termo) ||
        (
          prontuario.agendamento?.medico?.nome || ''
        )
          .toLowerCase()
          .includes(termo)
      );
    });
  }, [prontuarios, searchTerm]);

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Prontuários
              </h1>

              <p className="text-xs text-gray-500">
                Gerencie registros clínicos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={carregarDados}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? 'animate-spin' : ''
                }`}
              />

              Atualizar
            </button>

            <button
              onClick={handleNovo}
              className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Novo Prontuário
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Buscar prontuário..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="h-10 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
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

              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                      ID
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                      Paciente
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                      Médico
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                      Diagnóstico
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {prontuariosFiltrados.map((prontuario) => (
                    <tr
                      key={prontuario.id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        #{prontuario.id}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                        {prontuario.agendamento?.paciente?.nome ||
                          '-'}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {prontuario.agendamento?.medico?.nome ||
                          '-'}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {prontuario.diagnostico ||
                          'Não informado'}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">

                          <button
                            onClick={() =>
                              handleVisualizar(prontuario)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleEditar(prontuario)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleConfirmarDelete(prontuario)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
        agendamentos={agendamentos}
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
          setIsBulkDeleteModalOpen(false);
        }}
        onConfirm={() => {}}
        title="Excluir prontuários"
        message="Deseja continuar?"
        confirmText="Excluir"
      />
    </div>
  );
}

export default ProntuariosPage;