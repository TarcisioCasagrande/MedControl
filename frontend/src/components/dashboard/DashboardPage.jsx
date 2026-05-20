// Página principal do sistema com indicadores e atalhos rápidos

// Importação dos hooks do React
import { useEffect, useMemo, useState } from 'react';

// Serviço responsável por buscar os dados do dashboard
import { getDashboard } from '../../services/dashboardService';

// Componentes de gráficos da biblioteca Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

// Ícones utilizados na interface
import {
  RefreshCw,
  Filter,
  Wallet,
  CalendarDays,
  CircleDollarSign,
  Cake,
  TrendingUp,
  Activity,
  Clock3,
  User,
  Search,
  X,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';

// Cores utilizadas nos gráficos
const CORES = ['#0284c7', '#16a34a', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];

function DashboardPage() {

  // Estado responsável por armazenar os dados do dashboard
  const [dados, setDados] = useState(null);

  // Estado de carregamento da página
  const [carregando, setCarregando] = useState(true);

  // Estados utilizados nos filtros do dashboard
  const [filtros, setFiltros] = useState({
    medicoId: '',
    status: '',
    tipoAtendimento: '',
    dataInicio: '',
    dataFim: '',
  });

  // Carrega os dados ao abrir a página
  useEffect(() => {
    carregarDashboard();
  }, []);

  // Função responsável por buscar os dados do dashboard na API
  async function carregarDashboard(filtrosAtuais = filtros) {
    try {

      // Ativa o estado de carregamento
      setCarregando(true);

      // Busca os dados do dashboard
      const resposta = await getDashboard(filtrosAtuais);

      // Atualiza os dados da tela
      setDados(resposta);

      
    } catch (error) {

      // Exibe erro no console caso falhe
      console.error('Erro ao carregar dashboard:', error);
    } finally {

      // Finaliza o carregamento
      setCarregando(false);
    }
  }

  // Aplica os filtros selecionados
  function aplicarFiltros() {
    carregarDashboard(filtros);
  }

  // Limpa todos os filtros aplicados
  function limparFiltros() {

    // Objeto com filtros zerados
    const filtrosLimpos = {
      medicoId: '',
      status: '',
      tipoAtendimento: '',
      dataInicio: '',
      dataFim: '',
    };

    // Atualiza os filtros na tela
    setFiltros(filtrosLimpos);

    // Recarrega os dados sem filtros
    carregarDashboard(filtrosLimpos);
  }

  // Lista de desempenho dos médicos
  const desempenhoPorMedico = useMemo(() => {
    return dados?.desempenhoPorMedico || [];
  }, [dados]);

  // Lista de aniversariantes do dia
  const aniversariantesDoDia = useMemo(() => {
    return dados?.aniversariantesDoDia || dados?.aniversariantes || [];
  }, [dados]);

  // Total faturado no mês
  const faturamentoMes = Number(
    dados?.faturamentoMes ??
      dados?.faturamentoDoMes ??
      dados?.faturamentoTotal ??
      0
  );

  // Quantidade de consultas realizadas no mês
  const consultasMes = Number(
    dados?.consultasMes ??
      dados?.consultasDoMes ??
      dados?.totalAgendamentos ??
      0
  );

  // Quantidade de consultas do dia
  const consultasHoje = Number(
    dados?.consultasHoje ??
      dados?.agendamentosHoje ??
      0
  );

  // Cálculo do ticket médio por consulta
  const ticketMedio = Number(
    dados?.ticketMedio ??
      (consultasMes > 0 ? faturamentoMes / consultasMes : 0)
  );

  // Total de minutos atendidos
  const minutosAtendidos = Number(dados?.minutosAtendidos || 0);

  // Exibe loading enquanto os dados estão sendo carregados
  if (carregando && !dados) {
    return (
      <div className="min-h-screen bg-gray-100 p-2">
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Renderização principal da página
  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="flex flex-col gap-2">

        {/* Cabeçalho principal */}
        <Cabecalho carregando={carregando} onAtualizar={() => carregarDashboard()} />

        {/* Cards de indicadores financeiros */}
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">

          {/* Card faturamento */}
          <CardIndicador
            titulo="Faturamento do mês"
            valor={formatarMoeda(faturamentoMes)}
            icone={Wallet}
            cor="green"
          />

          {/* Card consultas */}
          <CardIndicador
            titulo="Consultas no mês"
            valor={consultasMes}
            icone={CalendarDays}
            cor="blue"
          />

          {/* Card ticket médio */}
          <CardIndicador
            titulo="Ticket médio"
            valor={formatarMoeda(ticketMedio)}
            icone={CircleDollarSign}
            cor="violet"
          />

          {/* Card consultas de hoje */}
          <CardIndicador
            titulo="Consultas hoje"
            valor={consultasHoje}
            icone={Clock3}
            cor="amber"
          />
        </div>

        {/* Componente de filtros */}
        <FiltrosDashboard
          filtros={filtros}
          setFiltros={setFiltros}
          medicos={dados?.medicos || []}
          onAplicar={aplicarFiltros}
          onLimpar={limparFiltros}
        />

        {/* Área dos gráficos e resumos */}
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">

          {/* Gráficos principais */}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:col-span-8">

             {/* Gráfico de faturamento */}
            <GraficoCard
              titulo="Faturamento por médico"
              data={desempenhoPorMedico}
              dataKey="medico"
              valorKey="faturamento"
              tipo="moeda"
            />

            {/* Gráfico de consultas */}
            <GraficoCard
              titulo="Consultas por médico"
              data={desempenhoPorMedico}
              dataKey="medico"
              valorKey="atendimentos"
              tipo="numero"
            />
          </div>

          {/* Cards laterais */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:col-span-4 xl:grid-cols-1">

            {/* Lista de aniversariantes */}
            <AniversariantesDoDia dados={aniversariantesDoDia} />

            {/* Resumo estratégico */}
            <ResumoEstrategico
              faturamentoMes={faturamentoMes}
              consultasMes={consultasMes}
              ticketMedio={ticketMedio}
              minutosAtendidos={minutosAtendidos}
            />

            {/* Ranking dos médicos */}
            <RankingMedicos dados={desempenhoPorMedico} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente responsável pelo cabeçalho do dashboard
function Cabecalho({ carregando, onAtualizar }) {
  return (

    // Container principal do cabeçalho
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      
       {/* Área do título e ícone */}
      <div className="flex items-center gap-2">

        {/* Ícone principal */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
          <Activity className="h-4 w-4 text-sky-600" />
        </div>

        {/* Textos do cabeçalho */}
        <div>
          <h1 className="text-sm font-black text-gray-900">Dashboard financeiro</h1>
          <p className="text-[11px] text-gray-500">
            Faturamento, consultas e desempenho médico
          </p>
        </div>
      </div>

      {/* Botão de atualização */}
      <button
        onClick={onAtualizar}
        className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 text-[11px] font-bold text-white transition hover:bg-sky-700"
      >

        {/* Ícone com animação enquanto carrega */}
        <RefreshCw className={`h-3.5 w-3.5 ${carregando ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
    </div>
  );
}

// Card utilizado para exibir indicadores do dashboard
function CardIndicador({ titulo, valor, icone: Icone, cor }) {

  // Classes de estilo para cada cor do card
  const estilos = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">

      {/* Conteúdo do card */}
      <div className="flex items-center justify-between gap-2">

        {/* Área do texto */}
        <div className="min-w-0">

          {/* Título do indicador */}
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-gray-500">
            {titulo}
          </p>

          {/* Valor do indicador */}
          <h2 className="mt-0.5 truncate text-base font-black text-gray-900">
            {valor}
          </h2>
        </div>

        {/* Área do ícone */}
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${estilos[cor]}`}>
          <Icone className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

// Componente responsável pelos filtros do dashboard
function FiltrosDashboard({ filtros, setFiltros, medicos, onAplicar, onLimpar }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">

      {/* Cabeçalho da área de filtros */}
      <div className="mb-2 flex items-center gap-1.5">
        <Filter className="h-3.5 w-3.5 text-sky-600" />
        <h2 className="text-xs font-black text-gray-900">Filtros</h2>
      </div>

      {/* Grid contendo os filtros */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">

        {/* Filtro de médico */}
        <CampoSelect
          label="Médico"
          value={filtros.medicoId}
          onChange={(valor) => setFiltros({ ...filtros, medicoId: valor })}
          icone={Stethoscope}
        >
          <option value="">Todos</option>

          {/* Lista dinâmica de médicos */}
          {medicos.map((medico) => (
            <option key={medico.id} value={medico.id}>
              {medico.nome} {medico.crm ? `- CRM ${medico.crm}` : ''}
            </option>
          ))}
        </CampoSelect>

        {/* Filtro de status */}
        <CampoSelect
          label="Status"
          value={filtros.status}
          onChange={(valor) => setFiltros({ ...filtros, status: valor })}
          icone={ClipboardList}
        >
          <option value="">Todos</option>
          <option value="Agendada">Agendada</option>
          <option value="Confirmada">Confirmada</option>
          <option value="EmAtendimento">Em atendimento</option>
          <option value="Concluida">Concluída</option>
          <option value="Cancelada">Cancelada</option>
          <option value="Faltou">Faltou</option>
        </CampoSelect>

        {/* Filtro do tipo de atendimento */}
        <CampoSelect
          label="Tipo"
          value={filtros.tipoAtendimento}
          onChange={(valor) => setFiltros({ ...filtros, tipoAtendimento: valor })}
          icone={CalendarDays}
        >
          <option value="">Todos</option>
          <option value="Presencial">Presencial</option>
          <option value="Online">Online</option>
          <option value="Retorno">Retorno</option>
        </CampoSelect>

        {/* Campo de data inicial */}
        <CampoData
          label="Data inicial"
          value={filtros.dataInicio}
          onChange={(valor) => setFiltros({ ...filtros, dataInicio: valor })}
        />

        {/* Campo de data final */}
        <CampoData
          label="Data final"
          value={filtros.dataFim}
          onChange={(valor) => setFiltros({ ...filtros, dataFim: valor })}
        />

        {/* Botões dos filtros */}
        <div className="grid grid-cols-2 gap-1.5">
          
          {/* Botão aplicar filtros */}
          <button
            type="button"
            onClick={onAplicar}
            className="mt-4 flex h-7 items-center justify-center gap-1 rounded-md bg-sky-600 px-2 text-[10px] font-bold text-white transition hover:bg-sky-700"
          >
            <Search className="h-3 w-3" />
            Aplicar
          </button>

          {/* Botão limpar filtros */}
          <button
            type="button"
            onClick={onLimpar}
            className="mt-4 flex h-7 items-center justify-center gap-1 rounded-md border border-gray-300 px-2 text-[10px] font-bold text-gray-600 transition hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}

// Campo select reutilizável
function CampoSelect({ label, value, onChange, icone: Icone, children }) {
  return (
    <div>

       {/* Label do campo */}
      <label className="mb-0.5 flex items-center gap-1 text-[9px] font-bold uppercase text-gray-500">
        {Icone && <Icone className="h-2.5 w-2.5" />}
        {label}
      </label>

      {/* Select do campo */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full rounded-md border border-gray-300 bg-white px-2 text-[11px] outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
      >
        {children}
      </select>
    </div>
  );
}

// Campo de data reutilizável
function CampoData({ label, value, onChange }) {
  return (
    <div>

      {/* Label do campo */}
      <label className="mb-0.5 block text-[9px] font-bold uppercase text-gray-500">
        {label}
      </label>

      {/* Input de data para filtro do dashboard */}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full rounded-md border border-gray-300 bg-white px-2 text-[11px] outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
      />
    </div>
  );
}

/* =========================================================
   COMPONENTE: CARD DE GRÁFICO
   Exibe gráficos de barras reutilizáveis
========================================================= */
function GraficoCard({ titulo, data, dataKey, valorKey, tipo }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      
      {/* Título do gráfico */}
      <div className="mb-1.5">
        <h3 className="text-xs font-black text-gray-900">{titulo}</h3>
      </div>

      {/* Caso não existam dados */}
      {data.length === 0 ? (
        <div className="flex h-[180px] items-center justify-center rounded-md bg-gray-50">
          <p className="text-xs text-gray-500">Nenhum dado encontrado.</p>
        </div>
      ) : (
        
        /* Área do gráfico */
        <div className="h-[180px] xl:h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            
            {/* Gráfico de barras */}
            <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              
              {/* Grade horizontal */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              
              {/* Eixo X */}
              <XAxis
                dataKey={dataKey}
                tick={{ fontSize: 8 }}
                interval={0}
                angle={-10}
                textAnchor="end"
                height={36}
              />
              
              {/* Eixo Y */}
              <YAxis tick={{ fontSize: 8 }} width={42} />
              
              {/* Tooltip ao passar mouse */}
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '11px',
                }}
                formatter={(value) => {
                  
                  // Formata valores monetários
                  if (tipo === 'moeda') return formatarMoeda(value);
                  
                  // Formata minutos
                  if (tipo === 'minutos') return `${value} min`;
                  return value;
                }}
              />
              
              {/* Barras do gráfico */}
              <Bar dataKey={valorKey} radius={[5, 5, 0, 0]} maxBarSize={45}>
                
                {/* Aplica cores diferentes nas barras */}
                {data.map((_, index) => (
                  <Cell key={index} fill={CORES[index % CORES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COMPONENTE: ANIVERSARIANTES DO DIA
========================================================= */
function AniversariantesDoDia({ dados }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      
      {/* Cabeçalho */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-pink-50 text-pink-600">
          <Cake className="h-3.5 w-3.5" />
        </div>

        <div>
          <h3 className="text-xs font-black text-gray-900">Aniversariantes</h3>
          <p className="text-[10px] text-gray-500">Do dia</p>
        </div>
      </div>

      {/* Caso não existam aniversariantes */}
      {dados.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-2 text-[11px] text-gray-500">
          Nenhum aniversariante hoje.
        </div>
      ) : (
        
        /* Lista de aniversariantes */
        <div className="space-y-1.5">
          {dados.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2"
            >
              
              {/* Ícone do paciente */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sky-600">
                <User className="h-3.5 w-3.5" />
              </div>

              {/* Dados do paciente */}
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-gray-900">
                  {item.nome || item.paciente || 'Paciente'}
                </p>
                <p className="text-[10px] text-gray-500">
                  {item.telefone || item.celular || 'Sem telefone'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COMPONENTE: RESUMO ESTRATÉGICO
========================================================= */
function ResumoEstrategico({ faturamentoMes, consultasMes, ticketMedio, minutosAtendidos }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      
      {/* Cabeçalho */}
      <div className="mb-2 flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
        <h3 className="text-xs font-black text-gray-900">Resumo</h3>
      </div>

      {/* Linhas do resumo */}
      <div className="space-y-1.5">
        <LinhaResumo label="Faturamento" valor={formatarMoeda(faturamentoMes)} />
        <LinhaResumo label="Consultas" valor={consultasMes} />
        <LinhaResumo label="Ticket médio" valor={formatarMoeda(ticketMedio)} />
        <LinhaResumo label="Tempo de atendimento" valor={`${minutosAtendidos} min`} />
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTE: LINHA DO RESUMO
========================================================= */
function LinhaResumo({ label, valor }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 last:border-b-0 last:pb-0">
      
      {/* Nome do indicador */}
      <span className="text-[11px] text-gray-500">{label}</span>
      
      {/* Valor do indicador */}
      <strong className="text-[11px] text-gray-900">{valor}</strong>
    </div>
  );
}

/* =========================================================
   COMPONENTE: RANKING DOS MÉDICOS
========================================================= */
function RankingMedicos({ dados }) {
  
  // Ordena médicos por faturamento
  const ranking = [...dados].sort(
    (a, b) => Number(b.faturamento || 0) - Number(a.faturamento || 0)
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      
      {/* Cabeçalho */}
      <div className="mb-2 flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
        <div>
          <h3 className="text-xs font-black text-gray-900">Ranking</h3>
          <p className="text-[10px] text-gray-500">Por faturamento</p>
        </div>
      </div>

      {/* Caso não existam dados */}
      {ranking.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-2 text-[11px] text-gray-500">
          Nenhum dado encontrado.
        </div>
      ) : (
        
         /* Lista de ranking */
        <div className="space-y-1.5">
          {ranking.map((item, index) => (
            <div
              key={`${item.medicoId || index}-${item.medico}`}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                
                {/* Informações do médico */}
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-gray-900">
                    #{index + 1} {item.medico}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {item.atendimentos || 0} consultas • {item.minutos || 0} min
                  </p>
                </div>

                {/* Faturamento */}
                <p className="shrink-0 text-[11px] font-black text-green-700">
                  {formatarMoeda(item.faturamento)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FUNÇÃO AUXILIAR: FORMATAR MOEDA
========================================================= */
function formatarMoeda(valor) {
  
  // Converte valor para moeda brasileira
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/* =========================================================
   EXPORTAÇÃO DA PÁGINA
========================================================= */
export default DashboardPage;