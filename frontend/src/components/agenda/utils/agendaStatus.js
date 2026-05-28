// src/components/agenda/utils/agendaStatus.js

export function normalizarStatus(status) {
  return (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '')
    .trim();
}

export function corPorStatus(status) {
  const s = normalizarStatus(status);

  if (s === 'agendado' || s === 'agendada') return '#3b82f6';
  if (s === 'atendido' || s === 'atendida' || s === 'atendidorecepcao') return '#f59e0b';
  if (s === 'emandamento' || s === 'ematendimentomedico') return '#06b6d4';
  if (s === 'finalizada' || s === 'finalizado') return '#10b981';
  if (s === 'cancelada' || s === 'cancelado') return '#ef4444';

  return '#64748b';
}

export function classeCardPorStatus(status) {
  const s = normalizarStatus(status);

  if (s === 'agendado' || s === 'agendada') {
    return 'border-blue-200 bg-blue-50/70 hover:bg-blue-50';
  }

  if (s === 'atendido' || s === 'atendida' || s === 'atendidorecepcao') {
    return 'border-amber-200 bg-amber-50/80 hover:bg-amber-50';
  }

  if (s === 'emandamento' || s === 'ematendimentomedico') {
    return 'border-cyan-300 bg-cyan-100 hover:bg-cyan-50';
  }

  if (s === 'finalizada' || s === 'finalizado') {
    return 'border-green-200 bg-green-50/80 hover:bg-green-50';
  }

  if (s === 'cancelada' || s === 'cancelado') {
    return 'border-red-200 bg-red-50/80 opacity-80 hover:bg-red-50';
  }

  return 'border-gray-200 bg-white hover:bg-sky-50';
}

export function formatarStatus(status) {
  const s = normalizarStatus(status);

  if (s === 'agendado' || s === 'agendada') return 'Agendado';
  if (s === 'atendido' || s === 'atendida' || s === 'atendidorecepcao') return 'Atendido recepção';
  if (s === 'emandamento' || s === 'ematendimentomedico') return 'Em atendimento médico';
  if (s === 'finalizada' || s === 'finalizado') return 'Finalizada';
  if (s === 'cancelada' || s === 'cancelado') return 'Cancelada';

  return 'Sem status';
}

export function formatarStatusCompacto(status) {
  const s = normalizarStatus(status);

  if (s === 'agendado' || s === 'agendada') return 'Agendado';
  if (s === 'atendido' || s === 'atendida' || s === 'atendidorecepcao') return 'Recepção';
  if (s === 'emandamento' || s === 'ematendimentomedico') return 'Em atendimento';
  if (s === 'finalizada' || s === 'finalizado') return 'Finalizada';
  if (s === 'cancelada' || s === 'cancelado') return 'Cancelada';

  return 'Status';
}