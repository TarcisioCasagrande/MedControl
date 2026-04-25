import {
  Eye,
  Pencil,
  Trash2,
  CreditCard,
  CalendarDays,
  User,
  Stethoscope,
} from 'lucide-react';
import PagamentoStatusBadge from './PagamentoStatusBadge';

function PagamentosTable({ pagamentos, onVisualizar, onEditar, onDeletar }) {
  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data) {
    if (!data) return 'Não informado';

    return new Date(data).toLocaleDateString('pt-BR');
  }

  function formatarDataConsulta(data) {
    if (!data) return 'Não informado';

    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  if (!pagamentos || pagamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
          <CreditCard className="w-7 h-7 text-blue-500" />
        </div>

        <h3 className="text-sm font-semibold text-gray-700">
          Nenhum pagamento encontrado
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Cadastre uma cobrança para começar o controle financeiro.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Consulta</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Paciente</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Médico</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Valor</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Forma</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Pagamento</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">Ações</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {pagamentos.map((pagamento) => (
            <tr key={pagamento.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-gray-700">
                #{pagamento.id}
              </td>

              <td className="px-4 py-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-700">
                      #{pagamento.consultaId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatarDataConsulta(pagamento.consulta?.dataConsulta)}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {pagamento.consulta?.paciente?.nome || 'Não informado'}
                </div>
              </td>

              <td className="px-4 py-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  {pagamento.consulta?.medico?.nome || 'Não informado'}
                </div>
              </td>

              <td className="px-4 py-3 font-bold text-green-700">
                {formatarValor(pagamento.valor)}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {pagamento.formaPagamento}
              </td>

              <td className="px-4 py-3">
                <PagamentoStatusBadge status={pagamento.statusPagamento} />
              </td>

              <td className="px-4 py-3 text-gray-600">
                {formatarData(pagamento.dataPagamento)}
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onVisualizar(pagamento)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditar(pagamento)}
                    className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeletar(pagamento)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
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

export default PagamentosTable;