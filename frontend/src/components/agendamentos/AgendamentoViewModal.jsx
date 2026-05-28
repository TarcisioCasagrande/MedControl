import {
  X,
  CalendarDays,
  Hash,
  UserRound,
  Stethoscope,
  Clock3,
  DollarSign,
  ClipboardList,
  Monitor,
  FileText,
  PlayCircle,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';

function AgendamentoViewModal({
  isOpen,
  onClose,
  agendamento,
}) {
  if (!isOpen || !agendamento) return null;

  const paciente = agendamento.paciente;
  const medico = agendamento.medico;
  const procedimento = agendamento.procedimento;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between bg-blue-600 px-6 py-4 text-white">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black">
                Visualizar agendamento
              </h2>

              <p className="text-xs text-blue-100">
                Agendamento #{agendamento.id}
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">

            <InfoCard
              icon={Hash}
              titulo="ID"
              valor={`#${agendamento.id}`}
              cor="blue"
            />

            <InfoCard
              icon={CalendarDays}
              titulo="Data"
              valor={formatarData(
                agendamento.dataAgendamento
              )}
              cor="violet"
            />

            <InfoCard
              icon={Clock3}
              titulo="Horário"
              valor={formatarHora(
                agendamento.dataAgendamento
              )}
              cor="amber"
            />

            <InfoCard
              icon={BadgeCheck}
              titulo="Status"
              valor={formatarStatus(
                agendamento.status
              )}
              cor="green"
            />

          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">

            <InfoCard
              icon={UserRound}
              titulo="Paciente"
              valor={
                paciente?.nome ||
                'Não informado'
              }
              subtitulo={
                paciente?.id
                  ? `Paciente #${paciente.id}`
                  : ''
              }
              cor="blue"
            />

            <InfoCard
              icon={Stethoscope}
              titulo="Médico"
              valor={
                medico?.nome ||
                'Não informado'
              }
              subtitulo={
                medico?.id
                  ? `Médico #${medico.id}`
                  : ''
              }
              cor="violet"
            />

            <InfoCard
              icon={ClipboardList}
              titulo="Procedimento"
              valor={
                procedimento?.nome ||
                'Não informado'
              }
              subtitulo={
                procedimento?.codigo
                  ? `Código ${procedimento.codigo}`
                  : ''
              }
              cor="green"
            />

          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">

            <InfoBox
              icon={Monitor}
              label="Tipo de atendimento"
              value={
                agendamento.tipoAtendimento ||
                'Não informado'
              }
            />

            <InfoBox
              icon={DollarSign}
              label="Valor do procedimento"
              value={formatarMoeda(
                agendamento.valorCobrado ??
                  procedimento?.valor
              )}
            />

            <InfoBox
              icon={ClipboardList}
              label="Status atual"
              value={formatarStatus(
                agendamento.status
              )}
            />

          </div>

          <div className="mt-4">

            <TextoCard
              titulo="Motivo do agendamento"
              conteudo={
                agendamento.motivoAgendamento
              }
            />

          </div>

          <div className="mt-4">

            <TextoCard
              titulo="Observações"
              conteudo={
                agendamento.observacoes
              }
            />

          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">

            <InfoBox
              icon={PlayCircle}
              label="Início do atendimento"
              value={
                agendamento.dataInicioAtendimento
                  ? formatarDataHora(
                      agendamento.dataInicioAtendimento
                    )
                  : 'Não registrado'
              }
            />

            <InfoBox
              icon={CheckCircle2}
              label="Fim do atendimento"
              value={
                agendamento.dataFimAtendimento
                  ? formatarDataHora(
                      agendamento.dataFimAtendimento
                    )
                  : 'Não registrado'
              }
            />

          </div>

        </div>

        <div className="flex justify-end border-t border-gray-200 bg-white px-6 py-4">

          <button
            onClick={onClose}
            className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
            type="button"
          >
            Fechar
          </button>

        </div>

      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  titulo,
  valor,
  subtitulo,
  cor,
}) {
  const cores = {
    blue: {
      box: 'border-blue-200 bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      title: 'text-blue-700',
    },

    violet: {
      box: 'border-violet-200 bg-violet-50',
      icon: 'bg-violet-100 text-violet-600',
      title: 'text-violet-700',
    },

    green: {
      box: 'border-green-200 bg-green-50',
      icon: 'bg-green-100 text-green-600',
      title: 'text-green-700',
    },

    amber: {
      box: 'border-amber-200 bg-amber-50',
      icon: 'bg-amber-100 text-amber-600',
      title: 'text-amber-700',
    },
  };

  const estilo = cores[cor] || cores.blue;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${estilo.box}`}
    >
      <div className="flex items-start gap-3">

        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${estilo.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <p
            className={`text-[11px] font-bold uppercase tracking-wide ${estilo.title}`}
          >
            {titulo}
          </p>

          <div className="mt-1 break-words text-sm font-black text-gray-900">
            {valor || '-'}
          </div>

          {subtitulo && (
            <p className="mt-1 text-[11px] text-gray-500">
              {subtitulo}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
          {Icon && (
            <Icon className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
            {label}
          </p>

          <div className="mt-1 break-words text-sm font-semibold text-gray-900">
            {value || '-'}
          </div>

        </div>
      </div>
    </div>
  );
}

function TextoCard({
  titulo,
  conteudo,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-600" />

        <h3 className="text-sm font-black text-gray-900">
          {titulo}
        </h3>
      </div>

      <div className="max-h-[220px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-relaxed text-gray-700">
        {conteudo ||
          'Nenhuma informação registrada.'}
      </div>

    </section>
  );
}

function formatarData(data) {
  if (!data) return 'Não informada';

  const dataFormatada = new Date(data);

  if (
    Number.isNaN(
      dataFormatada.getTime()
    )
  ) {
    return 'Não informada';
  }

  return dataFormatada.toLocaleDateString(
    'pt-BR'
  );
}

function formatarHora(data) {
  if (!data) return 'Não informado';

  const dataFormatada = new Date(data);

  if (
    Number.isNaN(
      dataFormatada.getTime()
    )
  ) {
    return 'Não informado';
  }

  return dataFormatada.toLocaleTimeString(
    'pt-BR',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );
}

function formatarDataHora(data) {
  if (!data) return 'Não registrado';

  const dataFormatada = new Date(data);

  if (
    Number.isNaN(
      dataFormatada.getTime()
    )
  ) {
    return 'Não registrado';
  }

  return dataFormatada.toLocaleString(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    }
  );
}

function formatarMoeda(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return 'Não informado';
  }

  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  ).format(Number(valor));
}

function formatarStatus(status) {
  const valor = (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();

  if (valor === 'emandamento') {
    return 'Em andamento';
  }

  if (
    valor === 'finalizada' ||
    valor === 'realizada' ||
    valor === 'concluida'
  ) {
    return 'Finalizada';
  }

  if (
    valor === 'agendado' ||
    valor === 'agendada'
  ) {
    return 'Agendado';
  }

  if (valor === 'pendente') {
    return 'Pendente';
  }

  if (
    valor === 'cancelada' ||
    valor === 'cancelado'
  ) {
    return 'Cancelada';
  }

  return 'Sem status';
}

export default AgendamentoViewModal;