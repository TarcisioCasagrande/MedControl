// src/components/agenda/AtendimentoRecepcaoModal.jsx
import {
  Ban,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  DollarSign,
  Plus,
  Trash2,
  UserRound,
  Wallet,
  X,
  CalendarDays,
} from 'lucide-react';

import {
  calcularResumoFinanceiro,
  formatarDataHoraCompleta,
  formatarMoeda,
  gerarIdLocal,
  normalizarNumeroDecimal,
  obterValorBaseAgendamento,
} from './utils/agendaFormatters';

import { formatarStatus, normalizarStatus } from './utils/agendaStatus';

const FORMAS_PAGAMENTO = [
  'Pix',
  'Cartão',
  'Dinheiro',
  'Boleto',
  'Convênio',
];

const LIMITE_FORMAS_PAGAMENTO = 5;

export default function AtendimentoRecepcaoModal({
  isOpen,
  agendamento,
  formasPagamento,
  setFormasPagamento,
  tipoDesconto,
  setTipoDesconto,
  valorDesconto,
  setValorDesconto,
  statusPagamento,
  setStatusPagamento,
  dataPagamento,
  setDataPagamento,
  observacaoPagamento,
  setObservacaoPagamento,
  processando,
  onClose,
  onAtender,
  onCancelar,
}) {
  if (!isOpen || !agendamento) return null;

  const listaFormasPagamento = Array.isArray(formasPagamento)
    ? formasPagamento
    : [];

  const valorBase = obterValorBaseAgendamento(agendamento);
  const pagamentoExistente = agendamento.pagamento;

  const resumoFinanceiro = calcularResumoFinanceiro(
    valorBase,
    tipoDesconto,
    valorDesconto,
    listaFormasPagamento
  );

  const status = normalizarStatus(agendamento.status);
  const jaCancelado = status === 'cancelada';
  const jaFinalizado = status === 'finalizada';
  const jaAtendidoRecepcao = status === 'atendidorecepcao';
  const jaEmAtendimento = status === 'emandamento';
  const podeSalvarPagamento = Math.abs(resumoFinanceiro.diferenca) < 0.009;
  const atingiuLimiteFormas = listaFormasPagamento.length >= LIMITE_FORMAS_PAGAMENTO;

  function alterarFormaPagamento(id, campo, valor) {
    setFormasPagamento((lista) =>
      lista.map((item) =>
        item.id === id
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    );
  }

  function adicionarFormaPagamento() {
    setFormasPagamento((lista) => {
      if (lista.length >= LIMITE_FORMAS_PAGAMENTO) return lista;

      return [
        ...lista,
        {
          id: gerarIdLocal(),
          formaPagamento: 'Pix',
          valor: '0.00',
        },
      ];
    });
  }

  function removerFormaPagamento(id) {
    setFormasPagamento((lista) => {
      if (lista.length <= 1) return lista;
      return lista.filter((item) => item.id !== id);
    });
  }

  function preencherSaldoRestante(id) {
    const totalOutros = listaFormasPagamento.reduce((total, item) => {
      if (item.id === id) return total;
      return total + normalizarNumeroDecimal(item.valor);
    }, 0);

    const saldo = Math.max(resumoFinanceiro.valorFinal - totalOutros, 0);

    alterarFormaPagamento(id, 'valor', saldo.toFixed(2));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-3">
      <div className="flex h-[94dvh] w-[98vw] max-w-[1680px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <CabecalhoModal
          processando={processando}
          onClose={onClose}
          pagamentoExistente={pagamentoExistente}
        />

        <div className="min-h-0 flex-1 overflow-hidden bg-gray-100 p-3">
          <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-[310px_minmax(0,1fr)_330px]">
            <aside className="min-h-0 space-y-3 overflow-y-auto pr-1">
              <CardPaciente agendamento={agendamento} />
              <CardAgendamento agendamento={agendamento} />
              <CardProcedimento agendamento={agendamento} valorBase={valorBase} />
            </aside>

            <main className="min-h-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <SecaoDesconto
                tipoDesconto={tipoDesconto}
                setTipoDesconto={setTipoDesconto}
                valorDesconto={valorDesconto}
                setValorDesconto={setValorDesconto}
                valorBase={valorBase}
              />

              <ResumoFinanceiro resumoFinanceiro={resumoFinanceiro} />

              <SecaoFormasPagamento
                formasPagamento={listaFormasPagamento}
                alterarFormaPagamento={alterarFormaPagamento}
                adicionarFormaPagamento={adicionarFormaPagamento}
                removerFormaPagamento={removerFormaPagamento}
                preencherSaldoRestante={preencherSaldoRestante}
                atingiuLimiteFormas={atingiuLimiteFormas}
                processando={processando}
              />

              {!podeSalvarPagamento && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                  O total das formas de pagamento precisa ser igual ao valor final.
                </div>
              )}
            </main>

            <aside className="min-h-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <SecaoStatusPagamento
                statusPagamento={statusPagamento}
                setStatusPagamento={setStatusPagamento}
                dataPagamento={dataPagamento}
                setDataPagamento={setDataPagamento}
                pagamentoExistente={pagamentoExistente}
              />

              <SecaoObservacoes
                observacaoPagamento={observacaoPagamento}
                setObservacaoPagamento={setObservacaoPagamento}
              />

              {agendamento.motivoAgendamento && (
                <section className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    Motivo do agendamento
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-700">
                    {agendamento.motivoAgendamento}
                  </p>
                </section>
              )}

              {pagamentoExistente && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                  Este agendamento já possui pagamento cadastrado. Ao salvar,
                  os dados financeiros serão atualizados e o paciente será liberado.
                </div>
              )}
            </aside>
          </div>
        </div>

        <RodapeModal
          processando={processando}
          podeSalvarPagamento={podeSalvarPagamento}
          jaCancelado={jaCancelado}
          jaFinalizado={jaFinalizado}
          jaAtendidoRecepcao={jaAtendidoRecepcao}
          jaEmAtendimento={jaEmAtendimento}
          onClose={onClose}
          onCancelar={onCancelar}
          onAtender={onAtender}
        />
      </div>
    </div>
  );
}

function CabecalhoModal({ processando, onClose, pagamentoExistente }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-sky-600 px-4 py-3 text-white">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <UserRound className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-bold">
              Atendimento da recepção
            </h2>

            {pagamentoExistente ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Pagamento #{pagamentoExistente.id}
              </span>
            ) : (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white">
                Novo pagamento
              </span>
            )}
          </div>

          <p className="truncate text-[11px] text-sky-100">
            Desconto, até 5 formas de pagamento e liberação para o médico.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={processando}
        className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function CardPaciente({ agendamento }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <TituloSecao icon={UserRound} titulo="Paciente" />
      <br/>
      <InfoLinha label="Nome" valor={agendamento.paciente?.nome} />
      <InfoLinha
        label="CPF"
        valor={agendamento.paciente?.cpf || agendamento.paciente?.CPF}
      />
      <InfoLinha label="Telefone" valor={agendamento.paciente?.telefone} />
      <InfoLinha label="E-mail" valor={agendamento.paciente?.email} />
    </section>
  );
}

function CardAgendamento({ agendamento }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <TituloSecao icon={CalendarDays} titulo="Agendamento" />
      <br/>
      <InfoLinha label="Código" valor={`#${agendamento.id}`} />
      <InfoLinha
        label="Data"
        valor={formatarDataHoraCompleta(agendamento.dataAgendamento)}
      />
      <InfoLinha label="Médico" valor={agendamento.medico?.nome} />
      <InfoLinha label="Status" valor={formatarStatus(agendamento.status)} />
      <InfoLinha label="Tipo" valor={agendamento.tipoAtendimento} />
    </section>
  );
}

function CardProcedimento({ agendamento, valorBase }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <TituloSecao icon={ClipboardList} titulo="Procedimento" />
      <br/>
      <InfoLinha label="Nome" valor={agendamento.procedimento?.nome} />
      <InfoLinha label="Código" valor={agendamento.procedimento?.codigo} />

      <div className="mt-2 rounded-xl border border-green-200 bg-green-50 p-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-green-700">
          Valor original
        </p>
        <p className="text-lg font-black text-green-800">
          {formatarMoeda(valorBase)}
        </p>
      </div>
    </section>
  );
}

function SecaoDesconto({
  tipoDesconto,
  setTipoDesconto,
  valorDesconto,
  setValorDesconto,
  valorBase,
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <TituloSecao icon={DollarSign} titulo="Desconto" />

        <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">
          Base: {formatarMoeda(valorBase)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_1fr]">
        <CampoPagamentoResumo label="Valor original" valor={formatarMoeda(valorBase)} />

        <div>
          <LabelCampo>Tipo de desconto</LabelCampo>
          <select
            value={tipoDesconto}
            onChange={(e) => setTipoDesconto(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="Nenhum">Sem desconto</option>
            <option value="Valor">Valor fixo</option>
            <option value="Porcentagem">Porcentagem</option>
          </select>
        </div>

        <div>
          <LabelCampo>
            {tipoDesconto === 'Porcentagem' ? 'Desconto (%)' : 'Desconto (R$)'}
          </LabelCampo>
          <input
            type="number"
            min="0"
            max={tipoDesconto === 'Porcentagem' ? '100' : undefined}
            step="0.01"
            value={valorDesconto}
            onChange={(e) => setValorDesconto(e.target.value)}
            disabled={tipoDesconto === 'Nenhum'}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>
      </div>
    </section>
  );
}

function ResumoFinanceiro({ resumoFinanceiro }) {
  return (
    <section className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
      <ResumoFinanceiroCard
        label="Desconto"
        valor={formatarMoeda(resumoFinanceiro.descontoAplicado)}
        tipo="amber"
      />
      <ResumoFinanceiroCard
        label="Valor final"
        valor={formatarMoeda(resumoFinanceiro.valorFinal)}
        tipo="green"
      />
      <ResumoFinanceiroCard
        label="Total pago"
        valor={formatarMoeda(resumoFinanceiro.totalPago)}
        tipo="blue"
      />
      <ResumoFinanceiroCard
        label={
          resumoFinanceiro.diferenca > 0
            ? 'Falta pagar'
            : resumoFinanceiro.diferenca < 0
              ? 'Excedente'
              : 'Saldo'
        }
        valor={formatarMoeda(Math.abs(resumoFinanceiro.diferenca))}
        tipo={Math.abs(resumoFinanceiro.diferenca) < 0.009 ? 'green' : 'red'}
      />
    </section>
  );
}

function SecaoFormasPagamento({
  formasPagamento,
  alterarFormaPagamento,
  adicionarFormaPagamento,
  removerFormaPagamento,
  preencherSaldoRestante,
  atingiuLimiteFormas,
  processando,
}) {
  return (
    <section className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wide text-gray-900">
            Formas de pagamento
          </h4>
          <p className="text-[11px] text-gray-500">
            Máximo de 5 formas. Ex.: R$ 50 dinheiro + R$ 100 cartão.
          </p>
        </div>

        <button
          type="button"
          onClick={adicionarFormaPagamento}
          disabled={processando || atingiuLimiteFormas}
          className="flex h-8 items-center justify-center gap-1 rounded-lg bg-sky-600 px-3 text-[11px] font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {formasPagamento.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-white p-2 md:grid-cols-[44px_minmax(0,1fr)_120px_92px_36px]"
          >
            <div className="flex h-8 items-center justify-center rounded-lg bg-sky-50 text-xs font-black text-sky-700 md:self-end">
              #{index + 1}
            </div>

            <div>
              <LabelCampo>Forma</LabelCampo>
              <select
                value={item.formaPagamento}
                onChange={(e) =>
                  alterarFormaPagamento(item.id, 'formaPagamento', e.target.value)
                }
                className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                {FORMAS_PAGAMENTO.map((forma) => (
                  <option key={forma} value={forma}>
                    {forma}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <LabelCampo>Valor</LabelCampo>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.valor}
                onChange={(e) =>
                  alterarFormaPagamento(item.id, 'valor', e.target.value)
                }
                className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <button
              type="button"
              onClick={() => preencherSaldoRestante(item.id)}
              className="h-8 self-end rounded-lg border border-green-200 bg-green-50 px-2 text-[11px] font-bold text-green-700 transition hover:bg-green-100"
            >
              Saldo
            </button>

            <button
              type="button"
              onClick={() => removerFormaPagamento(item.id)}
              disabled={formasPagamento.length <= 1}
              className="flex h-8 w-9 items-center justify-center self-end rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Remover forma de pagamento"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SecaoStatusPagamento({
  statusPagamento,
  setStatusPagamento,
  dataPagamento,
  setDataPagamento,
  pagamentoExistente,
}) {
  return (
    <section>
      <TituloSecao icon={CreditCard} titulo="Controle financeiro" />

      <div className="mt-2 grid grid-cols-1 gap-2">
        <div>
          <LabelCampo>Status do pagamento</LabelCampo>
          <select
            value={statusPagamento}
            onChange={(e) => setStatusPagamento(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            required
          >
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Parcial">Parcial</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Estornado">Estornado</option>
          </select>
        </div>

        <div>
          <LabelCampo>Data do pagamento</LabelCampo>
          <input
            type="datetime-local"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <CampoPagamentoResumo
          label="Última atualização"
          valor={formatarDataHoraCompleta(pagamentoExistente?.dataAtualizacao)}
        />
      </div>
    </section>
  );
}

function SecaoObservacoes({
  observacaoPagamento,
  setObservacaoPagamento,
}) {
  return (
    <section className="mt-3">
      <div className="mb-1 flex items-center justify-between">
        <LabelCampo>Observações financeiras</LabelCampo>
        <span className="text-[10px] font-semibold text-gray-400">
          {observacaoPagamento.length}/500
        </span>
      </div>

      <textarea
        value={observacaoPagamento}
        onChange={(e) => setObservacaoPagamento(e.target.value)}
        rows={8}
        maxLength={500}
        placeholder="Comprovante, autorização, desconto aplicado, estorno ou qualquer detalhe financeiro..."
        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs leading-relaxed outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
      />
    </section>
  );
}

function RodapeModal({
  processando,
  podeSalvarPagamento,
  jaCancelado,
  jaFinalizado,
  jaAtendidoRecepcao,
  jaEmAtendimento,
  onClose,
  onCancelar,
  onAtender,
}) {
  return (
    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        disabled={processando}
        className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-100 disabled:opacity-60"
      >
        Fechar
      </button>

      <button
        type="button"
        onClick={onCancelar}
        disabled={processando || jaCancelado || jaFinalizado}
        className="flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
      >
        <Ban className="h-4 w-4" />
        Cancelar agendamento
      </button>

      <button
        type="button"
        onClick={onAtender}
        disabled={
          processando ||
          !podeSalvarPagamento ||
          jaCancelado ||
          jaFinalizado ||
          jaAtendidoRecepcao ||
          jaEmAtendimento
        }
        className="flex h-9 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-xs font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
      >
        <CheckCircle2 className="h-4 w-4" />
        {processando ? 'Processando...' : 'Salvar pagamento e liberar médico'}
      </button>
    </div>
  );
}

function TituloSecao({ icon: Icon, titulo }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-sky-600" />
      <h3 className="text-xs font-black uppercase tracking-wide text-gray-900">
        {titulo}
      </h3>
    </div>
  );
}

function InfoLinha({ label, valor }) {
  return (
    <div className="mb-1.5 last:mb-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="truncate text-xs font-semibold text-gray-900">
        {valor || '-'}
      </p>
    </div>
  );
}

function LabelCampo({ children }) {
  return (
    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
      {children}
    </label>
  );
}

function CampoPagamentoResumo({ label, valor }) {
  return (
    <div>
      <LabelCampo>{label}</LabelCampo>
      <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-800">
        {valor || '-'}
      </div>
    </div>
  );
}

function ResumoFinanceiroCard({ label, valor, tipo }) {
  const estilos = {
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    green: 'border-green-200 bg-green-50 text-green-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    red: 'border-red-200 bg-red-50 text-red-800',
  };

  return (
    <div className={`rounded-xl border px-3 py-2 ${estilos[tipo] || estilos.blue}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-0.5 text-base font-black">{valor}</p>
    </div>
  );
}