import {
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  Hash,
  UserRound,
  Stethoscope,
  Clock3,
} from 'lucide-react';

function ConsultaTable({
  consultas,
  onVisualizar,
  onEditar,
  onDeletar,
  selecionados,
  setSelecionados,
}) {
  const todosSelecionados =
    consultas.length > 0 &&
    consultas.every((consulta) => selecionados.includes(consulta.id));

  const toggleSelecionado = (id) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      const ids = consultas.map((c) => c.id);
      setSelecionados(selecionados.filter((id) => !ids.includes(id)));
    } else {
      const ids = consultas.map((c) => c.id);
      setSelecionados([...new Set([...selecionados, ...ids])]);
    }
  };

  if (consultas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <CalendarDays className="w-12 h-12 mb-3" />
        <p className="text-sm font-medium">Nenhuma consulta encontrada.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-center">
              <input
                type="checkbox"
                checked={todosSelecionados}
                onChange={toggleSelecionarTodos}
              />
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Paciente
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Médico
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Observações
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {consultas.map((consulta) => (
            <tr key={consulta.id} className="hover:bg-gray-50 transition-colors align-top">
              <td className="px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={selecionados.includes(consulta.id)}
                  onChange={() => toggleSelecionado(consulta.id)}
                />
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  <Hash className="w-3 h-3" />
                  {consulta.id}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {formatarData(consulta.dataConsulta)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock3 className="w-3 h-3" />
                    {formatarHora(consulta.dataConsulta)}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {consulta.paciente?.nome || '—'}
                  </span>
                  {consulta.paciente?.id && (
                    <span className="text-xs text-gray-400">
                      Paciente #{consulta.paciente.id}
                    </span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700">
                    {consulta.medico?.nome || '—'}
                  </span>
                  {consulta.medico?.id && (
                    <span className="text-xs text-gray-400">
                      Médico #{consulta.medico.id}
                    </span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4">
                <StatusBadge status={consulta.status} />
              </td>

              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-green-600">
                  {consulta.valorCobrado !== undefined && consulta.valorCobrado !== null
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(consulta.valorCobrado))
                    : '—'}
                </span>
              </td>

              <td className="px-6 py-4 max-w-[240px]">
                <span className="text-sm text-gray-500 line-clamp-2">
                  {consulta.observacoes || '—'}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onVisualizar(consulta)}
                    title="Ver consulta"
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditar(consulta)}
                    title="Editar consulta"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeletar(consulta)}
                    title="Excluir consulta"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const valor = formatarStatus(status);

  const estilos = {
    Agendada: 'bg-blue-100 text-blue-700',
    Pendente: 'bg-amber-100 text-amber-700',
    'Em andamento': 'bg-cyan-100 text-cyan-700',
    Finalizada: 'bg-green-100 text-green-700',
    Cancelada: 'bg-red-100 text-red-700',
    'Sem status': 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        estilos[valor] || estilos['Sem status']
      }`}
    >
      {valor}
    </span>
  );
}

function formatarStatus(status) {
  const valor = (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (valor === 'emandamento') return 'Em andamento';
  if (valor === 'finalizada' || valor === 'realizada' || valor === 'concluida') return 'Finalizada';
  if (valor === 'agendada') return 'Agendada';
  if (valor === 'pendente') return 'Pendente';
  if (valor === 'cancelada') return 'Cancelada';

  return 'Sem status';
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

export default ConsultaTable;