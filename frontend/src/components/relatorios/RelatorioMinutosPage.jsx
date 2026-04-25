import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  Stethoscope,
  Timer,
  UserRound,
} from 'lucide-react';
import { getConsultas } from '../../services/consultaService';

function RelatorioMinutosPage() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const dados = await getConsultas();
      setConsultas(dados || []);
    } catch (error) {
      console.error('Erro ao carregar relatório de minutos:', error);
    } finally {
      setLoading(false);
    }
  }

  const consultasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return consultas
      .filter((consulta) => consulta.dataInicioAtendimento && consulta.dataFimAtendimento)
      .filter((consulta) => {
        const dataConsulta = formatarDataInput(consulta.dataConsulta);

        const bateBusca =
          !termo ||
          String(consulta.id || '').includes(termo) ||
          (consulta.paciente?.nome || '').toLowerCase().includes(termo) ||
          (consulta.medico?.nome || '').toLowerCase().includes(termo);

        const bateDataInicio = dataInicio ? dataConsulta >= dataInicio : true;
        const bateDataFim = dataFim ? dataConsulta <= dataFim : true;

        const bateStatus = statusFiltro
          ? normalizarStatus(consulta.status) === normalizarStatus(statusFiltro)
          : true;

        return bateBusca && bateDataInicio && bateDataFim && bateStatus;
      });
  }, [consultas, busca, dataInicio, dataFim, statusFiltro]);

  const resumo = useMemo(() => {
    const totalMinutos = consultasFiltradas.reduce((total, consulta) => {
      return total + calcularMinutos(consulta.dataInicioAtendimento, consulta.dataFimAtendimento);
    }, 0);

    const totalConsultas = consultasFiltradas.length;
    const media = totalConsultas > 0 ? totalMinutos / totalConsultas : 0;

    return {
      totalMinutos,
      totalConsultas,
      media,
      horas: totalMinutos / 60,
    };
  }, [consultasFiltradas]);

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <Timer className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Relatório de Minutos Atendidos</h1>
              <p className="text-xs text-gray-500">
                Acompanhe o tempo real de atendimento das consultas finalizadas
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

        <div className="grid grid-cols-4 gap-3">
          <ResumoCard titulo="Consultas" valor={resumo.totalConsultas} descricao="Com atendimento" icon={CalendarDays} cor="blue" />
          <ResumoCard titulo="Minutos" valor={Math.round(resumo.totalMinutos)} descricao="Tempo total" icon={Clock3} cor="green" />
          <ResumoCard titulo="Horas" valor={resumo.horas.toFixed(1)} descricao="Equivalente total" icon={Activity} cor="violet" />
          <ResumoCard titulo="Média" valor={`${Math.round(resumo.media)} min`} descricao="Por consulta" icon={Timer} cor="amber" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por ID, paciente ou médico..."
                className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

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

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="Finalizada">Finalizada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="EmAndamento">Em andamento</option>
            </select>
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[80px_1fr_1fr_130px_130px_110px] border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500">
            <span>ID</span>
            <span>Paciente</span>
            <span>Médico</span>
            <span>Início</span>
            <span>Fim</span>
            <span>Minutos</span>
          </div>

          <div className="h-full overflow-auto pb-10">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-gray-500">
                Carregando relatório...
              </div>
            ) : consultasFiltradas.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-gray-500">
                Nenhum atendimento encontrado.
              </div>
            ) : (
              consultasFiltradas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="grid grid-cols-[80px_1fr_1fr_130px_130px_110px] items-center border-b border-gray-100 px-4 py-3 text-xs hover:bg-gray-50"
                >
                  <span className="font-semibold text-blue-700">#{consulta.id}</span>

                  <span className="flex items-center gap-2 truncate font-medium text-gray-800">
                    <UserRound className="h-4 w-4 text-gray-400" />
                    {consulta.paciente?.nome || 'Não informado'}
                  </span>

                  <span className="flex items-center gap-2 truncate text-gray-700">
                    <Stethoscope className="h-4 w-4 text-gray-400" />
                    {consulta.medico?.nome || 'Não informado'}
                  </span>

                  <span>{formatarHora(consulta.dataInicioAtendimento)}</span>
                  <span>{formatarHora(consulta.dataFimAtendimento)}</span>

                  <span className="font-bold text-green-700">
                    {calcularMinutos(consulta.dataInicioAtendimento, consulta.dataFimAtendimento)} min
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

function ResumoCard({ titulo, valor, descricao, icon: Icon, cor }) {
  const cores = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 shadow-sm ${cores[cor] || cores.blue}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-gray-600">{titulo}</p>
          <h3 className="text-xl font-bold leading-none">{valor}</h3>
          <p className="mt-1 text-[11px] text-gray-500">{descricao}</p>
        </div>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function calcularMinutos(inicio, fim) {
  if (!inicio || !fim) return 0;
  const diff = new Date(fim) - new Date(inicio);
  if (Number.isNaN(diff) || diff < 0) return 0;
  return Math.round(diff / 60000);
}

function formatarHora(data) {
  if (!data) return '—';
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarDataInput(data) {
  if (!data) return '';
  const d = new Date(data);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function normalizarStatus(status) {
  return (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default RelatorioMinutosPage;