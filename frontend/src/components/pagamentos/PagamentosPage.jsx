import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  RefreshCw,
  CreditCard,
  Search,
  BadgeCheck,
  Clock3,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

import {
  getPagamentos,
  criarPagamento,
  atualizarPagamento,
  deletarPagamento,
} from '../../services/pagamentosService';

import { getAgendamentos } from '../../services/agendamentoService';
import { useToast } from '../../hooks/useToast';

import PagamentosTable from './PagamentosTable';
import PagamentoFormModal from './PagamentoFormModal';
import PagamentoViewModal from './PagamentoViewModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [pagamentoEditando, setPagamentoEditando] = useState(null);
  const [pagamentoVisualizando, setPagamentoVisualizando] = useState(null);
  const [pagamentoDeletando, setPagamentoDeletando] = useState(null);

  const toast = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  function normalizarLista(resposta) {
    if (Array.isArray(resposta)) {
      return resposta;
    }

    if (Array.isArray(resposta?.data)) {
      return resposta.data;
    }

    if (Array.isArray(resposta?.items)) {
      return resposta.items;
    }

    if (Array.isArray(resposta?.result)) {
      return resposta.result;
    }

    if (Array.isArray(resposta?.resultados)) {
      return resposta.resultados;
    }

    return [];
  }

  async function carregarDados() {
    try {
      setLoading(true);

      const [respostaPagamentos, respostaAgendamentos] = await Promise.all([
        getPagamentos(),
        getAgendamentos(),
      ]);

      setPagamentos(normalizarLista(respostaPagamentos));
      setAgendamentos(normalizarLista(respostaAgendamentos));
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);

      setPagamentos([]);
      setAgendamentos([]);

      toast?.error?.('Não foi possível carregar os pagamentos.');
    } finally {
      setLoading(false);
    }
  }

  function handleNovo() {
    setPagamentoEditando(null);
    setIsFormModalOpen(true);
  }

  function handleVisualizar(pagamento) {
    setPagamentoVisualizando(pagamento);
    setIsViewModalOpen(true);
  }

  function handleEditar(pagamento) {
    setPagamentoEditando(pagamento);
    setIsFormModalOpen(true);
  }

  async function handleSalvar(pagamento) {
    try {
      if (pagamentoEditando) {
        await atualizarPagamento(pagamento);
        toast?.success?.('Pagamento atualizado com sucesso!');
      } else {
        await criarPagamento(pagamento);
        toast?.success?.('Pagamento cadastrado com sucesso!');
      }

      setIsFormModalOpen(false);
      setPagamentoEditando(null);

      await carregarDados();
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);

      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar o pagamento.';

      toast?.error?.(mensagem);
    }
  }

  function handleConfirmarDelete(pagamento) {
    setPagamentoDeletando(pagamento);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeletar() {
    if (!pagamentoDeletando?.id) return;

    try {
      await deletarPagamento(pagamentoDeletando.id);

      toast?.success?.('Pagamento removido com sucesso!');

      setIsDeleteDialogOpen(false);
      setPagamentoDeletando(null);

      await carregarDados();
    } catch (error) {
      console.error('Erro ao deletar pagamento:', error);

      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao deletar o pagamento.';

      toast?.error?.(mensagem);
    }
  }

  const pagamentosSeguros = useMemo(() => {
    return Array.isArray(pagamentos) ? pagamentos : [];
  }, [pagamentos]);

  const agendamentosSeguros = useMemo(() => {
    return Array.isArray(agendamentos) ? agendamentos : [];
  }, [agendamentos]);

  const pagamentosFiltrados = useMemo(() => {
    const termo = String(searchTerm || '').toLowerCase().trim();

    if (!termo) {
      return pagamentosSeguros;
    }

    return pagamentosSeguros.filter((pagamento) => {
      const texto = `
        ${pagamento?.id || ''}
        ${pagamento?.agendamentoId || ''}
        ${pagamento?.statusPagamento || ''}
        ${pagamento?.formaPagamento || ''}
        ${pagamento?.agendamento?.paciente?.nome || ''}
        ${pagamento?.agendamento?.medico?.nome || ''}
        ${pagamento?.agendamento?.procedimento?.nome || ''}
        ${pagamento?.pacienteNome || ''}
        ${pagamento?.medicoNome || ''}
        ${pagamento?.procedimentoNome || ''}
      `.toLowerCase();

      return texto.includes(termo);
    });
  }, [pagamentosSeguros, searchTerm]);

  const totalPagamentos = pagamentosSeguros.length;

  const totalRecebido = pagamentosSeguros
    .filter((pagamento) => normalizarStatus(pagamento?.statusPagamento) === 'pago')
    .reduce((total, pagamento) => total + Number(pagamento?.valor || 0), 0);

  const totalPendente = pagamentosSeguros
    .filter((pagamento) => normalizarStatus(pagamento?.statusPagamento) === 'pendente')
    .reduce((total, pagamento) => total + Number(pagamento?.valor || 0), 0);

  const totalPagos = pagamentosSeguros.filter(
    (pagamento) => normalizarStatus(pagamento?.statusPagamento) === 'pago'
  ).length;

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-3 lg:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-gray-900">
                Pagamentos
              </h1>

              <p className="text-xs text-gray-500">
                Controle cobranças, recebimentos e status financeiro
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={carregarDados}
              className="flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              title="Recarregar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <button
              type="button"
              onClick={handleNovo}
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Novo Pagamento
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <ResumoCard
            titulo="Pagamentos"
            valor={totalPagamentos}
            descricao="Cadastrados"
            icon={CreditCard}
            cor="blue"
          />

          <ResumoCard
            titulo="Recebido"
            valor={formatarValor(totalRecebido)}
            descricao="Confirmados"
            icon={DollarSign}
            cor="green"
            compactoTexto
          />

          <ResumoCard
            titulo="Pendente"
            valor={formatarValor(totalPendente)}
            descricao="Em aberto"
            icon={Clock3}
            cor="amber"
            compactoTexto
          />

          <ResumoCard
            titulo="Pagos"
            valor={totalPagos}
            descricao="Quitados"
            icon={CheckCircle2}
            cor="violet"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm lg:px-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Buscar por ID, agendamento, paciente, médico, procedimento, status ou forma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm"
              />
            </div>

            <div className="flex min-h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-xs text-gray-600">
              <BadgeCheck className="mr-2 h-4 w-4 text-blue-500" />

              {pagamentosFiltrados.length}{' '}
              {pagamentosFiltrados.length === 1
                ? 'pagamento encontrado'
                : 'pagamentos encontrados'}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-3 text-sm text-gray-500">
                Carregando pagamentos...
              </span>
            </div>
          ) : (
            <PagamentosTable
              pagamentos={pagamentosFiltrados}
              onVisualizar={handleVisualizar}
              onEditar={handleEditar}
              onDeletar={handleConfirmarDelete}
            />
          )}
        </div>
      </div>

      <PagamentoFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setPagamentoEditando(null);
        }}
        pagamentoEditando={pagamentoEditando}
        onSalvar={handleSalvar}
        agendamentos={agendamentosSeguros}
        pagamentos={pagamentosSeguros}
      />

      <PagamentoViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setPagamentoVisualizando(null);
        }}
        pagamento={pagamentoVisualizando}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPagamentoDeletando(null);
        }}
        onConfirm={handleDeletar}
        title="Excluir pagamento"
        message={`Você deseja excluir o pagamento #${
          pagamentoDeletando?.id || ''
        }? Essa ação não poderá ser desfeita.`}
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
      box: 'border-blue-200 bg-blue-50',
      icon: 'bg-blue-100 text-blue-700',
      value: 'text-blue-900',
    },

    amber: {
      box: 'border-amber-200 bg-amber-50',
      icon: 'bg-amber-100 text-amber-700',
      value: 'text-amber-900',
    },

    green: {
      box: 'border-green-200 bg-green-50',
      icon: 'bg-green-100 text-green-700',
      value: 'text-green-900',
    },

    violet: {
      box: 'border-violet-200 bg-violet-50',
      icon: 'bg-violet-100 text-violet-700',
      value: 'text-violet-900',
    },
  };

  const estilo = cores[cor] || cores.blue;

  return (
    <div className={`rounded-xl border px-3 py-2 shadow-sm ${estilo.box}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`truncate font-black ${estilo.value} ${
              compactoTexto ? 'text-base' : 'text-lg'
            }`}
          >
            {valor}
          </p>

          <p className="truncate text-xs font-semibold text-gray-700">
            {titulo}
          </p>

          <p className="truncate text-[11px] text-gray-500">
            {descricao}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${estilo.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function normalizarStatus(status) {
  return String(status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default PagamentosPage;
