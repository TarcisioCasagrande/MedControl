import {
  X,
  User,
  Hash,
  Stethoscope,
  Phone,
  Mail,
  Clock3,
  BadgeCheck,
  Building2,
} from 'lucide-react';

function MedicoViewModal({ isOpen, onClose, medico }) {
  if (!isOpen || !medico) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-sky-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <User className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black">Visualizar médico</h2>
              <p className="text-xs text-sky-100">Médico #{medico.id}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoCard icon={Hash} titulo="ID" valor={`#${medico.id}`} />
            <InfoCard
              icon={User}
              titulo="Nome"
              valor={medico.nome || 'Não informado'}
            />
            <InfoCard
              icon={Stethoscope}
              titulo="Especialidade"
              valor={medico.especialidade || 'Não informada'}
            />
          </div>

          <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-black text-gray-900">
                Dados profissionais e contato
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoBox icon={Hash} label="CRM" value={medico.crm || medico.CRM || 'Não informado'} />
              <InfoBox icon={Phone} label="Telefone" value={medico.telefone || 'Não informado'} />
              <InfoBox icon={Mail} label="E-mail" value={medico.email || 'Não informado'} />
              <InfoBox icon={Clock3} label="Turno de atendimento" value={medico.turnoAtendimento || 'Não informado'} />
              <InfoBox icon={Building2} label="Clínica / Local" value={medico.clinica || 'Não informado'} wide />
            </div>
          </section>
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white transition hover:bg-sky-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, titulo, valor }) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            {titulo}
          </p>
          <p className="mt-1 truncate text-sm font-black text-gray-900">{valor}</p>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, wide }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-gray-50 p-4 ${
        wide ? 'md:col-span-2' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MedicoViewModal;