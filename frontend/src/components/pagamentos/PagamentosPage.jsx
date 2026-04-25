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

import { getConsultas } from '../../services/consultaService';
import { useToast } from '../../hooks/useToast';

import PagamentosTable from './PagamentosTable';
import PagamentoFormModal from './PagamentoFormModal';
import PagamentoViewModal from './PagamentoViewModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState([]);
  const [consultas, setConsultas] = useState([]);
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

  async function carregarDados() {
    try {
      setLoading(true);

      const [dadosPagamentos, dadosConsultas] = await Promise.all([
        getPagamentos(),
        getConsultas(),
      ]);

      setPagamentos(dadosPagamentos || []);
      setConsultas(dadosConsultas || []);
    } catch (error) {
      toast.error('Não foi possível carregar os pagamentos.');
      console.error(error);
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
        toast.success('Pagamento atualizado com sucesso!');
      } else {
        await criarPagamento(pagamento);
        toast.success('Pagamento cadastrado com sucesso!');
      }

      setIsFormModalOpen(false);
      setPagamentoEditando(null);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar o pagamento.';

      toast.error(mensagem);
      console.error(error);
    }
  }

  function handleConfirmarDelete(pagamento) {
    setPagamentoDeletando(pagamento);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeletar() {
    try {
      await deletarPagamento(pagamentoDeletando.id);

      toast.success('Pagamento removido com sucesso!');
      setIsDeleteDialogOpen(false);
      setPagamentoDeletando(null);

      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao deletar o pagamento.';

      toast.error(mensagem);
      console.error(error);
    }
  }

  const pagamentosFiltrados = useMemo(() => {
    const termo = searchTerm.toLowerCase().trim();

    if (!termo) return pagamentos;

    return pagamentos.filter((pagamento) => {
      return (
        String(pagamento.id || '').includes(termo) ||
        String(pagamento.consultaId || '').includes(termo) ||
        (pagamento.statusPagamento || '').toLowerCase().includes(termo) ||
        (pagamento.formaPagamento || '').toLowerCase().includes(termo) ||
        (pagamento.consulta?.paciente?.nome || '').toLowerCase().includes(termo) ||
        (pagamento.consulta?.medico?.nome || '').toLowerCase().includes(termo)
      );
    });
  }, [pagamentos, searchTerm]);

  const totalPagamentos = pagamentos.length;

  const totalRecebido = pagamentos
    .filter((pagamento) => pagamento.statusPagamento === 'Pago')
    .reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0);

  const totalPendente = pagamentos
    .filter((pagamento) => pagamento.statusPagamento === 'Pendente')
    .reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0);

  const totalPagos = pagamentos.filter(
    (pagamento) => pagamento.statusPagamento === 'Pago'
  ).length;

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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Pagamentos</h1>
              <p className="text-xs text-gray-500">
                Controle cobranças, recebimentos e status financeiro
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

            <button
              onClick={handleNovo}
              className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Novo Pagamento
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
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

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Buscar por ID, consulta, paciente, médico, status ou forma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
              <BadgeCheck className="mr-2 h-4 w-4 text-blue-500" />

              {pagamentosFiltrados.length}{' '}
              {pagamentosFiltrados.length === 1
                ? 'pagamento encontrado'
                : 'pagamentos encontrados'}
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-3 text-sm text-gray-500">
                Carregando pagamentos...
              </span>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <PagamentosTable
                pagamentos={pagamentosFiltrados}
                onVisualizar={handleVisualizar}
                onEditar={handleEditar}
                onDeletar={handleConfirmarDelete}
              />
            </div>
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
        consultas={consultas}
        pagamentos={pagamentos}
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
        message={`Você deseja excluir o pagamento #${pagamentoDeletando?.id}? Essa ação não poderá ser desfeita.`}
        confirmText="Excluir"
      />
    </div>
  );
}

function ResumoCard({ titulo, valor, descricao, icon: Icon, cor, compactoTexto }) {
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

export default PagamentosPage;