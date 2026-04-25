import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import {
  FileText,
  Stethoscope,
  ClipboardList,
  Pill,
  MessageSquareText,
} from 'lucide-react';

function ProntuarioFormModal({
  isOpen,
  onClose,
  prontuarioEditando,
  onSalvar,
  consultas,
  consultaSelecionada,
}) {
  const [diagnostico, setDiagnostico] = useState('');
  const [receita, setReceita] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [consultaId, setConsultaId] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (prontuarioEditando) {
      setDiagnostico(prontuarioEditando.diagnostico || '');
      setReceita(prontuarioEditando.receita || prontuarioEditando.prescricao || '');
      setObservacoes(prontuarioEditando.observacoes || '');
      setConsultaId(prontuarioEditando.consultaId?.toString() || '');
    } else {
      setDiagnostico('');
      setReceita('');
      setObservacoes('');
      setConsultaId(consultaSelecionada?.id?.toString() || '');
    }
  }, [isOpen, prontuarioEditando, consultaSelecionada]);

  function handleSubmit(e) {
    e.preventDefault();

    const prontuario = {
      diagnostico,
      receita,
      prescricao: receita,
      observacoes,
      consultaId: parseInt(consultaId),
    };

    if (prontuarioEditando) {
      prontuario.id = prontuarioEditando.id;
    }

    onSalvar(prontuario);
  }

  const consultaTravada = !!consultaSelecionada;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="flex h-[82vh] flex-col overflow-hidden">
        <div className="mb-2 shrink-0">
          <div className="mb-0.5 text-[10px] text-gray-500">
            Dashboard &gt; Prontuários &gt;{' '}
            <span className="font-semibold text-blue-600">
              {prontuarioEditando ? 'Editar' : 'Novo'}
            </span>
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Cadastro de Prontuário
          </h2>

          <p className="text-[11px] text-gray-500">
            {prontuarioEditando
              ? 'Atualize as informações do prontuário.'
              : 'Preencha os dados para cadastrar.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <Section icon={ClipboardList} title="Vínculo da consulta">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-600">
                    Consulta <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={consultaId}
                    onChange={(e) => setConsultaId(e.target.value)}
                    required
                    disabled={consultaTravada}
                    className={`h-8 w-full rounded-md border px-2 text-[11px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      consultaTravada
                        ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="">Selecione uma consulta</option>
                    {consultas.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.id} - {c.paciente?.nome || 'Paciente não informado'} |{' '}
                        {c.medico?.nome || 'Médico não informado'}
                      </option>
                    ))}
                  </select>
                </div>
              </Section>

              <Section icon={Stethoscope} title="Informações clínicas">
                <div className="grid grid-cols-2 gap-2">
                  <Campo
                    label="Diagnóstico"
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    required
                    placeholder="Descreva o diagnóstico"
                  />

                  <Campo
                    label="Receita / Prescrição"
                    value={receita}
                    onChange={(e) => setReceita(e.target.value)}
                    placeholder="Medicação ou conduta"
                  />

                  <div className="col-span-2">
                    <label className="mb-1 block text-[11px] font-medium text-gray-600">
                      Observações
                    </label>

                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={4}
                      placeholder="Observações complementares sobre o atendimento"
                      className="w-full resize-none rounded-md border border-gray-300 px-2 py-2 text-[11px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </Section>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <InfoMini
                  icon={FileText}
                  titulo="Consulta"
                  valor={consultaId ? `#${consultaId}` : 'Não selecionada'}
                  cor="blue"
                />

                <InfoMini
                  icon={Pill}
                  titulo="Prescrição"
                  valor={receita ? 'Preenchida' : 'Pendente'}
                  cor="green"
                />

                <InfoMini
                  icon={MessageSquareText}
                  titulo="Observações"
                  valor={observacoes ? 'Registradas' : 'Sem observações'}
                  cor="violet"
                />
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-gray-300 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-400"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-md bg-green-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-green-700"
              >
                {prontuarioEditando ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="mb-3 last:mb-0">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      </div>

      {children}
    </section>
  );
}

function Campo({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  ...props
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="h-8 w-full rounded-md border border-gray-300 px-2 text-[11px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}

function InfoMini({ icon: Icon, titulo, valor, cor }) {
  const cores = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 ${cores[cor] || cores.blue}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" />

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase">{titulo}</p>
          <p className="truncate text-[11px] font-semibold">{valor}</p>
        </div>
      </div>
    </div>
  );
}

export default ProntuarioFormModal;