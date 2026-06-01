// src/components/agenda/AgendaFiltros.jsx
import { CalendarDays, RefreshCw, Search, X } from 'lucide-react';
import { formatarDataInput } from './utils/agendaFormatters';

function AgendaFiltros({
  busca,
  setBusca,
  statusFiltro,
  setStatusFiltro,
  medicoFiltro,
  alterarMedicoFiltro,
  dataReferencia,
  dataFiltroTodosMedicos,
  dataFinalTodosMedicos,
  alterarDiaAgenda,
  alterarDataFinalTodosMedicos,
  limparFiltros,
  carregarDados,
  loading,
  usuarioEhMedico,
  medicosVisiveis,
}) {
  const mostrandoTodosMedicos = !usuarioEhMedico && !medicoFiltro;

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100">
          <CalendarDays className="h-5 w-5 text-sky-700" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-black text-gray-900">Agenda</h1>
          <p className="truncate text-xs text-gray-500">
            {usuarioEhMedico
              ? 'Minha agenda médica'
              : medicoFiltro
                ? 'Agenda por dias do médico selecionado'
                : 'Agenda por dia de todos os médicos'}
          </p>
        </div>
      </div>

      <div
        className={`grid w-full grid-cols-1 gap-2 sm:grid-cols-2 ${
          mostrandoTodosMedicos ? 'lg:grid-cols-6 xl:max-w-6xl' : 'lg:grid-cols-5 xl:max-w-5xl'
        }`}
      >
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={usuarioEhMedico ? 'Buscar paciente, procedimento ou status...' : 'Buscar paciente, médico, procedimento...'}
            className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {!usuarioEhMedico ? (
          <select
            value={medicoFiltro}
            onChange={(e) => alterarMedicoFiltro(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Todos os médicos</option>
            {medicosVisiveis.map((medico) => (
              <option key={medico.id} value={medico.id}>
                {medico.nome}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex h-10 items-center rounded-xl border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-800">
            <span className="truncate">
              {medicosVisiveis[0]?.nome || 'Minha agenda'}
            </span>
          </div>
        )}

        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        >
          <option value="">Todos os status</option>
          <option value="Agendado">Agendado</option>
          <option value="AtendidoRecepcao">Atendido recepção</option>
          <option value="EmAndamento">Em atendimento</option>
          <option value="Finalizada">Finalizada</option>
          <option value="Cancelada">Cancelada</option>
          <option value="Livre">Livre</option>
        </select>

        <input
          type="date"
          title={mostrandoTodosMedicos ? 'Data inicial' : 'Data'}
          value={medicoFiltro ? formatarDataInput(dataReferencia) : dataFiltroTodosMedicos}
          onChange={(e) => alterarDiaAgenda(e.target.value)}
          className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />

        {mostrandoTodosMedicos && (
          <input
            type="date"
            title="Data final"
            value={dataFinalTodosMedicos}
            onChange={(e) => alterarDataFinalTodosMedicos(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={limparFiltros}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
        >
          <X className="h-4 w-4" />
          Limpar
        </button>

        <button
          onClick={carregarDados}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 text-xs font-bold text-white transition hover:bg-sky-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>
    </div>
  );
}

export default AgendaFiltros;
