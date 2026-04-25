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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <UserRound className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Visualizar paciente
              </h2>
              <p className="text-xs text-gray-500">Paciente #{paciente.id}</p>
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
          <div className="mb-4 grid grid-cols-3 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
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

            <InfoBox
              icon={Phone}
              label="Telefone"
              value={paciente.telefone || 'Não informado'}
            />

            <InfoBox
              icon={Mail}
              label="E-mail"
              value={paciente.email || 'Não informado'}
              wide
            />
          </div>

          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="mb-3 flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Contato de emergência</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoBox
                label="Nome"
                value={paciente.nomeContatoEmergencia || 'Não informado'}
              />
              <InfoBox
                label="Telefone"
                value={paciente.telefoneContatoEmergencia || 'Não informado'}
              />
            </div>
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

function InfoCard({ icon: Icon, titulo, valor }) {
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
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, wide }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white px-3 py-3 ${
        wide ? 'col-span-2' : ''
      }`}
    >
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

export default PacienteViewModal;