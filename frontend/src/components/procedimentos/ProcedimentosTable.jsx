import { Eye, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';

function ProcedimentosTable({ procedimentos, onVisualizar, onEditar, onDeletar }) {
  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function obterDataCadastro(procedimento) {
    return procedimento?.dataCadastro || procedimento?.DataCadastro || null;
  }


  if (procedimentos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
        Nenhum procedimento encontrado.
      </div>
    );
  }

  return (
    <table className="min-w-full border-collapse text-left text-xs">
      <thead className="sticky top-0 z-10 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
        <tr>
          <th className="border-b border-gray-200 px-4 py-3 font-bold">ID</th>
          <th className="border-b border-gray-200 px-4 py-3 font-bold">Procedimento</th>
          <th className="border-b border-gray-200 px-4 py-3 font-bold">Código</th>
          <th className="border-b border-gray-200 px-4 py-3 font-bold">Valor</th>
          <th className="border-b border-gray-200 px-4 py-3 font-bold">Status</th>
          <th className="border-b border-gray-200 px-4 py-3 text-right font-bold">
            Ações
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-100 bg-white">
        {procedimentos.map((procedimento) => (
          <tr key={procedimento.id || procedimento.Id} className="transition hover:bg-gray-50">
            <td className="px-4 py-3 font-semibold text-gray-700">
              #{procedimento.id || procedimento.Id}
            </td>

            <td className="px-4 py-3">
              <div className="font-semibold text-gray-900">
                {procedimento.nome || procedimento.Nome}
              </div>
            </td>

            <td className="px-4 py-3">
              <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-[11px] font-semibold text-gray-700">
                {procedimento.codigo || procedimento.Codigo || '-'}
              </span>
            </td>

            <td className="px-4 py-3 font-bold text-gray-800">
              {formatarValor(procedimento.valor ?? procedimento.Valor)}
            </td>

            <td className="px-4 py-3">
              {(procedimento.ativo ?? procedimento.Ativo) ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-bold text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">
                  <XCircle className="h-3 w-3" />
                  Inativo
                </span>
              )}
            </td>

            <td className="px-4 py-3">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onVisualizar(procedimento)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onEditar(procedimento)}
                  className="rounded-lg border border-blue-200 p-2 text-blue-600 transition hover:bg-blue-50"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onDeletar(procedimento)}
                  className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProcedimentosTable;