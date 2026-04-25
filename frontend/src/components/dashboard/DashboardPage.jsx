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
  Stethoscope,
  Users,
  CalendarDays,
  FileText,
  Wallet,
  RefreshCw,
  Filter,
  CircleDollarSign,
} from 'lucide-react';

const CORES = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function DashboardPage() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    try {
      setCarregando(true);
      const resposta = await getDashboard();
      setDados(resposta);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setCarregando(false);
    }
  }

  const statusOptions = useMemo(() => {
    if (!dados) return ['Todos'];
    return ['Todos', ...(dados.consultasPorStatus || []).map((item) => item.status)];
  }, [dados]);

  const tipoOptions = useMemo(() => {
    if (!dados) return ['Todos'];
    return ['Todos', ...(dados.consultasPorTipo || []).map((item) => item.tipo)];
  }, [dados]);

  const consultasPorStatusFiltradas = useMemo(() => {
    if (!dados) return [];

    if (filtroStatus === 'Todos') return dados.consultasPorStatus || [];

    return (dados.consultasPorStatus || []).filter(
      (item) => item.status === filtroStatus
    );
  }, [dados, filtroStatus]);

  const consultasPorTipoFiltradas = useMemo(() => {
    if (!dados) return [];

    if (filtroTipo === 'Todos') return dados.consultasPorTipo || [];

    return (dados.consultasPorTipo || []).filter(
      (item) => item.tipo === filtroTipo
    );
  }, [dados, filtroTipo]);

  const ticketMedio = useMemo(() => {
    if (!dados || !dados.totalConsultas) return 0;
    return Number(dados.faturamentoTotal || 0) / Number(dados.totalConsultas);
  }, [dados]);

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  if (carregando || !dados) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500">
              Visão geral dos principais dados do ControlMed
            </p>
          </div>

          <button
            onClick={carregarDashboard}
            className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-6 gap-3">
          <CardResumo
            titulo="Médicos"
            valor={dados.totalMedicos}
            icone={Stethoscope}
            cor="blue"
          />

          <CardResumo
            titulo="Pacientes"
            valor={dados.totalPacientes}
            icone={Users}
            cor="green"
          />

          <CardResumo
            titulo="Consultas"
            valor={dados.totalConsultas}
            icone={CalendarDays}
            cor="amber"
          />

          <CardResumo
            titulo="Prontuários"
            valor={dados.totalProntuarios}
            icone={FileText}
            cor="violet"
          />

          <CardResumo
            titulo="Faturamento"
            valor={formatarMoeda(dados.faturamentoTotal)}
            icone={Wallet}
            cor="green"
            grande
          />

          <CardResumo
            titulo="Ticket Médio"
            valor={formatarMoeda(ticketMedio)}
            icone={CircleDollarSign}
            cor="blue"
            grande
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Status
              </label>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="h-8 w-full rounded-lg border border-gray-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Tipo
              </label>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="h-8 w-full rounded-lg border border-gray-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                {tipoOptions.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-2 gap-3">
          <GraficoCard
            titulo="Consultas por Status"
            data={consultasPorStatusFiltradas}
            dataKey="status"
          />

          <GraficoCard
            titulo="Consultas por Tipo"
            data={consultasPorTipoFiltradas}
            dataKey="tipo"
          />
        </div>
      </div>
    </div>
  );
}

function CardResumo({ titulo, valor, icone: Icone, cor, grande }) {
  const estilos = {
    blue: {
      box: 'border-blue-200 bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      value: 'text-blue-900',
    },
    green: {
      box: 'border-green-200 bg-green-50',
      icon: 'bg-green-100 text-green-600',
      value: 'text-green-900',
    },
    amber: {
      box: 'border-amber-200 bg-amber-50',
      icon: 'bg-amber-100 text-amber-600',
      value: 'text-amber-900',
    },
    violet: {
      box: 'border-violet-200 bg-violet-50',
      icon: 'bg-violet-100 text-violet-600',
      value: 'text-violet-900',
    },
  };

  const estilo = estilos[cor] || estilos.blue;

  return (
    <div className={`rounded-xl border px-3 py-3 shadow-sm ${estilo.box}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs text-gray-600">{titulo}</p>
          <h2
            className={`mt-1 truncate font-bold ${estilo.value} ${
              grande ? 'text-lg' : 'text-2xl'
            }`}
          >
            {valor}
          </h2>
        </div>

        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${estilo.icon}`}
        >
          <Icone className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function GraficoCard({ titulo, data, dataKey }) {
  return (
    <div className="min-h-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{titulo}</h3>

      {data.length === 0 ? (
        <div className="flex h-full min-h-[260px] items-center justify-center rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500">Nenhum dado encontrado.</p>
        </div>
      ) : (
        <div className="h-[calc(100%-28px)] min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={dataKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]}>
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

export default DashboardPage;