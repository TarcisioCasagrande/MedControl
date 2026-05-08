import { useEffect, useMemo, useState } from 'react';
import { getDashboard } from '../../services/dashboardService';
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

const CORES = ['#0284c7', '#16a34a', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];

function DashboardPage() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [filtros, setFiltros] = useState({
    medicoId: '',
    status: '',
    tipoAtendimento: '',
    dataInicio: '',
    dataFim: '',
  });

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard(filtrosAtuais = filtros) {
    try {
      setCarregando(true);
      const resposta = await getDashboard(filtrosAtuais);
      setDados(resposta);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setCarregando(false);
    }
  }

  function aplicarFiltros() {
    carregarDashboard(filtros);
  }

  function limparFiltros() {
    const filtrosLimpos = {
      medicoId: '',
      status: '',
      tipoAtendimento: '',
      dataInicio: '',
      dataFim: '',
    };

    setFiltros(filtrosLimpos);
    carregarDashboard(filtrosLimpos);
  }

  const desempenhoPorMedico = useMemo(() => {
    return dados?.desempenhoPorMedico || [];
  }, [dados]);

  const aniversariantesDoDia = useMemo(() => {
    return dados?.aniversariantesDoDia || dados?.aniversariantes || [];
  }, [dados]);

  const faturamentoMes = Number(
    dados?.faturamentoMes ??
      dados?.faturamentoDoMes ??
      dados?.faturamentoTotal ??
      0
  );

  const consultasMes = Number(
    dados?.consultasMes ??
      dados?.consultasDoMes ??
      dados?.totalAgendamentos ??
      0
  );

  const consultasHoje = Number(
    dados?.consultasHoje ??
      dados?.agendamentosHoje ??
      0
  );

  const ticketMedio = Number(
    dados?.ticketMedio ??
      (consultasMes > 0 ? faturamentoMes / consultasMes : 0)
  );

  const minutosAtendidos = Number(dados?.minutosAtendidos || 0);

  if (carregando && !dados) {
    return (
      <div className="min-h-screen bg-gray-100 p-2">
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="flex flex-col gap-2">
        <Cabecalho carregando={carregando} onAtualizar={() => carregarDashboard()} />

        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          <CardIndicador
            titulo="Faturamento do mês"
            valor={formatarMoeda(faturamentoMes)}
            icone={Wallet}
            cor="green"
          />

          <CardIndicador
            titulo="Consultas no mês"
            valor={consultasMes}
            icone={CalendarDays}
            cor="blue"
          />

          <CardIndicador
            titulo="Ticket médio"
            valor={formatarMoeda(ticketMedio)}
            icone={CircleDollarSign}
            cor="violet"
          />

          <CardIndicador
            titulo="Consultas hoje"
            valor={consultasHoje}
            icone={Clock3}
            cor="amber"
          />
        </div>

        <FiltrosDashboard
          filtros={filtros}
          setFiltros={setFiltros}
          medicos={dados?.medicos || []}
          onAplicar={aplicarFiltros}
          onLimpar={limparFiltros}
        />

        <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:col-span-8">
            <GraficoCard
              titulo="Faturamento por médico"
              data={desempenhoPorMedico}
              dataKey="medico"
              valorKey="faturamento"
              tipo="moeda"
            />

            <GraficoCard
              titulo="Consultas por médico"
              data={desempenhoPorMedico}
              dataKey="medico"
              valorKey="atendimentos"
              tipo="numero"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:col-span-4 xl:grid-cols-1">
            <AniversariantesDoDia dados={aniversariantesDoDia} />

            <ResumoEstrategico
              faturamentoMes={faturamentoMes}
              consultasMes={consultasMes}
              ticketMedio={ticketMedio}
              minutosAtendidos={minutosAtendidos}
            />

            <RankingMedicos dados={desempenhoPorMedico} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Cabecalho({ carregando, onAtualizar }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
          <Activity className="h-4 w-4 text-sky-600" />
        </div>

        <div>
          <h1 className="text-sm font-black text-gray-900">Dashboard financeiro</h1>
          <p className="text-[11px] text-gray-500">
            Faturamento, consultas e desempenho médico
          </p>
        </div>
      </div>

      <button
        onClick={onAtualizar}
        className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 text-[11px] font-bold text-white transition hover:bg-sky-700"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${carregando ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
    </div>
  );
}

function CardIndicador({ titulo, valor, icone: Icone, cor }) {
  const estilos = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-gray-500">
            {titulo}
          </p>

          <h2 className="mt-0.5 truncate text-base font-black text-gray-900">
            {valor}
          </h2>
        </div>

        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${estilos[cor]}`}>
          <Icone className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function FiltrosDashboard({ filtros, setFiltros, medicos, onAplicar, onLimpar }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <Filter className="h-3.5 w-3.5 text-sky-600" />
        <h2 className="text-xs font-black text-gray-900">Filtros</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <CampoSelect
          label="Médico"
          value={filtros.medicoId}
          onChange={(valor) => setFiltros({ ...filtros, medicoId: valor })}
          icone={Stethoscope}
        >
          <option value="">Todos</option>
          {medicos.map((medico) => (
            <option key={medico.id} value={medico.id}>
              {medico.nome} {medico.crm ? `- CRM ${medico.crm}` : ''}
            </option>
          ))}
        </CampoSelect>

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

        <CampoData
          label="Data inicial"
          value={filtros.dataInicio}
          onChange={(valor) => setFiltros({ ...filtros, dataInicio: valor })}
        />

        <CampoData
          label="Data final"
          value={filtros.dataFim}
          onChange={(valor) => setFiltros({ ...filtros, dataFim: valor })}
        />

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onAplicar}
            className="mt-4 flex h-7 items-center justify-center gap-1 rounded-md bg-sky-600 px-2 text-[10px] font-bold text-white transition hover:bg-sky-700"
          >
            <Search className="h-3 w-3" />
            Aplicar
          </button>

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

function CampoSelect({ label, value, onChange, icone: Icone, children }) {
  return (
    <div>
      <label className="mb-0.5 flex items-center gap-1 text-[9px] font-bold uppercase text-gray-500">
        {Icone && <Icone className="h-2.5 w-2.5" />}
        {label}
      </label>

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

function CampoData({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-0.5 block text-[9px] font-bold uppercase text-gray-500">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full rounded-md border border-gray-300 bg-white px-2 text-[11px] outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
      />
    </div>
  );
}

function GraficoCard({ titulo, data, dataKey, valorKey, tipo }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="mb-1.5">
        <h3 className="text-xs font-black text-gray-900">{titulo}</h3>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[180px] items-center justify-center rounded-md bg-gray-50">
          <p className="text-xs text-gray-500">Nenhum dado encontrado.</p>
        </div>
      ) : (
        <div className="h-[180px] xl:h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey={dataKey}
                tick={{ fontSize: 8 }}
                interval={0}
                angle={-10}
                textAnchor="end"
                height={36}
              />
              <YAxis tick={{ fontSize: 8 }} width={42} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '11px',
                }}
                formatter={(value) => {
                  if (tipo === 'moeda') return formatarMoeda(value);
                  if (tipo === 'minutos') return `${value} min`;
                  return value;
                }}
              />
              <Bar dataKey={valorKey} radius={[5, 5, 0, 0]} maxBarSize={45}>
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

function AniversariantesDoDia({ dados }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-pink-50 text-pink-600">
          <Cake className="h-3.5 w-3.5" />
        </div>

        <div>
          <h3 className="text-xs font-black text-gray-900">Aniversariantes</h3>
          <p className="text-[10px] text-gray-500">Do dia</p>
        </div>
      </div>

      {dados.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-2 text-[11px] text-gray-500">
          Nenhum aniversariante hoje.
        </div>
      ) : (
        <div className="space-y-1.5">
          {dados.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sky-600">
                <User className="h-3.5 w-3.5" />
              </div>

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

function ResumoEstrategico({ faturamentoMes, consultasMes, ticketMedio, minutosAtendidos }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
        <h3 className="text-xs font-black text-gray-900">Resumo</h3>
      </div>

      <div className="space-y-1.5">
        <LinhaResumo label="Faturamento" valor={formatarMoeda(faturamentoMes)} />
        <LinhaResumo label="Consultas" valor={consultasMes} />
        <LinhaResumo label="Ticket médio" valor={formatarMoeda(ticketMedio)} />
        <LinhaResumo label="Minutos" valor={`${minutosAtendidos} min`} />
      </div>
    </div>
  );
}

function LinhaResumo({ label, valor }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 last:border-b-0 last:pb-0">
      <span className="text-[11px] text-gray-500">{label}</span>
      <strong className="text-[11px] text-gray-900">{valor}</strong>
    </div>
  );
}

function RankingMedicos({ dados }) {
  const ranking = [...dados].sort(
    (a, b) => Number(b.faturamento || 0) - Number(a.faturamento || 0)
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
        <div>
          <h3 className="text-xs font-black text-gray-900">Ranking</h3>
          <p className="text-[10px] text-gray-500">Por faturamento</p>
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-2 text-[11px] text-gray-500">
          Nenhum dado encontrado.
        </div>
      ) : (
        <div className="space-y-1.5">
          {ranking.map((item, index) => (
            <div
              key={`${item.medicoId || index}-${item.medico}`}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-gray-900">
                    #{index + 1} {item.medico}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {item.atendimentos || 0} consultas • {item.minutos || 0} min
                  </p>
                </div>

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

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default DashboardPage;