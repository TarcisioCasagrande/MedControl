// src/components/agenda/utils/agendaSlots.js
import {
  formatarDataInput,
  formatarHora,
  formatarDataLonga,
  normalizarDataComparacao,
  montarDataDoInput,
} from './agendaFormatters';

export function nomeDiaSemana(valor) {
  const dias = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  return dias[Number(valor)] || '-';
}

export function obterDiaSemana(dataInput) {
  if (!dataInput) return 0;

  const [ano, mes, dia] = dataInput.split('-').map(Number);

  if (!ano || !mes || !dia) return 0;

  return new Date(ano, mes - 1, dia).getDay();
}

export function converterHorarioParaMinutos(horario) {
  const [hora, minuto] = horario.split(':').map(Number);
  return hora * 60 + minuto;
}

export function converterMinutosParaHorario(totalMinutos) {
  const hora = Math.floor(totalMinutos / 60);
  const minuto = totalMinutos % 60;

  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

export function montarDataComHorario(dataBase, horario) {
  const [hora, minuto] = horario.split(':').map(Number);
  const data = new Date(dataBase);

  data.setHours(hora);
  data.setMinutes(minuto);
  data.setSeconds(0);
  data.setMilliseconds(0);

  return data;
}

export function gerarSlotsDoMedicoPorDia(medico, dia, agendamentos, disponibilidades) {
  const disponibilidadesDoDia = disponibilidades
    .filter(
      (item) =>
        item.horaInicio &&
        item.horaFim &&
        disponibilidadeValeParaData(item, medico.id, dia)
    )
    .sort(
      (a, b) =>
        converterHorarioParaMinutos(a.horaInicio) -
        converterHorarioParaMinutos(b.horaInicio)
    );

  const agendamentosDoDia = agendamentos
    .filter((agendamento) => {
      const agendamentoMedicoId = agendamento.medicoId ?? agendamento.medico?.id;

      return (
        String(agendamentoMedicoId) === String(medico.id) &&
        formatarDataInput(agendamento.dataAgendamento) === formatarDataInput(dia)
      );
    })
    .sort((a, b) => new Date(a.dataAgendamento) - new Date(b.dataAgendamento));

  const slots = [];

  disponibilidadesDoDia.forEach((disp) => {
    let minutoAtual = converterHorarioParaMinutos(disp.horaInicio);
    const minutoFim = converterHorarioParaMinutos(disp.horaFim);
    const intervalo = Math.max(Number(disp.intervaloMinutos || 30), 1);

    while (minutoAtual < minutoFim) {
      const horario = converterMinutosParaHorario(minutoAtual);
      const dataHora = montarDataComHorario(dia, horario);

      const agendamento = agendamentosDoDia.find(
        (item) => formatarHora(item.dataAgendamento) === horario
      );

      if (!slots.some((slot) => slot.horario === horario)) {
        slots.push({
          horario,
          dataHora,
          agendamento: agendamento || null,
        });
      }

      minutoAtual += intervalo;
    }
  });

  agendamentosDoDia.forEach((agendamento) => {
    const horario = formatarHora(agendamento.dataAgendamento);

    if (!slots.some((slot) => slot.horario === horario)) {
      slots.push({
        horario,
        dataHora: new Date(agendamento.dataAgendamento),
        agendamento,
      });
    }
  });

  return slots.sort(
    (a, b) =>
      converterHorarioParaMinutos(a.horario) -
      converterHorarioParaMinutos(b.horario)
  );
}

export function obterDiasDoPeriodo(dataReferencia, modo) {
  const data = new Date(dataReferencia);

  if (modo === 'dia') {
    return [normalizarDataComparacao(data)];
  }

  if (modo === 'semana') {
    const inicio = normalizarDataComparacao(data);
    const diaSemana = inicio.getDay();
    inicio.setDate(inicio.getDate() - diaSemana);

    return Array.from({ length: 7 }, (_, index) => {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + index);
      return dia;
    });
  }

  const primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);
  const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0);

  const dias = [];
  const atual = new Date(primeiroDia);

  while (atual <= ultimoDia) {
    dias.push(new Date(atual));
    atual.setDate(atual.getDate() + 1);
  }

  return dias;
}

export function movimentarData(data, modo, direcao) {
  const novaData = new Date(data);

  if (modo === 'dia') {
    novaData.setDate(novaData.getDate() + direcao);
  } else if (modo === 'semana') {
    novaData.setDate(novaData.getDate() + direcao * 7);
  } else {
    novaData.setMonth(novaData.getMonth() + direcao);
  }

  return novaData;
}

export function tituloPeriodo(dataReferencia, modo) {
  const data = new Date(dataReferencia);

  if (modo === 'dia') {
    return formatarDataLonga(data);
  }

  if (modo === 'semana') {
    const dias = obterDiasDoPeriodo(data, 'semana');

    if (!dias.length) return '';

    const inicio = dias[0];
    const fim = dias[dias.length - 1];

    return `${inicio.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })} - ${fim.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`;
  }

  return data.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}

export function obterTemplateColunasAgenda(totalDias, modoVisualizacao) {
  if (modoVisualizacao === 'dia') {
    return 'minmax(0, 1fr)';
  }

  return `repeat(${totalDias}, minmax(0, 1fr))`;
}

export function obterLarguraGradeAgenda(totalDias, modoVisualizacao) {
  if (modoVisualizacao === 'mes') {
    return `${(totalDias / 7) * 100}%`;
  }

  return '100%';
}

export function obterTemplateColunasTodosMedicos(totalColunas) {
  if (totalColunas <= 4) {
    return `repeat(${totalColunas}, minmax(0, 1fr))`;
  }

  return `repeat(${totalColunas}, minmax(180px, 1fr))`;
}

export function disponibilidadeValeParaData(item, medicoId, data) {
  if (!item.ativo) return false;
  if (String(item.medicoId) !== String(medicoId)) return false;

  const diaSemana = data.getDay();

  if (Number(item.diaSemana) !== Number(diaSemana)) return false;

  const dataAgendamento = normalizarDataComparacao(data);
  const dataInicio = item.dataInicio ? normalizarDataComparacao(item.dataInicio) : null;
  const dataFim = item.dataFim ? normalizarDataComparacao(item.dataFim) : null;

  if (dataInicio && dataAgendamento < dataInicio) return false;
  if (dataFim && dataAgendamento > dataFim) return false;

  return true;
}

export function ehHoje(data) {
  return formatarDataInput(data) === formatarDataInput(new Date());
}

export function ehPerfilMedico(usuario) {
  const perfil = usuario?.perfil;

  return perfil === 'Medico' || perfil === 'Médico' || Number(perfil) === 3;
}