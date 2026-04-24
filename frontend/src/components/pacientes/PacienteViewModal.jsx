import {
  X,
  UserRound,
  Hash,
  Phone,
  Mail,
  CalendarDays,
  Droplet,
  ShieldAlert,
} from 'lucide-react';

function PacienteViewModal({ isOpen, onClose, paciente }) {
  if (!isOpen || !paciente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <UserRound className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Visualizar paciente
              </h2>
              <p className="text-sm text-gray-500">Paciente #{paciente.id}</p>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoCard icon={Hash} titulo="ID" valor={`#${paciente.id}`} />
            <InfoCard icon={UserRound} titulo="Nome" valor={paciente.nome || 'Não informado'} />
            <InfoCard icon={Droplet} titulo="Tipo sanguíneo" valor={paciente.tipoSanguineo || 'Não informado'} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoBox label="CPF" value={paciente.cpf || 'Não informado'} />
            <InfoBox label="Sexo" value={paciente.sexo || 'Não informado'} />
            <InfoBox
              label="Data de nascimento"
              value={
                paciente.dataNascimento
                  ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')
                  : 'Não informada'
              }
            />
            <InfoBox label="Telefone" value={paciente.telefone || 'Não informado'} />
            <InfoBox label="E-mail" value={paciente.email || 'Não informado'} />
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-3 text-red-700">
              <ShieldAlert className="w-4 h-4" />
              <h3 className="text-sm font-semibold">Contato de emergência</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

function InfoCard({ icon: Icon, titulo, valor }) {
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

export default PacienteViewModal;