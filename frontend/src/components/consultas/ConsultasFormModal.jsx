import { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import {
  CalendarDays,
  ClipboardList,
  UserRound,
  Search,
  Stethoscope,
  Users,
  CheckCircle2,
} from 'lucide-react';

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

  const [buscaMedico, setBuscaMedico] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');

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

      const medicoAtualId = consultaEditando.medicoId?.toString() || '';
      const pacienteAtualId = consultaEditando.pacienteId?.toString() || '';

      setMedicoId(medicoAtualId);
      setPacienteId(pacienteAtualId);

      const medicoAtual = medicos.find((m) => String(m.id) === medicoAtualId);
      const pacienteAtual = pacientes.find((p) => String(p.id) === pacienteAtualId);

      setBuscaMedico(
        medicoAtual
          ? `${medicoAtual.nome} ${medicoAtual.crm ? `- CRM ${medicoAtual.crm}` : ''}`
          : consultaEditando.medico?.nome || ''
      );

      setBuscaPaciente(
        pacienteAtual
          ? `${pacienteAtual.nome} ${pacienteAtual.cpf ? `- CPF ${pacienteAtual.cpf}` : ''}`
          : consultaEditando.paciente?.nome || ''
      );
    } else {
      setDataConsulta('');
      setStatus('Agendada');
      setMotivoConsulta('');
      setObservacoes('');
      setTipoAtendimento('Presencial');
      setValorCobrado('');
      setMedicoId('');
      setPacienteId('');
      setBuscaMedico('');
      setBuscaPaciente('');
    }
  }, [isOpen, consultaEditando, medicos, pacientes]);

  const medicosFiltrados = useMemo(() => {
    const termo = buscaMedico.toLowerCase().trim();

    if (!termo || medicoId) return [];

    return medicos
      .filter((medico) => {
        return (
          (medico.nome || '').toLowerCase().includes(termo) ||
          (medico.crm || '').toLowerCase().includes(termo) ||
          (medico.especialidade || '').toLowerCase().includes(termo)
        );
      })
      .slice(0, 8);
  }, [buscaMedico, medicoId, medicos]);

  const pacientesFiltrados = useMemo(() => {
    const termo = buscaPaciente.toLowerCase().trim();

    if (!termo || pacienteId) return [];

    return pacientes
      .filter((paciente) => {
        return (
          (paciente.nome || '').toLowerCase().includes(termo) ||
          (paciente.cpf || '').toLowerCase().includes(termo) ||
          (paciente.telefone || '').toLowerCase().includes(termo) ||
          (paciente.email || '').toLowerCase().includes(termo)
        );
      })
      .slice(0, 8);
  }, [buscaPaciente, pacienteId, pacientes]);

  const medicoSelecionado = useMemo(() => {
    return medicos.find((medico) => String(medico.id) === String(medicoId));
  }, [medicos, medicoId]);

  const pacienteSelecionado = useMemo(() => {
    return pacientes.find((paciente) => String(paciente.id) === String(pacienteId));
  }, [pacientes, pacienteId]);

  function selecionarMedico(medico) {
    setMedicoId(String(medico.id));
    setBuscaMedico(`${medico.nome} ${medico.crm ? `- CRM ${medico.crm}` : ''}`);
  }

  function selecionarPaciente(paciente) {
    setPacienteId(String(paciente.id));
    setBuscaPaciente(`${paciente.nome} ${paciente.cpf ? `- CPF ${paciente.cpf}` : ''}`);
  }

  function limparMedico() {
    setMedicoId('');
    setBuscaMedico('');
  }

  function limparPaciente() {
    setPacienteId('');
    setBuscaPaciente('');
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!medicoId) {
      alert('Selecione um médico.');
      return;
    }

    if (!pacienteId) {
      alert('Selecione um paciente.');
      return;
    }

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
            Dashboard <span className="mx-1">{'>'}</span> Consultas{' '}
            <span className="mx-1">{'>'}</span>
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
                {consultaEditando
                  ? 'Editar Cadastro de Consulta'
                  : 'Novo Cadastro de Consulta'}
              </h3>
            </div>

            <div className="p-3 space-y-3 flex-1 min-h-0 overflow-y-auto">
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
                      <option value="Pendente">Pendente</option>
                      <option value="EmAndamento">Em andamento</option>
                      <option value="Finalizada">Finalizada</option>
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

              <section>
                <div className="flex items-center gap-2 mb-2">
                  <UserRound className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                    2. Vínculos da Consulta
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <BuscaVinculo
                    label="Médico"
                    placeholder="Buscar por nome, CRM ou especialidade..."
                    valorBusca={buscaMedico}
                    setValorBusca={(valor) => {
                      setBuscaMedico(valor);
                      setMedicoId('');
                    }}
                    selecionado={medicoSelecionado}
                    onLimpar={limparMedico}
                    resultados={medicosFiltrados}
                    onSelecionar={selecionarMedico}
                    tipo="medico"
                    icon={Stethoscope}
                  />

                  <BuscaVinculo
                    label="Paciente"
                    placeholder="Buscar por nome, CPF, telefone ou e-mail..."
                    valorBusca={buscaPaciente}
                    setValorBusca={(valor) => {
                      setBuscaPaciente(valor);
                      setPacienteId('');
                    }}
                    selecionado={pacienteSelecionado}
                    onLimpar={limparPaciente}
                    resultados={pacientesFiltrados}
                    onSelecionar={selecionarPaciente}
                    tipo="paciente"
                    icon={Users}
                  />
                </div>
              </section>

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

function BuscaVinculo({
  label,
  placeholder,
  valorBusca,
  setValorBusca,
  selecionado,
  onLimpar,
  resultados,
  onSelecionar,
  tipo,
  icon: Icon,
}) {
  return (
    <div className="relative">
      <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          value={valorBusca}
          onChange={(e) => setValorBusca(e.target.value)}
          placeholder={placeholder}
          className="w-full h-9 border border-gray-300 rounded-md pl-9 pr-20 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />

        {selecionado && (
          <button
            type="button"
            onClick={onLimpar}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-red-600 hover:text-red-700"
          >
            Limpar
          </button>
        )}
      </div>

      {selecionado && (
        <div className="mt-1 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-[11px] text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="truncate">
            Selecionado: {selecionado.nome}
            {tipo === 'medico' && selecionado.crm ? ` | CRM ${selecionado.crm}` : ''}
            {tipo === 'paciente' && selecionado.cpf ? ` | CPF ${selecionado.cpf}` : ''}
          </span>
        </div>
      )}

      {!selecionado && valorBusca.trim() && (
        <div className="absolute z-50 mt-1 max-h-44 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {resultados.length > 0 ? (
            resultados.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelecionar(item)}
                className="flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2 text-left text-xs hover:bg-blue-50 last:border-b-0"
              >
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">
                    {item.nome}
                  </p>

                  {tipo === 'medico' ? (
                    <p className="truncate text-[11px] text-gray-500">
                      CRM: {item.crm || 'Não informado'} |{' '}
                      {item.especialidade || 'Sem especialidade'}
                    </p>
                  ) : (
                    <p className="truncate text-[11px] text-gray-500">
                      CPF: {item.cpf || 'Não informado'} |{' '}
                      {item.telefone || item.email || 'Sem contato'}
                    </p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-500">
              Nenhum resultado encontrado.
            </div>
          )}
        </div>
      )}
    </div>
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