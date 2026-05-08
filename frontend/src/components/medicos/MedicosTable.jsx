import {
  Eye,
  Pencil,
  Trash2,
  User,
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
  selecionados,
  setSelecionados,
}) {
  const todosSelecionados =
    medicos.length > 0 &&
    medicos.every((medico) => selecionados.includes(medico.id));

  function toggleSelecionado(id) {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  }

  function toggleSelecionarTodos() {
    const ids = medicos.map((medico) => medico.id);

    if (todosSelecionados) {
      setSelecionados(selecionados.filter((id) => !ids.includes(id)));
    } else {
      setSelecionados([...new Set([...selecionados, ...ids])]);
    }
  }

  if (medicos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 text-gray-400">
        <User className="mb-3 h-12 w-12" />
        <p className="text-sm font-medium">Nenhum médico encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {medicos.map((medico) => (
          <MedicoCardMobile
            key={medico.id}
            medico={medico}
            selecionado={selecionados.includes(medico.id)}
            onSelecionar={() => toggleSelecionado(medico.id)}
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

              <th className="min-w-[260px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Médico
              </th>

              <th className="min-w-[120px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                CRM
              </th>

              <th className="min-w-[220px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Especialidade
              </th>

              <th className="min-w-[260px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Contato
              </th>

              <th className="min-w-[160px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Turno
              </th>

              <th className="min-w-[150px] px-3 py-3 text-center text-[11px] font-bold uppercase text-gray-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {medicos.map((medico) => (
              <tr
                key={medico.id}
                className="align-top transition-colors hover:bg-gray-50"
              >
                <td className="px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(medico.id)}
                    onChange={() => toggleSelecionado(medico.id)}
                  />
                </td>

                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700">
                    <Hash className="h-3 w-3" />
                    {medico.id}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <div className="flex flex-col">
                    <span className="truncate text-xs font-bold text-gray-900">
                      {medico.nome || '—'}
                    </span>

                    <span className="text-[11px] text-gray-400">
                      Médico cadastrado
                    </span>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <span className="text-xs text-gray-700">
                    {medico.crm || '—'}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                    <Stethoscope className="h-3 w-3 shrink-0" />

                    <span className="truncate">
                      {medico.especialidade || 'Não informada'}
                    </span>
                  </span>
                </td>

                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-700">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                      <span className="truncate">
                        {medico.telefone || '—'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Mail className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {medico.email || '—'}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <span className="text-xs text-gray-700">
                    {medico.turnoAtendimento || '—'}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <div className="flex justify-center gap-2">
                    <BotaoAcao
                      onClick={() => onVisualizar(medico)}
                      titulo="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </BotaoAcao>

                    <BotaoAcao
                      onClick={() => onEditar(medico)}
                      titulo="Editar"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </BotaoAcao>

                    <BotaoAcao
                      onClick={() => onDeletar(medico)}
                      titulo="Excluir"
                    >
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

function MedicoCardMobile({
  medico,
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
            {medico.id}
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <LinhaMobile
          icone={User}
          label="Médico"
          valor={medico.nome || '—'}
        />

        <LinhaMobile
          icone={Hash}
          label="CRM"
          valor={medico.crm || '—'}
        />

        <LinhaMobile
          icone={Stethoscope}
          label="Especialidade"
          valor={medico.especialidade || 'Não informada'}
        />

        <LinhaMobile
          icone={Phone}
          label="Telefone"
          valor={medico.telefone || '—'}
        />

        <LinhaMobile
          icone={Mail}
          label="E-mail"
          valor={medico.email || '—'}
        />
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
        <BotaoAcao onClick={() => onVisualizar(medico)} titulo="Visualizar">
          <Eye className="h-4 w-4" />
        </BotaoAcao>

        <BotaoAcao onClick={() => onEditar(medico)} titulo="Editar">
          <Pencil className="h-4 w-4 text-blue-600" />
        </BotaoAcao>

        <BotaoAcao onClick={() => onDeletar(medico)} titulo="Excluir">
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
        <p className="text-[10px] font-bold uppercase text-gray-400">
          {label}
        </p>

        <p className="break-words text-xs font-semibold text-gray-800">
          {valor}
        </p>
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

export default MedicoTable;