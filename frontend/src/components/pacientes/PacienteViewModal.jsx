import {
  X,
  UserRound,
  Hash,
  Phone,
  Mail,
  CalendarDays,
  Droplet,
  ShieldAlert,
  IdCard,
  VenusAndMars,
} from 'lucide-react';

function PacienteViewModal({ isOpen, onClose, paciente }) {
  if (!isOpen || !paciente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-sky-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black">Visualizar paciente</h2>
              <p className="text-xs text-sky-100">Paciente #{paciente.id}</p>
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
            <InfoCard icon={Hash} titulo="ID" valor={`#${paciente.id}`} />
            <InfoCard
              icon={UserRound}
              titulo="Nome"
              valor={paciente.nome || 'Não informado'}
            />
            <InfoCard
              icon={Droplet}
              titulo="Tipo sanguíneo"
              valor={paciente.tipoSanguineo || 'Não informado'}
            />
          </div>

          <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <IdCard className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-black text-gray-900">
                Dados pessoais
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoBox icon={IdCard} label="CPF" value={paciente.cpf || 'Não informado'} />
              <InfoBox icon={VenusAndMars} label="Sexo" value={paciente.sexo || 'Não informado'} />
              <InfoBox
                icon={CalendarDays}
                label="Data de nascimento"
                value={
                  paciente.dataNascimento
                    ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')
                    : 'Não informada'
                }
              />
              <InfoBox icon={Phone} label="Telefone" value={paciente.telefone || 'Não informado'} />
              <InfoBox icon={Mail} label="E-mail" value={paciente.email || 'Não informado'} wide />
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-4 w-4" />
              <h3 className="text-sm font-black">Contato de emergência</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoBox
                label="Nome"
                value={paciente.nomeContatoEmergencia || 'Não informado'}
              />
              <InfoBox
                icon={Phone}
                label="Telefone"
                value={paciente.telefoneContatoEmergencia || 'Não informado'}
              />
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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            {titulo}
          </p>
          <p className="mt-1 truncate text-sm font-black text-gray-900">
            {valor}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, wide }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 ${
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

export default PacienteViewModal;