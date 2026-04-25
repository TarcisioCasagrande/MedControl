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
} from 'lucide-react';

function ConsultaViewModal({ isOpen, onClose, consulta }) {
  if (!isOpen || !consulta) return null;

  const paciente = consulta.paciente;
  const medico = consulta.medico;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Visualizar consulta
              </h2>
              <p className="text-xs text-gray-500">Consulta #{consulta.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-4 grid grid-cols-4 gap-3">
            <InfoCard icon={Hash} titulo="ID" valor={`#${consulta.id}`} />
            <InfoCard
              icon={CalendarDays}
              titulo="Data"
              valor={formatarData(consulta.dataConsulta)}
            />
            <InfoCard
              icon={Clock3}
              titulo="Horário"
              valor={formatarHora(consulta.dataConsulta)}
            />
            <InfoCard
              icon={ClipboardList}
              titulo="Status"
              valor={formatarStatus(consulta.status)}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <InfoCard
              icon={UserRound}
              titulo="Paciente"
              valor={paciente?.nome || 'Não informado'}
              subtitulo={paciente?.id ? `Paciente #${paciente.id}` : ''}
            />

            <InfoCard
              icon={Stethoscope}
              titulo="Médico"
              valor={medico?.nome || 'Não informado'}
              subtitulo={medico?.id ? `Médico #${medico.id}` : ''}
            />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <InfoBox
              icon={Monitor}
              label="Tipo de atendimento"
              value={consulta.tipoAtendimento || 'Não informado'}
            />

            <InfoBox
              icon={DollarSign}
              label="Valor cobrado"
              value={formatarMoeda(consulta.valorCobrado)}
            />

            <InfoBox
              icon={FileText}
              label="Motivo"
              value={consulta.motivoConsulta || 'Não informado'}
            />
          </div>

          <TextoCard titulo="Observações" conteudo={consulta.observacoes} />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoBox
              icon={PlayCircle}
              label="Início do atendimento"
              value={
                consulta.dataInicioAtendimento
                  ? formatarDataHora(consulta.dataInicioAtendimento)
                  : 'Não registrado'
              }
            />

            <InfoBox
              icon={CheckCircle2}
              label="Fim do atendimento"
              value={
                consulta.dataFimAtendimento
                  ? formatarDataHora(consulta.dataFimAtendimento)
                  : 'Não registrado'
              }
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            type="button"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, titulo, valor, subtitulo }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/80 text-blue-700">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
            {titulo}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
            {valor}
          </p>
          {subtitulo && (
            <p className="mt-0.5 truncate text-[11px] text-gray-500">
              {subtitulo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3">
      <div className="flex items-start gap-2">
        {Icon && <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />}

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {label}
          </p>
          <p className="mt-1 truncate text-sm font-medium text-gray-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function TextoCard({ titulo, conteudo }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50">
      <div className="border-b border-black/5 px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-700">{titulo}</h3>
      </div>

      <div className="px-3 py-3">
        <p className="max-h-24 overflow-y-auto whitespace-pre-wrap text-sm leading-5 text-gray-700">
          {conteudo || 'Nenhuma informação registrada.'}
        </p>
      </div>
    </div>
  );
}

function formatarData(data) {
  if (!data) return 'Não informada';
  return new Date(data).toLocaleDateString('pt-BR');
}

function formatarHora(data) {
  if (!data) return 'Não informado';

  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarDataHora(data) {
  if (!data) return 'Não registrado';

  return new Date(data).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatarMoeda(valor) {
  if (valor === undefined || valor === null) return 'Não informado';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor));
}

function formatarStatus(status) {
  const valor = (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (valor === 'emandamento') return 'Em andamento';
  if (valor === 'finalizada' || valor === 'realizada' || valor === 'concluida') {
    return 'Finalizada';
  }
  if (valor === 'agendada') return 'Agendada';
  if (valor === 'pendente') return 'Pendente';
  if (valor === 'cancelada') return 'Cancelada';

  return 'Sem status';
}

export default ConsultaViewModal;