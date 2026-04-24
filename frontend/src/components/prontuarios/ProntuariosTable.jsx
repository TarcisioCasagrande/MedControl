import { Eye, Pencil, Trash2, UserRound, FileText, Stethoscope } from 'lucide-react';

function ProntuarioTable({
  prontuarios,
  onVisualizar,
  onEditar,
  onDeletar,
  selecionados,
  setSelecionados,
}) {
  const todosSelecionados =
    prontuarios.length > 0 &&
    prontuarios.every((p) => selecionados.includes(p.id));

  const toggleSelecionado = (id) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      const ids = prontuarios.map((p) => p.id);
      setSelecionados(selecionados.filter((id) => !ids.includes(id)));
    } else {
      const ids = prontuarios.map((p) => p.id);
      const novos = [...new Set([...selecionados, ...ids])];
      setSelecionados(novos);
    }
  };

  if (prontuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <UserRound className="w-12 h-12 mb-3" />
        <p className="text-sm font-medium">Nenhum prontuário encontrado.</p>
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

            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ID
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Paciente
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Médico
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Diagnóstico
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Receita
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Observações
            </th>

            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {prontuarios.map((prontuario) => (
            <tr
              key={prontuario.id}
              className="hover:bg-gray-50 transition-colors align-top"
            >
              <td className="px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={selecionados.includes(prontuario.id)}
                  onChange={() => toggleSelecionado(prontuario.id)}
                />
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  <FileText className="w-3 h-3" />
                  #{prontuario.id}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {prontuario.consulta?.paciente?.nome || '—'}
                  </span>

                  {prontuario.consulta?.paciente?.id && (
                    <span className="text-xs text-gray-400">
                      Paciente #{prontuario.consulta.paciente.id}
                    </span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700">
                    {prontuario.consulta?.medico?.nome || '—'}
                  </span>

                  {prontuario.consulta?.medico?.id && (
                    <span className="text-xs text-gray-400">
                      Médico #{prontuario.consulta.medico.id}
                    </span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 max-w-[220px]">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-50 px-2 py-1 rounded-md">
                    <Stethoscope className="w-3 h-3" />
                    Diagnóstico
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {prontuario.diagnostico || '—'}
                  </p>
                </div>
              </td>

              <td className="px-6 py-4 max-w-[220px]">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                    <FileText className="w-3 h-3" />
                    Receita
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {prontuario.receita || '—'}
                  </p>
                </div>
              </td>

              <td className="px-6 py-4 max-w-[220px]">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                    <Eye className="w-3 h-3" />
                    Observações
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {prontuario.observacoes || '—'}
                  </p>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onVisualizar(prontuario)}
                    title="Ver prontuário"
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditar(prontuario)}
                    title="Editar prontuário"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeletar(prontuario)}
                    title="Excluir prontuário"
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

export default ProntuarioTable;