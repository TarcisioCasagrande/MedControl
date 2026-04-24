import {
  X,
  CalendarDays,
  Hash,
  UserRound,
  Stethoscope,
  Clock3,
  DollarSign,
  ClipboardList,
  MapPin,
} from 'lucide-react';

function ConsultaViewModal({ isOpen, onClose, consulta }) {
  if (!isOpen || !consulta) return null;

  const paciente = consulta.paciente;
  const medico = consulta.medico;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Visualizar consulta
              </h2>
              <p className="text-sm text-gray-500">Consulta #{consulta.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <InfoCard icon={Hash} titulo="ID" valor={`#${consulta.id}`} />
            <InfoCard icon={CalendarDays} titulo="Data" valor={formatarData(consulta.dataConsulta)} />
            <InfoCard icon={Clock3} titulo="Horário" valor={formatarHora(consulta.dataConsulta)} />
            <InfoCard icon={ClipboardList} titulo="Status" valor={formatarStatus(consulta.status)} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoBox label="Tipo de atendimento" value={consulta.tipoAtendimento || 'Não informado'} />
            <InfoBox
              label="Valor cobrado"
              value={
                consulta.valorCobrado !== undefined && consulta.valorCobrado !== null
                  ? new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(Number(consulta.valorCobrado))
                  : 'Não informado'
              }
            />
            <InfoBox label="Motivo" value={consulta.motivoConsulta || 'Não informado'} />
          </div>

          <TextoCard titulo="Observações" conteudo={consulta.observacoes} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoBox
              label="Início do atendimento"
              value={
                consulta.dataInicioAtendimento
                  ? formatarDataHora(consulta.dataInicioAtendimento)
                  : 'Não registrado'
              }
            />

            <InfoBox
              label="Fim do atendimento"
              value={
                consulta.dataFimAtendimento
                  ? formatarDataHora(consulta.dataFimAtendimento)
                  : 'Não registrado'
              }
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
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
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center text-blue-700">
          <Icon className="w-5 h-5" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide font-semibold text-blue-700">
            {titulo}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{valor}</p>
          {subtitulo && <p className="mt-1 text-xs text-gray-500">{subtitulo}</p>}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide font-semibold text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function TextoCard({ titulo, conteudo }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50">
      <div className="border-b border-black/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-700">{titulo}</h3>
      </div>

      <div className="px-4 py-4">
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
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

function formatarStatus(status) {
  const valor = (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (valor === 'emandamento') return 'Em andamento';
  if (valor === 'finalizada' || valor === 'realizada' || valor === 'concluida') return 'Finalizada';
  if (valor === 'agendada') return 'Agendada';
  if (valor === 'pendente') return 'Pendente';
  if (valor === 'cancelada') return 'Cancelada';

  return 'Sem status';
}

export default ConsultaViewModal;