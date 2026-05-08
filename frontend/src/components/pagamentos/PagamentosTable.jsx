import {
  Eye,
  Pencil,
  Trash2,
  CreditCard,
  CalendarDays,
  User,
  Stethoscope,
  Hash,
} from 'lucide-react';
import PagamentoStatusBadge from './PagamentoStatusBadge';

function PagamentosTable({
  pagamentos = [],
  onVisualizar,
  onEditar,
  onDeletar,
}) {
  const listaPagamentos = Array.isArray(pagamentos) ? pagamentos : [];

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

  function formatarDataAgendamento(data) {
    if (!data) return 'Não informado';

    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  if (listaPagamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-14 text-center text-gray-400">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <CreditCard className="h-7 w-7 text-blue-500" />
        </div>

        <h3 className="text-sm font-semibold text-gray-700">
          Nenhum pagamento encontrado
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Cadastre uma cobrança para começar o controle financeiro.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {listaPagamentos.map((pagamento) => (
          <PagamentoCardMobile
            key={pagamento.id}
            pagamento={pagamento}
            onVisualizar={onVisualizar}
            onEditar={onEditar}
            onDeletar={onDeletar}
            formatarValor={formatarValor}
            formatarData={formatarData}
            formatarDataAgendamento={formatarDataAgendamento}
          />
        ))}
      </div>

      <div className="hidden w-full overflow-hidden rounded-xl border border-gray-200 bg-white lg:block">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="w-[90px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                ID
              </th>

              <th className="min-w-[180px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Agendamento
              </th>

              <th className="min-w-[240px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Paciente
              </th>

              <th className="min-w-[220px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Médico
              </th>

              <th className="min-w-[130px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Valor
              </th>

              <th className="min-w-[140px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Forma
              </th>

              <th className="min-w-[130px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Status
              </th>

              <th className="min-w-[130px] px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                Pagamento
              </th>

              <th className="min-w-[150px] px-3 py-3 text-center text-[11px] font-bold uppercase text-gray-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {listaPagamentos.map((pagamento) => (
              <tr
                key={pagamento.id}
                className="align-top transition-colors hover:bg-gray-50"
              >
                <td className="px-3 py-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">
                    # {pagamento.id}
                  </span>
                </td>

                <td className="px-3 py-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-blue-500" />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-gray-700">
                        #{pagamento.agendamentoId || pagamento.agendamento?.id || '—'}
                      </p>

                      <p className="truncate text-[11px] text-gray-500">
                        {formatarDataAgendamento(
                          pagamento.agendamento?.dataAgendamento
                        )}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 text-gray-600">
                  <div className="flex min-w-0 items-center gap-2">
                    <User className="h-4 w-4 shrink-0 text-gray-400" />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold uppercase text-gray-900">
                        {pagamento.agendamento?.paciente?.nome ||
                          pagamento.pacienteNome ||
                          'Não informado'}
                      </p>

                      <p className="text-[11px] text-gray-400">
                        Paciente
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 text-gray-600">
                  <div className="flex min-w-0 items-center gap-2">
                    <Stethoscope className="h-4 w-4 shrink-0 text-gray-400" />

                    <p className="truncate text-xs text-gray-700">
                      {pagamento.agendamento?.medico?.nome ||
                        pagamento.medicoNome ||
                        'Não informado'}
                    </p>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <span className="whitespace-nowrap text-xs font-black text-green-700">
                    {formatarValor(pagamento.valor)}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <span className="inline-flex rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                    {pagamento.formaPagamento || 'Não informado'}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <PagamentoStatusBadge status={pagamento.statusPagamento} />
                </td>

                <td className="px-3 py-3 text-xs text-gray-600">
                  {formatarData(pagamento.dataPagamento)}
                </td>

                <td className="px-3 py-3">
                  <div className="flex justify-center gap-2">
                    <BotaoAcao
                      onClick={() => onVisualizar?.(pagamento)}
                      titulo="Visualizar"
                    >
                      <Eye className="h-4 w-4 text-slate-600" />
                    </BotaoAcao>

                    <BotaoAcao
                      onClick={() => onEditar?.(pagamento)}
                      titulo="Editar"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </BotaoAcao>

                    <BotaoAcao
                      onClick={() => onDeletar?.(pagamento)}
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

function PagamentoCardMobile({
  pagamento,
  onVisualizar,
  onEditar,
  onDeletar,
  formatarValor,
  formatarData,
  formatarDataAgendamento,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
              # {pagamento.id}
            </span>

            <p className="truncate text-sm font-bold text-gray-900">
              {formatarValor(pagamento.valor)}
            </p>
          </div>

          <p className="mt-1 truncate text-xs text-gray-500">
            Agendamento #{pagamento.agendamentoId || pagamento.agendamento?.id || '—'}
          </p>
        </div>

        <PagamentoStatusBadge status={pagamento.statusPagamento} />
      </div>

      <div className="grid gap-2 text-xs">
        <LinhaMobile
          icone={Hash}
          label="Agendamento"
          valor={formatarDataAgendamento(pagamento.agendamento?.dataAgendamento)}
        />

        <LinhaMobile
          icone={User}
          label="Paciente"
          valor={
            pagamento.agendamento?.paciente?.nome ||
            pagamento.pacienteNome ||
            'Não informado'
          }
        />

        <LinhaMobile
          icone={Stethoscope}
          label="Médico"
          valor={
            pagamento.agendamento?.medico?.nome ||
            pagamento.medicoNome ||
            'Não informado'
          }
        />

        <LinhaMobile
          icone={CreditCard}
          label="Forma"
          valor={pagamento.formaPagamento || 'Não informado'}
        />

        <LinhaMobile
          icone={CalendarDays}
          label="Pagamento"
          valor={formatarData(pagamento.dataPagamento)}
        />
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
        <BotaoAcao onClick={() => onVisualizar?.(pagamento)} titulo="Visualizar">
          <Eye className="h-4 w-4 text-slate-600" />
        </BotaoAcao>

        <BotaoAcao onClick={() => onEditar?.(pagamento)} titulo="Editar">
          <Pencil className="h-4 w-4 text-blue-600" />
        </BotaoAcao>

        <BotaoAcao onClick={() => onDeletar?.(pagamento)} titulo="Excluir">
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
      onClick={onClick}
      title={titulo}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
    >
      {children}
    </button>
  );
}

export default PagamentosTable;
