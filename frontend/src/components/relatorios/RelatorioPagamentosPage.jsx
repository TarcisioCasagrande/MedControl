import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  DollarSign,
  Filter,
  RefreshCw,
  Search,
  UserRound,
  Wallet,
} from 'lucide-react';
import { getPagamentos } from '../../services/pagamentosService';

function RelatorioPagamentosPage() {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [formaFiltro, setFormaFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const dados = await getPagamentos();
      setPagamentos(dados || []);
    } catch (error) {
      console.error('Erro ao carregar relatório de pagamentos:', error);
    } finally {
      setLoading(false);
    }
  }

  const pagamentosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return pagamentos.filter((pagamento) => {
      const dataPagamento = formatarDataInput(
        pagamento.dataPagamento || pagamento.dataCadastro || pagamento.consulta?.dataConsulta
      );

      const bateBusca =
        !termo ||
        String(pagamento.id || '').includes(termo) ||
        String(pagamento.consultaId || '').includes(termo) ||
        (pagamento.consulta?.paciente?.nome || '').toLowerCase().includes(termo) ||
        (pagamento.consulta?.medico?.nome || '').toLowerCase().includes(termo);

      const bateStatus = statusFiltro
        ? pagamento.statusPagamento === statusFiltro
        : true;

      const bateForma = formaFiltro
        ? pagamento.formaPagamento === formaFiltro
        : true;

      const bateDataInicio = dataInicio ? dataPagamento >= dataInicio : true;
      const bateDataFim = dataFim ? dataPagamento <= dataFim : true;

      return bateBusca && bateStatus && bateForma && bateDataInicio && bateDataFim;
    });
  }, [pagamentos, busca, statusFiltro, formaFiltro, dataInicio, dataFim]);

  const formasPagamento = useMemo(() => {
    return [...new Set(pagamentos.map((p) => p.formaPagamento).filter(Boolean))];
  }, [pagamentos]);

  const resumo = useMemo(() => {
    const total = pagamentosFiltrados.reduce((soma, p) => soma + Number(p.valor || 0), 0);

    const recebido = pagamentosFiltrados
      .filter((p) => p.statusPagamento === 'Pago')
      .reduce((soma, p) => soma + Number(p.valor || 0), 0);

    const pendente = pagamentosFiltrados
      .filter((p) => p.statusPagamento === 'Pendente')
      .reduce((soma, p) => soma + Number(p.valor || 0), 0);

    const pagos = pagamentosFiltrados.filter((p) => p.statusPagamento === 'Pago').length;

    return {
      total,
      recebido,
      pendente,
      pagos,
      registros: pagamentosFiltrados.length,
    };
  }, [pagamentosFiltrados]);

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Relatório de Pagamentos</h1>
              <p className="text-xs text-gray-500">
                Analise valores recebidos, pendentes e formas de pagamento
              </p>
            </div>
          </div>

          <button
            onClick={carregarDados}
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <ResumoCard titulo="Registros" valor={resumo.registros} descricao="Pagamentos" icon={CreditCard} cor="blue" />
          <ResumoCard titulo="Total" valor={formatarMoeda(resumo.total)} descricao="No filtro" icon={DollarSign} cor="violet" compacto />
          <ResumoCard titulo="Recebido" valor={formatarMoeda(resumo.recebido)} descricao="Pago" icon={BadgeCheck} cor="green" compacto />
          <ResumoCard titulo="Pendente" valor={formatarMoeda(resumo.pendente)} descricao="Em aberto" icon={CalendarDays} cor="amber" compacto />
          <ResumoCard titulo="Pagos" valor={resumo.pagos} descricao="Confirmados" icon={BadgeCheck} cor="green" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar..."
                className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            <select
              value={formaFiltro}
              onChange={(e) => setFormaFiltro(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as formas</option>
              {formasPagamento.map((forma) => (
                <option key={forma} value={forma}>
                  {forma}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[70px_1fr_1fr_130px_120px_120px] border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500">
            <span>ID</span>
            <span>Paciente</span>
            <span>Médico</span>
            <span>Forma</span>
            <span>Status</span>
            <span>Valor</span>
          </div>

          <div className="h-full overflow-auto pb-10">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-gray-500">
                Carregando relatório...
              </div>
            ) : pagamentosFiltrados.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-gray-500">
                Nenhum pagamento encontrado.
              </div>
            ) : (
              pagamentosFiltrados.map((pagamento) => (
                <div
                  key={pagamento.id}
                  className="grid grid-cols-[70px_1fr_1fr_130px_120px_120px] items-center border-b border-gray-100 px-4 py-3 text-xs hover:bg-gray-50"
                >
                  <span className="font-semibold text-blue-700">#{pagamento.id}</span>

                  <span className="flex items-center gap-2 truncate font-medium text-gray-800">
                    <UserRound className="h-4 w-4 text-gray-400" />
                    {pagamento.consulta?.paciente?.nome || 'Não informado'}
                  </span>

                  <span className="truncate text-gray-700">
                    {pagamento.consulta?.medico?.nome || 'Não informado'}
                  </span>

                  <span>{pagamento.formaPagamento || '—'}</span>

                  <span>
                    <StatusBadge status={pagamento.statusPagamento} />
                  </span>

                  <span className="font-bold text-green-700">
                    {formatarMoeda(pagamento.valor)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor, descricao, icon: Icon, cor, compacto }) {
  const cores = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 shadow-sm ${cores[cor] || cores.blue}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-600">{titulo}</p>
          <h3 className={`truncate font-bold leading-none ${compacto ? 'text-base' : 'text-xl'}`}>
            {valor}
          </h3>
          <p className="mt-1 text-[11px] text-gray-500">{descricao}</p>
        </div>
        <Icon className="h-5 w-5 flex-shrink-0" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    Pago: 'bg-green-100 text-green-700',
    Pendente: 'bg-amber-100 text-amber-700',
    Cancelado: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${classes[status] || 'bg-gray-100 text-gray-700'}`}>
      {status || 'Sem status'}
    </span>
  );
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarDataInput(data) {
  if (!data) return '';
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export default RelatorioPagamentosPage;