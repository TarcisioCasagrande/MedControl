// src/components/agenda/utils/agendaFormatters.js

export function normalizarDataComparacao(data) {
  if (!data) return null;

  if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return montarDataDoInput(data);
  }

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return null;

  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function montarDataDoInput(valor) {
  if (!valor) return normalizarDataComparacao(new Date());

  const [ano, mes, dia] = valor.split('-').map(Number);

  if (!ano || !mes || !dia) return normalizarDataComparacao(new Date());

  return new Date(ano, mes - 1, dia);
}

export function formatarDataInput(data) {
  if (!data) return '';

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return '';

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

export function formatarDataHoraLocal(data) {
  const d = new Date(data);

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');

  return `${ano}-${mes}-${dia}T${hora}:${minuto}:00`;
}

export function formatarDataHoraInputLocal(data) {
  if (!data) return '';

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return '';

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

export function converterDataHoraInputParaIso(valor) {
  if (!valor) return null;

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return null;

  return data.toISOString();
}

export function formatarHora(data) {
  if (!data) return '-';

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return '-';

  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatarDataHoraCompleta(data) {
  if (!data) return '-';

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return '-';

  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatarDiaCabecalho(data) {
  return data.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatarDiaCabecalhoCompacto(data) {
  const semana = data.toLocaleDateString('pt-BR', {
    weekday: 'short',
  });

  return `${semana.replace('.', '')} ${String(data.getDate()).padStart(2, '0')}`;
}

export function formatarDataCurta(data) {
  return data.toLocaleDateString('pt-BR');
}

export function formatarDataLonga(data) {
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function gerarIdLocal() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizarNumeroDecimal(valor) {
  if (valor === null || valor === undefined || valor === '') return 0;

  const numero = Number(String(valor).replace(',', '.'));

  return Number.isFinite(numero) ? numero : 0;
}

export function obterValorBaseAgendamento(agendamento) {
  return Number(
    agendamento?.valorCobrado ||
      agendamento?.procedimento?.valor ||
      agendamento?.pagamento?.valor ||
      0
  );
}

export function calcularResumoFinanceiro(valorBase, tipoDesconto, valorDesconto, formasPagamento) {
  const base = Number(valorBase || 0);
  const descontoInformado = normalizarNumeroDecimal(valorDesconto);

  let descontoAplicado = 0;

  if (tipoDesconto === 'Valor') {
    descontoAplicado = Math.min(Math.max(descontoInformado, 0), base);
  }

  if (tipoDesconto === 'Porcentagem') {
    const percentual = Math.min(Math.max(descontoInformado, 0), 100);
    descontoAplicado = base * (percentual / 100);
  }

  const valorFinal = Math.max(base - descontoAplicado, 0);
  const totalPago = (formasPagamento || []).reduce(
    (total, item) => total + normalizarNumeroDecimal(item.valor),
    0
  );

  return {
    valorBase: arredondarMoeda(base),
    descontoAplicado: arredondarMoeda(descontoAplicado),
    valorFinal: arredondarMoeda(valorFinal),
    totalPago: arredondarMoeda(totalPago),
    diferenca: arredondarMoeda(valorFinal - totalPago),
  };
}

export function arredondarMoeda(valor) {
  return Math.round(Number(valor || 0) * 100) / 100;
}

export function gerarFormasPagamentoIniciais(pagamentoExistente, valorPadrao) {
  if (pagamentoExistente?.formaPagamento && pagamentoExistente?.valor) {
    return [
      {
        id: gerarIdLocal(),
        formaPagamento:
          pagamentoExistente.formaPagamento === 'Misto'
            ? 'Pix'
            : pagamentoExistente.formaPagamento,
        valor: Number(pagamentoExistente.valor || 0).toFixed(2),
      },
    ];
  }

  return [
    {
      id: gerarIdLocal(),
      formaPagamento: 'Pix',
      valor: Number(valorPadrao || 0).toFixed(2),
    },
  ];
}

export function montarObservacoesFinanceiras({
  observacaoManual,
  valorBase,
  tipoDesconto,
  valorDesconto,
  valorFinal,
  formasPagamento,
}) {
  const linhas = [];

  if (observacaoManual?.trim()) {
    linhas.push(observacaoManual.trim());
  }

  linhas.push('--- Resumo financeiro ---');
  linhas.push(`Valor original: ${formatarMoeda(valorBase)}`);
  linhas.push(
    `Desconto: ${tipoDesconto === 'Nenhum' ? 'Sem desconto' : `${tipoDesconto} - ${formatarMoeda(valorDesconto)}`}`
  );
  linhas.push(`Valor final: ${formatarMoeda(valorFinal)}`);
  linhas.push('Formas de pagamento:');

  formasPagamento.forEach((item) => {
    linhas.push(`- ${item.formaPagamento}: ${formatarMoeda(item.valorNumerico)}`);
  });

  return linhas.join('\n').slice(0, 500);
}

export function removerResumoFinanceiroDasObservacoes(texto) {
  if (!texto) return '';

  return texto.split('--- Resumo financeiro ---')[0].trim();
}

export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}