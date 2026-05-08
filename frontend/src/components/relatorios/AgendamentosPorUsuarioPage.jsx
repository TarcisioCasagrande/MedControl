import { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  Filter,
  CalendarDays,
  UserRound,
  Wallet,
  CheckCircle2,
  XCircle,
  Search,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';

import { getAgendamentosPorUsuario } from '../../services/relatoriosService';

function AgendamentosPorUsuarioPage() {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');

  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
  });

  useEffect(() => {
    carregarRelatorio();
  }, []);

  async function carregarRelatorio(filtrosAtuais = filtros) {
    try {
      setCarregando(true);
      const resposta = await getAgendamentosPorUsuario(filtrosAtuais);
      setDados(resposta || []);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      setDados([]);
    } finally {
      setCarregando(false);
    }
  }

  function aplicarFiltros() {
    carregarRelatorio(filtros);
  }

  function limparFiltros() {
    const filtrosLimpos = { dataInicio: '', dataFim: '' };

    setFiltros(filtrosLimpos);
    setBusca('');
    carregarRelatorio(filtrosLimpos);
  }

  const dadosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return dados;

    return dados.filter((item) =>
      [
        item.agendamentoId,
        item.paciente,
        item.medico,
        item.procedimento,
        item.status,
        item.criadoPor,
        item.perfilCriador,
      ]
        .join(' ')
        .toLowerCase()
        .includes(termo)
    );
  }, [dados, busca]);

  const totais = useMemo(() => {
    return dadosFiltrados.reduce(
      (acc, item) => {
        acc.totalAgendamentos += 1;

        if (normalizarStatus(item.status) === 'finalizado') {
          acc.finalizados += 1;
        }

        if (normalizarStatus(item.status) === 'cancelado') {
          acc.cancelados += 1;
        }

        acc.faturamento += Number(item.valor || 0);

        return acc;
      },
      {
        totalAgendamentos: 0,
        finalizados: 0,
        cancelados: 0,
        faturamento: 0,
      }
    );
  }, [dadosFiltrados]);

  return (
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100">
              <ClipboardList className="h-5 w-5 text-sky-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Auditoria de agendamentos
              </h1>
              <p className="text-xs text-gray-500">
                Veja cada agendamento, paciente, médico e o usuário que criou.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => carregarRelatorio()}
            className="flex h-9 items-center gap-2 rounded-lg bg-sky-600 px-3 text-xs font-semibold text-white transition hover:bg-sky-700"
          >
            <RefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <ResumoCard
            titulo="Agendamentos"
            valor={totais.totalAgendamentos}
            icon={CalendarDays}
            cor="blue"
          />

          <ResumoCard
            titulo="Finalizados"
            valor={totais.finalizados}
            icon={CheckCircle2}
            cor="green"
          />

          <ResumoCard
            titulo="Cancelados"
            valor={totais.cancelados}
            icon={XCircle}
            cor="red"
          />

          <ResumoCard
            titulo="Valor total"
            valor={formatarMoeda(totais.faturamento)}
            icon={Wallet}
            cor="emerald"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-bold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1.5fr_auto_auto]">
            <CampoData
              label="Data inicial"
              value={filtros.dataInicio}
              onChange={(valor) =>
                setFiltros({ ...filtros, dataInicio: valor })
              }
            />

            <CampoData
              label="Data final"
              value={filtros.dataFim}
              onChange={(valor) =>
                setFiltros({ ...filtros, dataFim: valor })
              }
            />

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Buscar
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Paciente, médico, procedimento, status ou usuário..."
                  className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={aplicarFiltros}
              className="mt-5 h-9 rounded-lg bg-sky-600 px-4 text-xs font-bold text-white transition hover:bg-sky-700"
            >
              Aplicar
            </button>

            <button
              type="button"
              onClick={limparFiltros}
              className="mt-5 h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {carregando ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Carregando relatório...
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <table className="w-full min-w-[1400px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Agendamento</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Médico</th>
                    <th className="px-4 py-3">Procedimento</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3">Criado por</th>
                    <th className="px-4 py-3">Perfil</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {dadosFiltrados.map((item) => (
                    <tr
                      key={item.agendamentoId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          #{item.agendamentoId}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-600">
                        {formatarDataHora(item.dataAgendamento)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
                            <UserRound className="h-4 w-4 text-sky-600" />
                          </div>

                          <div>
                            <p className="font-bold text-gray-900">
                              {item.paciente || 'Paciente não informado'}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Paciente #{item.pacienteId || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-sky-600" />
                          <span className="font-semibold text-gray-700">
                            {item.medico || 'Médico não informado'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">
                          {item.procedimento || 'Procedimento não informado'}
                        </p>

                        {item.codigoProcedimento && (
                          <p className="text-[11px] text-gray-500">
                            Código {item.codigoProcedimento}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-4 py-3 text-right font-black text-green-700">
                        {formatarMoeda(item.valor)}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">
                          {item.criadoPor || 'Não identificado'}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          ID: {item.criadoPorUsuarioId || '—'}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">
                          {item.perfilCriador || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {dadosFiltrados.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-4 py-10 text-center text-sm text-gray-500"
                      >
                        Nenhum agendamento encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CampoData({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </div>
  );
}

function ResumoCard({ titulo, valor, icon: Icon, cor }) {
  const cores = {
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
    red: {
      box: 'border-red-200 bg-red-50',
      icon: 'bg-red-100 text-red-600',
      value: 'text-red-900',
    },
    emerald: {
      box: 'border-emerald-200 bg-emerald-50',
      icon: 'bg-emerald-100 text-emerald-600',
      value: 'text-emerald-900',
    },
  };

  const estilo = cores[cor] || cores.blue;

  return (
    <div className={`rounded-xl border px-3 py-2 shadow-sm ${estilo.box}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-gray-600">
            {titulo}
          </p>

          <h2 className={`mt-1 truncate text-xl font-black ${estilo.value}`}>
            {valor}
          </h2>
        </div>

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${estilo.icon}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const valor = String(status || 'Sem status');
  const normalizado = normalizarStatus(valor);

  const estilos = {
    agendado: 'bg-blue-50 text-blue-700',
    atendidorecepcao: 'bg-amber-50 text-amber-700',
    emandamento: 'bg-cyan-50 text-cyan-700',
    finalizado: 'bg-green-50 text-green-700',
    cancelado: 'bg-red-50 text-red-700',
    semstatus: 'bg-gray-50 text-gray-600',
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[11px] font-bold ${
        estilos[normalizado] || estilos.semstatus
      }`}
    >
      {valor}
    </span>
  );
}

function normalizarStatus(status) {
  return String(status || 'semstatus')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarDataHora(valor) {
  if (!valor) return '—';

  return new Date(valor).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default AgendamentosPorUsuarioPage;