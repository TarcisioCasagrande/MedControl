import {
  Eye,
  Pencil,
  Trash2,
  User,
  CalendarPlus,
  Hash,
  Stethoscope,
  Phone,
  Mail,
} from 'lucide-react';

function MedicoTable({
  medicos,
  onVisualizar,
  onEditar,
  onDeletar,
  onAgendar,
  selecionados,
  setSelecionados,
}) {
  const todosSelecionados =
    medicos.length > 0 &&
    medicos.every((medico) => selecionados.includes(medico.id));

  const toggleSelecionado = (id) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      const ids = medicos.map((m) => m.id);
      setSelecionados(selecionados.filter((id) => !ids.includes(id)));
    } else {
      const ids = medicos.map((m) => m.id);
      setSelecionados([...new Set([...selecionados, ...ids])]);
    }
  };

  if (medicos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <User className="w-12 h-12 mb-3" />
        <p className="text-sm font-medium">Nenhum médico encontrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1250px]">
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
              Médico
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              CRM
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Especialidade
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Contato
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Turno
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Valor
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
              Agendar
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {medicos.map((medico) => (
            <tr key={medico.id} className="hover:bg-gray-50 transition-colors align-top">
              <td className="px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={selecionados.includes(medico.id)}
                  onChange={() => toggleSelecionado(medico.id)}
                />
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  <Hash className="w-3 h-3" />
                  {medico.id}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {medico.nome || '—'}
                  </span>
                  <span className="text-xs text-gray-400">Médico cadastrado</span>
                </div>
              </td>

              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{medico.crm || '—'}</span>
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  <Stethoscope className="w-3 h-3" />
                  {medico.especialidade || 'Não informada'}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {medico.telefone || '—'}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Mail className="w-3.5 h-3.5" />
                    {medico.email || '—'}
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {medico.turnoAtendimento || '—'}
                </span>
              </td>

              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-green-600">
                  {medico.valorConsulta !== undefined && medico.valorConsulta !== null
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(medico.valorConsulta))
                    : '—'}
                </span>
              </td>

              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onAgendar(medico)}
                  title="Agendar consulta"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Agendar
                </button>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onVisualizar(medico)}
                    title="Ver médico"
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditar(medico)}
                    title="Editar médico"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeletar(medico)}
                    title="Excluir médico"
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

export default MedicoTable;