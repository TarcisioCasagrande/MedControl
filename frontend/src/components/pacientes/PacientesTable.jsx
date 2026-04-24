import { Eye, Pencil, Trash2, UserRound, Hash, Phone, Mail } from 'lucide-react';

function PacienteTable({
  pacientes,
  onVisualizar,
  onEditar,
  onDeletar,
  selecionados,
  setSelecionados,
}) {
  const todosSelecionados =
    pacientes.length > 0 &&
    pacientes.every((paciente) => selecionados.includes(paciente.id));

  const toggleSelecionado = (id) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      const ids = pacientes.map((p) => p.id);
      setSelecionados(selecionados.filter((id) => !ids.includes(id)));
    } else {
      const ids = pacientes.map((p) => p.id);
      setSelecionados([...new Set([...selecionados, ...ids])]);
    }
  };

  if (pacientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <UserRound className="w-12 h-12 mb-3" />
        <p className="text-sm font-medium">Nenhum paciente encontrado.</p>
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
              Paciente
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              CPF
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Contato
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Nascimento
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Tipo Sanguíneo
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Emergência
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {pacientes.map((paciente) => (
            <tr key={paciente.id} className="hover:bg-gray-50 transition-colors align-top">
              <td className="px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={selecionados.includes(paciente.id)}
                  onChange={() => toggleSelecionado(paciente.id)}
                />
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  <Hash className="w-3 h-3" />
                  {paciente.id}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {paciente.nome || '—'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {paciente.sexo || 'Sexo não informado'}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{paciente.cpf || '—'}</span>
              </td>

              <td className="px-6 py-4">
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {paciente.telefone || '—'}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Mail className="w-3.5 h-3.5" />
                    {paciente.email || '—'}
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {paciente.dataNascimento
                    ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')
                    : '—'}
                </span>
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  {paciente.tipoSanguineo || 'Não informado'}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="text-sm text-gray-600">
                  <p>{paciente.nomeContatoEmergencia || '—'}</p>
                  <p className="text-xs text-gray-400">
                    {paciente.telefoneContatoEmergencia || ''}
                  </p>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onVisualizar(paciente)}
                    title="Ver paciente"
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditar(paciente)}
                    title="Editar paciente"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeletar(paciente)}
                    title="Excluir paciente"
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

export default PacienteTable;