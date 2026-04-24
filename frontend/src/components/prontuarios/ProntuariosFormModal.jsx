import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { FileText, Stethoscope, ClipboardList } from 'lucide-react';

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
      setReceita(
        prontuarioEditando.receita ||
          prontuarioEditando.prescricao ||
          ''
      );
      setObservacoes(prontuarioEditando.observacoes || '');
      setConsultaId(prontuarioEditando.consultaId?.toString() || '');
    } else {
      setDiagnostico('');
      setReceita('');
      setObservacoes('');
      setConsultaId(consultaSelecionada?.id?.toString() || '');
    }
  }, [isOpen, prontuarioEditando, consultaSelecionada]);

  const handleSubmit = (e) => {
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
  };

  const consultaTravada = !!consultaSelecionada;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="h-full flex flex-col">
        <div className="mb-2">
          <div className="text-[10px] text-gray-500 mb-0.5">
            Dashboard <span className="mx-1">{'>'}</span> Prontuários <span className="mx-1">{'>'}</span>
            <span className="font-semibold text-blue-600">
              {prontuarioEditando ? 'Editar Cadastro' : 'Novo Cadastro'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 leading-tight">
            Cadastro de Prontuários
          </h2>

          <p className="text-[11px] text-gray-500 mt-0.5">
            {prontuarioEditando
              ? 'Atualize as informações do prontuário.'
              : 'Preencha os dados abaixo para cadastrar um novo prontuário.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                {prontuarioEditando ? 'Editar Cadastro de Prontuário' : 'Novo Cadastro de Prontuário'}
              </h3>
            </div>

            <div className="p-3 space-y-3 flex-1 min-h-0 overflow-y-auto">
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                    1. Vínculo da Consulta
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
                      Consulta <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={consultaId}
                      onChange={(e) => setConsultaId(e.target.value)}
                      required
                      disabled={consultaTravada}
                      className={`w-full h-9 border rounded-md px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        consultaTravada
                          ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione uma consulta</option>
                      {consultas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.paciente?.nome || 'Paciente não informado'} - {c.medico?.nome || 'Médico não informado'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                    2. Informações Clínicas
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Campo
                    label="Diagnóstico"
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    required
                    placeholder="Descreva o diagnóstico do paciente"
                  />

                  <Campo
                    label="Receita / Prescrição"
                    value={receita}
                    onChange={(e) => setReceita(e.target.value)}
                    placeholder="Informe a receita, medicação ou conduta prescrita"
                  />

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
                      Observações
                    </label>

                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={5}
                      placeholder="Adicione observações complementares sobre o atendimento"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="px-3 py-2.5 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 shrink-0 sticky bottom-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                {prontuarioEditando ? 'Salvar Cadastro' : 'Cadastrar Prontuário'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
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
      <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        {...props}
      />
    </div>
  );
}

export default ProntuarioFormModal;