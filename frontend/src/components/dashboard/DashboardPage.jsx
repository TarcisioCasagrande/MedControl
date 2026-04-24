import { useEffect, useMemo, useState } from 'react';
import { getDashboard } from '../../services/dashboardService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Stethoscope,
  Users,
  CalendarDays,
  FileText,
  Wallet,
  Activity,
  ShieldPlus,
  Clock3,
  CircleDollarSign,
} from 'lucide-react';

const CORES_TIPO = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const CORES_STATUS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function DashboardPage() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      setCarregando(true);
      const res = await getDashboard();
      setDados(res);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setCarregando(false);
    }
  };

  const resumo = useMemo(() => {
    if (!dados) return null;

    const totalStatus = (dados.consultasPorStatus || []).reduce(
      (acc, item) => acc + (item.total || 0),
      0
    );

    const statusMaisFrequente =
      (dados.consultasPorStatus || []).length > 0
        ? [...dados.consultasPorStatus].sort((a, b) => (b.total || 0) - (a.total || 0))[0]
        : null;

    const tipoMaisFrequente =
      (dados.consultasPorTipo || []).length > 0
        ? [...dados.consultasPorTipo].sort((a, b) => (b.total || 0) - (a.total || 0))[0]
        : null;

    const ticketMedio =
      dados.totalConsultas && dados.totalConsultas > 0
        ? Number(dados.faturamentoTotal || 0) / Number(dados.totalConsultas || 1)
        : 0;

    return {
      totalStatus,
      statusMaisFrequente,
      tipoMaisFrequente,
      ticketMedio,
    };
  }, [dados]);

  if (carregando || !dados) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* CABEÇALHO */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-blue-100">Visão geral do sistema</p>
            <h1 className="mt-1 text-2xl font-bold">Dashboard ControlMed</h1>
            <p className="mt-2 text-sm text-slate-200">
              Acompanhe os principais números, faturamento e distribuição das consultas.
            </p>
          </div>

          <button
            onClick={carregar}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <Activity className="h-4 w-4" />
            Atualizar dashboard
          </button>
        </div>
      </div>

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumo
          titulo="Médicos"
          valor={dados.totalMedicos}
          icone={Stethoscope}
          cor="blue"
          descricao="Profissionais cadastrados"
        />

        <CardResumo
          titulo="Pacientes"
          valor={dados.totalPacientes}
          icone={Users}
          cor="emerald"
          descricao="Pacientes registrados"
        />

        <CardResumo
          titulo="Consultas"
          valor={dados.totalConsultas}
          icone={CalendarDays}
          cor="amber"
          descricao="Consultas no sistema"
        />

        <CardResumo
          titulo="Prontuários"
          valor={dados.totalProntuarios}
          icone={FileText}
          cor="violet"
          descricao="Registros clínicos salvos"
        />
      </div>

      {/* FAIXA DE DESTAQUES */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <CardDestaque
          titulo="Faturamento Total"
          valor={`R$ ${Number(dados.faturamentoTotal || 0).toFixed(2)}`}
          subtitulo="Valor acumulado registrado nas consultas"
          icone={Wallet}
          cor="green"
        />

        <CardDestaque
          titulo="Ticket Médio"
          valor={`R$ ${Number(resumo?.ticketMedio || 0).toFixed(2)}`}
          subtitulo="Média de faturamento por consulta"
          icone={CircleDollarSign}
          cor="blue"
        />

        <CardDestaque
          titulo="Volume em Status"
          valor={resumo?.totalStatus || 0}
          subtitulo="Soma total das consultas categorizadas"
          icone={ShieldPlus}
          cor="orange"
        />
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InsightCard
          titulo="Status mais frequente"
          valor={resumo?.statusMaisFrequente?.status || '—'}
          detalhe={
            resumo?.statusMaisFrequente
              ? `${resumo.statusMaisFrequente.total} consulta(s)`
              : 'Sem dados disponíveis'
          }
          icone={Activity}
          cor="blue"
        />

        <InsightCard
          titulo="Tipo mais comum"
          valor={resumo?.tipoMaisFrequente?.tipo || '—'}
          detalhe={
            resumo?.tipoMaisFrequente
              ? `${resumo.tipoMaisFrequente.total} atendimento(s)`
              : 'Sem dados disponíveis'
          }
          icone={Clock3}
          cor="violet"
        />

        <InsightCard
          titulo="Base de pacientes"
          valor={dados.totalPacientes || 0}
          detalhe="Total disponível para novos agendamentos"
          icone={Users}
          cor="emerald"
        />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">Consultas por Status</h3>
            <p className="mt-1 text-sm text-gray-500">
              Distribuição das consultas conforme o status registrado.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados.consultasPorStatus || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total">
                {(dados.consultasPorStatus || []).map((_, index) => (
                  <Cell key={`status-${index}`} fill={CORES_STATUS[index % CORES_STATUS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">Tipo de Atendimento</h3>
            <p className="mt-1 text-sm text-gray-500">
              Participação percentual dos tipos de atendimento cadastrados.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dados.consultasPorTipo || []}
                dataKey="total"
                nameKey="tipo"
                outerRadius={95}
                innerRadius={45}
                paddingAngle={3}
              >
                {(dados.consultasPorTipo || []).map((_, index) => (
                  <Cell key={`tipo-${index}`} fill={CORES_TIPO[index % CORES_TIPO.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function CardResumo({ titulo, valor, icone: Icone, cor, descricao }) {
  const estilos = {
    blue: {
      box: 'border-blue-200 bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      value: 'text-blue-900',
    },
    emerald: {
      box: 'border-emerald-200 bg-emerald-50',
      icon: 'bg-emerald-100 text-emerald-600',
      value: 'text-emerald-900',
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
    <div className={`rounded-2xl border p-5 shadow-sm ${estilo.box}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{titulo}</p>
          <h2 className={`mt-2 text-3xl font-bold ${estilo.value}`}>{valor}</h2>
          <p className="mt-2 text-xs text-gray-500">{descricao}</p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${estilo.icon}`}>
          <Icone className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function CardDestaque({ titulo, valor, subtitulo, icone: Icone, cor }) {
  const estilos = {
    green: 'from-emerald-600 to-green-700',
    blue: 'from-blue-600 to-indigo-700',
    orange: 'from-amber-500 to-orange-600',
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${estilos[cor]} p-5 text-white shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/80">{titulo}</p>
          <h3 className="mt-2 text-3xl font-bold">{valor}</h3>
          <p className="mt-2 text-sm text-white/80">{subtitulo}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <Icone className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function InsightCard({ titulo, valor, detalhe, icone: Icone, cor }) {
  const estilos = {
    blue: 'text-blue-600 bg-blue-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    violet: 'text-violet-600 bg-violet-100',
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{titulo}</p>
          <h4 className="mt-2 text-xl font-bold text-gray-900">{valor}</h4>
          <p className="mt-2 text-sm text-gray-500">{detalhe}</p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${estilos[cor]}`}>
          <Icone className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;