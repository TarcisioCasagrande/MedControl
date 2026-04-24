import {
  X,
  FileText,
  UserRound,
  Stethoscope,
  ClipboardList,
  Pill,
  NotebookPen,
  Hash,
} from 'lucide-react';

function ProntuarioViewModal({ isOpen, onClose, prontuario }) {
  if (!isOpen || !prontuario) return null;

  const paciente = prontuario.consulta?.paciente;
  const medico = prontuario.consulta?.medico;
  const consulta = prontuario.consulta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Visualizar prontuário
              </h2>
              <p className="text-sm text-gray-500">
                Prontuário #{prontuario.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoCard
              icon={Hash}
              titulo="ID do prontuário"
              valor={`#${prontuario.id}`}
              cor="blue"
            />

            <InfoCard
              icon={UserRound}
              titulo="Paciente"
              valor={paciente?.nome || 'Não informado'}
              subtitulo={paciente?.id ? `Paciente #${paciente.id}` : 'Sem ID relacionado'}
              cor="green"
            />

            <InfoCard
              icon={Stethoscope}
              titulo="Médico"
              valor={medico?.nome || 'Não informado'}
              subtitulo={medico?.id ? `Médico #${medico.id}` : 'Sem ID relacionado'}
              cor="violet"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextoCard
              icon={ClipboardList}
              titulo="Diagnóstico"
              conteudo={prontuario.diagnostico}
              cor="violet"
            />

            <TextoCard
              icon={Pill}
              titulo="Receita"
              conteudo={prontuario.receita}
              cor="amber"
            />
          </div>

          <TextoCard
            icon={NotebookPen}
            titulo="Observações"
            conteudo={prontuario.observacoes}
            cor="slate"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoBox
              label="Consulta vinculada"
              value={consulta?.id ? `#${consulta.id}` : 'Não informada'}
            />

            <InfoBox
              label="Data da consulta"
              value={consulta?.dataConsulta ? formatarDataHora(consulta.dataConsulta) : 'Não informada'}
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, titulo, valor, subtitulo, cor = 'blue' }) {
  const cores = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
  };

  const estilo = cores[cor] || cores.blue;

  return (
    <div className={`rounded-xl border p-4 ${estilo}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide font-semibold opacity-80">
            {titulo}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{valor}</p>
          {subtitulo && (
            <p className="mt-1 text-xs text-gray-500">{subtitulo}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TextoCard({ icon: Icon, titulo, conteudo, cor = 'slate' }) {
  const cores = {
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  const estilo = cores[cor] || cores.slate;

  return (
    <div className={`rounded-xl border ${estilo}`}>
      <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
        <Icon className="w-4 h-4" />
        <h3 className="text-sm font-semibold">{titulo}</h3>
      </div>

      <div className="px-4 py-4">
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {conteudo || 'Nenhuma informação registrada.'}
        </p>
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

function formatarDataHora(data) {
  const d = new Date(data);

  return d.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default ProntuarioViewModal;