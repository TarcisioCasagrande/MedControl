import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  ClipboardList,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  DollarSign,
} from 'lucide-react';

import {
  getProcedimentos,
  criarProcedimento,
  atualizarProcedimento,
  deletarProcedimento,
} from '../../services/procedimentosService';

import { useToast } from '../../hooks/useToast';

import ProcedimentosTable from './ProcedimentosTable';
import ProcedimentoFormModal from './ProcedimentoFormModal';
import ProcedimentoViewModal from './ProcedimentoViewModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function ProcedimentosPage() {
  const [procedimentos, setProcedimentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [procedimentoEditando, setProcedimentoEditando] = useState(null);
  const [procedimentoVisualizando, setProcedimentoVisualizando] = useState(null);
  const [procedimentoDeletando, setProcedimentoDeletando] = useState(null);

  const toast = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      const dados = await getProcedimentos();

      setProcedimentos(dados || []);
    } catch {
      toast.error('Não foi possível carregar os procedimentos.');
    } finally {
      setLoading(false);
    }
  }

  function handleNovo() {
    setProcedimentoEditando(null);
    setIsFormModalOpen(true);
  }

  function handleVisualizar(procedimento) {
    setProcedimentoVisualizando(procedimento);
    setIsViewModalOpen(true);
  }

  function handleEditar(procedimento) {
    setProcedimentoEditando(procedimento);
    setIsFormModalOpen(true);
  }

  async function handleSalvar(procedimento) {
    try {
      if (procedimentoEditando) {
        await atualizarProcedimento(procedimento);
        toast.success('Procedimento atualizado com sucesso!');
      } else {
        await criarProcedimento(procedimento);
        toast.success('Procedimento cadastrado com sucesso!');
      }

      setIsFormModalOpen(false);
      setProcedimentoEditando(null);

      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar o procedimento.';

      toast.error(mensagem);
    }
  }

  function handleConfirmarDelete(procedimento) {
    setProcedimentoDeletando(procedimento);
    setIsDeleteDialogOpen(true);
  }

  function obterMensagemBloqueioExclusao(procedimento) {
    const total = Number(procedimento?.totalAgendamentosVinculados || 0);

    if (total > 0) {
      return `Não é possível excluir este procedimento porque ele está vinculado a ${total} agendamento(s).`;
    }

    if (procedimento?.possuiAgendamentos) {
      return 'Não é possível excluir este procedimento porque ele está vinculado a agendamentos.';
    }

    return '';
  }

  async function handleDeletar() {
    const mensagemBloqueio = obterMensagemBloqueioExclusao(procedimentoDeletando);

    if (mensagemBloqueio) {
      toast.error(mensagemBloqueio);

      setIsDeleteDialogOpen(false);
      setProcedimentoDeletando(null);

      return;
    }

    try {
      await deletarProcedimento(procedimentoDeletando.id);

      toast.success('Procedimento removido com sucesso!');

      setIsDeleteDialogOpen(false);
      setProcedimentoDeletando(null);

      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem ||
        'Erro ao deletar o procedimento.';

      toast.error(mensagem);

      setIsDeleteDialogOpen(false);
      setProcedimentoDeletando(null);
    }
  }

  const procedimentosFiltrados = useMemo(() => {
    const termo = searchTerm.toLowerCase().trim();

    return procedimentos.filter((procedimento) => {
      const correspondeBusca =
        !termo ||
        String(procedimento.id || '').includes(termo) ||
        (procedimento.nome || '').toLowerCase().includes(termo) ||
        (procedimento.codigo || '').toLowerCase().includes(termo) ||
        String(procedimento.valor || '').includes(termo);

      const correspondeStatus =
        filtroStatus === 'Todos' ||
        (filtroStatus === 'Ativos' && procedimento.ativo) ||
        (filtroStatus === 'Inativos' && !procedimento.ativo);

      return correspondeBusca && correspondeStatus;
    });
  }, [procedimentos, searchTerm, filtroStatus]);

  const totalProcedimentos = procedimentos.length;
  const totalAtivos = procedimentos.filter((p) => p.ativo).length;
  const totalInativos = procedimentos.filter((p) => !p.ativo).length;

  const ticketMedio =
    totalProcedimentos > 0
      ? procedimentos.reduce(
          (total, item) => total + Number(item.valor || 0),
          0
        ) / totalProcedimentos
      : 0;

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Procedimentos
              </h1>
              <p className="text-xs text-gray-500">
                Cadastre e organize os procedimentos usados nos agendamentos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={carregarDados}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              title="Recarregar lista"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Atualizar
            </button>

            <button
              onClick={handleNovo}
              className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Novo Procedimento
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <ResumoCard
            titulo="Procedimentos"
            valor={totalProcedimentos}
            descricao="Cadastrados"
            icon={ClipboardList}
            cor="blue"
          />

          <ResumoCard
            titulo="Ativos"
            valor={totalAtivos}
            descricao="Disponíveis"
            icon={CheckCircle2}
            cor="green"
          />

          <ResumoCard
            titulo="Inativos"
            valor={totalInativos}
            descricao="Indisponíveis"
            icon={XCircle}
            cor="amber"
          />

          <ResumoCard
            titulo="Ticket médio"
            valor={formatarValor(ticketMedio)}
            descricao="Valor médio"
            icon={DollarSign}
            cor="violet"
            compactoTexto
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_170px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Buscar por ID, nome, código ou valor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos</option>
              <option value="Ativos">Ativos</option>
              <option value="Inativos">Inativos</option>
            </select>

            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
              <BadgeCheck className="mr-2 h-4 w-4 text-blue-500" />
              {procedimentosFiltrados.length}{' '}
              {procedimentosFiltrados.length === 1
                ? 'procedimento encontrado'
                : 'procedimentos encontrados'}
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-3 text-sm text-gray-500">
                Carregando procedimentos...
              </span>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <ProcedimentosTable
                procedimentos={procedimentosFiltrados}
                onVisualizar={handleVisualizar}
                onEditar={handleEditar}
                onDeletar={handleConfirmarDelete}
              />
            </div>
          )}
        </div>
      </div>

      <ProcedimentoFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setProcedimentoEditando(null);
        }}
        procedimentoEditando={procedimentoEditando}
        onSalvar={handleSalvar}
        procedimentos={procedimentos}
      />

      <ProcedimentoViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setProcedimentoVisualizando(null);
        }}
        procedimento={procedimentoVisualizando}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProcedimentoDeletando(null);
        }}
        onConfirm={handleDeletar}
        title="Excluir procedimento"
        message={`Você deseja excluir o procedimento "${
          procedimentoDeletando?.nome || ''
        }"? Essa ação não poderá ser desfeita.`}
        confirmText="Excluir"
      />
    </div>
  );
}

function ResumoCard({
  titulo,
  valor,
  descricao,
  icon: Icon,
  cor,
  compactoTexto,
}) {
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
            <h3
              className={`font-bold leading-none ${estilo.value} ${
                compactoTexto ? 'text-base' : 'text-xl'
              }`}
            >
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

export default ProcedimentosPage;