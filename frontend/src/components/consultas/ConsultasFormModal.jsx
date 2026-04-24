import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { CalendarDays, ClipboardList, UserRound } from 'lucide-react';

function ConsultaFormModal({
  isOpen,
  onClose,
  consultaEditando,
  onSalvar,
  medicos,
  pacientes,
}) {
  const [dataConsulta, setDataConsulta] = useState('');
  const [status, setStatus] = useState('Agendada');
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tipoAtendimento, setTipoAtendimento] = useState('Presencial');
  const [valorCobrado, setValorCobrado] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [pacienteId, setPacienteId] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (consultaEditando) {
      const dataFormatada = consultaEditando.dataConsulta
        ? new Date(consultaEditando.dataConsulta).toISOString().slice(0, 16)
        : '';

      setDataConsulta(dataFormatada);
      setStatus(consultaEditando.status || 'Agendada');
      setMotivoConsulta(consultaEditando.motivoConsulta || '');
      setObservacoes(consultaEditando.observacoes || '');
      setTipoAtendimento(consultaEditando.tipoAtendimento || 'Presencial');
      setValorCobrado(
        consultaEditando.valorCobrado !== undefined &&
          consultaEditando.valorCobrado !== null
          ? consultaEditando.valorCobrado
          : ''
      );
      setMedicoId(consultaEditando.medicoId?.toString() || '');
      setPacienteId(consultaEditando.pacienteId?.toString() || '');
    } else {
      setDataConsulta('');
      setStatus('Agendada');
      setMotivoConsulta('');
      setObservacoes('');
      setTipoAtendimento('Presencial');
      setValorCobrado('');
      setMedicoId('');
      setPacienteId('');
    }
  }, [isOpen, consultaEditando]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const consulta = {
      dataConsulta: new Date(dataConsulta).toISOString(),
      status,
      motivoConsulta,
      observacoes,
      tipoAtendimento,
      valorCobrado: valorCobrado === '' ? 0 : Number(valorCobrado),
      medicoId: parseInt(medicoId),
      pacienteId: parseInt(pacienteId),
    };

    if (consultaEditando) {
      consulta.id = consultaEditando.id;
    }

    onSalvar(consulta);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="h-full flex flex-col">
        <div className="mb-2">
          <div className="text-[10px] text-gray-500 mb-0.5">
            Dashboard <span className="mx-1">{'>'}</span> Consultas <span className="mx-1">{'>'}</span>
            <span className="font-semibold text-blue-600">
              {consultaEditando ? 'Editar Cadastro' : 'Novo Cadastro'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 leading-tight">
            Cadastro de Consultas
          </h2>

          <p className="text-[11px] text-gray-500 mt-0.5">
            {consultaEditando
              ? 'Atualize as informações da consulta.'
              : 'Preencha os dados abaixo para cadastrar uma nova consulta.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                {consultaEditando ? 'Editar Cadastro de Consulta' : 'Novo Cadastro de Consulta'}
              </h3>
            </div>

            <div className="p-3 space-y-3 flex-1 min-h-0 overflow-y-auto">
              {/* 1. Dados da Consulta */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                    1. Dados da Consulta
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  <Campo
                    label="Data e Horário"
                    type="datetime-local"
                    value={dataConsulta}
                    onChange={(e) => setDataConsulta(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Agendada">Agendada</option>
                      <option value="Concluída">Concluída</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
                      Tipo de Atendimento
                    </label>
                    <select
                      value={tipoAtendimento}
                      onChange={(e) => setTipoAtendimento(e.target.value)}
                      className="w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Presencial">Presencial</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Campo
                      label="Motivo da Consulta"
                      value={motivoConsulta}
                      onChange={(e) => setMotivoConsulta(e.target.value)}
                      required
                      placeholder="Ex: Dor de cabeça, retorno..."
                    />
                  </div>

                  <Campo
                    label="Valor da Consulta"
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorCobrado}
                    onChange={(e) => setValorCobrado(e.target.value)}
                    placeholder="Ex: 200.00"
                  />
                </div>
              </section>

              {/* 2. Vínculos */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <UserRound className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                    2. Vínculos da Consulta
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
                      Médico
                    </label>
                    <select
                      value={medicoId}
                      onChange={(e) => setMedicoId(e.target.value)}
                      required
                      className="w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione</option>
                      {medicos.map((medico) => (
                        <option key={medico.id} value={medico.id}>
                          {medico.nome} - {medico.especialidade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
                      Paciente
                    </label>
                    <select
                      value={pacienteId}
                      onChange={(e) => setPacienteId(e.target.value)}
                      required
                      className="w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione</option>
                      {pacientes.map((paciente) => (
                        <option key={paciente.id} value={paciente.id}>
                          {paciente.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* 3. Observações */}
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                    3. Observações
                  </h4>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={2}
                    placeholder="Digite observações importantes sobre a consulta..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                {consultaEditando ? 'Salvar Cadastro' : 'Cadastrar Consulta'}
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

export default ConsultaFormModal;