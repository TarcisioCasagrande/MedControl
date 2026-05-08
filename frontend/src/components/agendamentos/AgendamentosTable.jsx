import {
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  Hash,
  Clock3,
  UserRound,
  Stethoscope,
  ClipboardList,
  DollarSign,
} from 'lucide-react';

function AgendamentoTable({
  agendamentos,
  onVisualizar,
  onEditar,
  onDeletar,
  selecionados,
  setSelecionados,
}) {
  const todosSelecionados =
    agendamentos.length > 0 &&
    agendamentos.every((agendamento) => selecionados.includes(agendamento.id));

  function toggleSelecionado(id) {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  }

  function toggleSelecionarTodos() {
    const ids = agendamentos.map((agendamento) => agendamento.id);

    if (todosSelecionados) {
      setSelecionados(selecionados.filter((id) => !ids.includes(id)));
    } else {
      setSelecionados([...new Set([...selecionados, ...ids])]);
    }
  }

  if (agendamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-14 text-gray-400">
        <CalendarDays className="mb-3 h-10 w-10" />
        <p className="text-sm font-medium">Nenhum agendamento encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {agendamentos.map((agendamento) => (
          <AgendamentoCardMobile
            key={agendamento.id}
            agendamento={agendamento}
            selecionado={selecionados.includes(agendamento.id)}
            onSelecionar={() => toggleSelecionado(agendamento.id)}
            onVisualizar={onVisualizar}
            onEditar={onEditar}
            onDeletar={onDeletar}
          />
        ))}
      </div>

      <div className="hidden w-full overflow-hidden rounded-xl border border-gray-200 bg-white lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-[48px] px-2 py-3 text-center">
                <input
                  type="checkbox"
                  checked={todosSelecionados}
                  onChange={toggleSelecionarTodos}
                />
              </th>

              <th className="w-[90px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                ID
              </th>

              <th className="w-[140px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Data
              </th>

              <th className="w-[360px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Paciente
              </th>

              <th className="w-[220px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Médico
              </th>

              <th className="w-[280px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Procedimento
              </th>

              <th className="w-[170px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Status
              </th>

              <th className="w-[140px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Valor
              </th>

              <th className="w-[150px] px-3 py-3 text-center text-[11px] font-bold uppercase text-gray-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {agendamentos.map((agendamento) => (
              <tr key={agendamento.id} className="hover:bg-gray-50">
                <td className="px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(agendamento.id)}
                    onChange={() => toggleSelecionado(agendamento.id)}
                  />
                </td>

                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700">
                    <Hash className="h-3 w-3" />
                    {agendamento.id}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">
                      {formatarData(agendamento.dataAgendamento)}
                    </span>

                    <span className="text-[11px] text-gray-400">
                      {formatarHora(agendamento.dataAgendamento)}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <p className="truncate text-xs font-semibold text-gray-900">
                    {agendamento.paciente?.nome || '—'}
                  </p>
                </td>

                <td className="px-3 py-3">
                  <p className="truncate text-xs text-gray-700">
                    {agendamento.medico?.nome || '—'}
                  </p>
                </td>

                <td className="px-3 py-3">
                  <p className="truncate text-xs font-medium text-gray-800">
                    {agendamento.procedimento?.nome || '—'}
                  </p>
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center">
                    <StatusBadge status={agendamento.status} />
                  </div>
                </td>

                <td className="px-3 py-3">
                  <span className="whitespace-nowrap text-xs font-black text-green-600">
                    {formatarMoeda(agendamento.valorCobrado)}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <div className="flex justify-center gap-2">
                    <BotaoAcao onClick={() => onVisualizar(agendamento)} titulo="Visualizar">
                      <Eye className="h-4 w-4" />
                    </BotaoAcao>

                    <BotaoAcao onClick={() => onEditar(agendamento)} titulo="Editar">
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </BotaoAcao>

                    <BotaoAcao onClick={() => onDeletar(agendamento)} titulo="Excluir">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </BotaoAcao>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AgendamentoCardMobile({
  agendamento,
  selecionado,
  onSelecionar,
  onVisualizar,
  onEditar,
  onDeletar,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={selecionado} onChange={onSelecionar} />

          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700">
            <Hash className="h-3 w-3" />
            {agendamento.id}
          </span>
        </div>

        <StatusBadge status={agendamento.status} />
      </div>

      <div className="grid gap-2 text-xs">
        <LinhaMobile
          icone={Clock3}
          label="Data"
          valor={`${formatarData(agendamento.dataAgendamento)} às ${formatarHora(
            agendamento.dataAgendamento
          )}`}
        />

        <LinhaMobile
          icone={UserRound}
          label="Paciente"
          valor={agendamento.paciente?.nome || '—'}
        />

        <LinhaMobile
          icone={Stethoscope}
          label="Médico"
          valor={agendamento.medico?.nome || '—'}
        />

        <LinhaMobile
          icone={ClipboardList}
          label="Procedimento"
          valor={agendamento.procedimento?.nome || '—'}
        />

        <LinhaMobile
          icone={DollarSign}
          label="Valor"
          valor={formatarMoeda(agendamento.valorCobrado)}
        />
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
        <BotaoAcao onClick={() => onVisualizar(agendamento)} titulo="Visualizar">
          <Eye className="h-4 w-4" />
        </BotaoAcao>

        <BotaoAcao onClick={() => onEditar(agendamento)} titulo="Editar">
          <Pencil className="h-4 w-4 text-blue-600" />
        </BotaoAcao>

        <BotaoAcao onClick={() => onDeletar(agendamento)} titulo="Excluir">
          <Trash2 className="h-4 w-4 text-red-600" />
        </BotaoAcao>
      </div>
    </div>
  );
}

function LinhaMobile({ icone: Icone, label, valor }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2">
      <Icone className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-gray-400">{label}</p>
        <p className="break-words text-xs font-semibold text-gray-800">{valor}</p>
      </div>
    </div>
  );
}

function BotaoAcao({ children, onClick, titulo }) {
  return (
    <button
      type="button"
      title={titulo}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const estilo = obterEstiloStatus(status);

  return (
    <span
      className={`inline-flex max-w-full rounded-full px-2 py-1 text-[10px] font-bold uppercase leading-none ${estilo}`}
      title={status || 'Sem status'}
    >
      <span className="truncate">{formatarStatus(status)}</span>
    </span>
  );
}

function formatarStatus(status) {
  const valor = String(status || 'Sem status');

  if (valor.length <= 16) return valor;

  return `${valor.slice(0, 16)}...`;
}

function obterEstiloStatus(status) {
  const s = normalizarStatus(status);

  if (s === 'agendada' || s === 'agendado') {
    return 'bg-blue-100 text-blue-700';
  }

  if (s === 'confirmada' || s === 'confirmado') {
    return 'bg-sky-100 text-sky-700';
  }

  if (
    s === 'atendidorecepcao' ||
    s === 'atendidorecepção' ||
    s === 'atendido'
  ) {
    return 'bg-indigo-100 text-indigo-700';
  }

  if (s === 'emandamento' || s === 'ematendimento') {
    return 'bg-amber-100 text-amber-700';
  }

  if (s === 'concluida' || s === 'concluido' || s === 'finalizada') {
    return 'bg-green-100 text-green-700';
  }

  if (s === 'cancelada' || s === 'cancelado') {
    return 'bg-red-100 text-red-700';
  }

  if (s === 'faltou') {
    return 'bg-gray-200 text-gray-700';
  }

  return 'bg-gray-100 text-gray-700';
}

function normalizarStatus(status) {
  return String(status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '')
    .trim();
}

function formatarData(data) {
  if (!data) return '—';
  return new Date(data).toLocaleDateString('pt-BR');
}

function formatarHora(data) {
  if (!data) return '—';

  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default AgendamentoTable;
