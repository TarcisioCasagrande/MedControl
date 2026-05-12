import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  ClipboardList,
  UserRound,
  Search,
  Stethoscope,
  Users,
  CheckCircle2,
  BadgeDollarSign,
  UserPlus,
  X,
  Save,
  Video,
  MapPin,
} from 'lucide-react';
import { getProcedimentos } from '../../services/procedimentosService';

function AgendamentoFormModal({
  isOpen,
  onClose,
  agendamentoEditando,
  onSalvar,
  medicos,
  pacientes,
  onCadastrarNovoPaciente,
}) {
  const [procedimentos, setProcedimentos] = useState([]);

  const [dataAgendamento, setDataAgendamento] = useState('');
  const [status, setStatus] = useState('Agendado');
  const [motivoAgendamento, setMotivoAgendamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tipoAtendimento, setTipoAtendimento] = useState('Presencial');
  const [medicoId, setMedicoId] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [procedimentoId, setProcedimentoId] = useState('');

  const [buscaMedico, setBuscaMedico] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [buscaProcedimento, setBuscaProcedimento] = useState('');
  const [erroFormulario, setErroFormulario] = useState('');

  const estaEditando = Boolean(agendamentoEditando?.id);

  useEffect(() => {
    if (!isOpen) return;
    carregarProcedimentos();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setErroFormulario('');

    if (agendamentoEditando) {
      const dataFormatada = agendamentoEditando.dataAgendamento
        ? formatarParaDatetimeLocal(agendamentoEditando.dataAgendamento)
        : '';

      setDataAgendamento(dataFormatada);
      setStatus(agendamentoEditando.status || 'Agendado');
      setMotivoAgendamento(agendamentoEditando.motivoAgendamento || '');
      setObservacoes(agendamentoEditando.observacoes || '');
      setTipoAtendimento(agendamentoEditando.tipoAtendimento || 'Presencial');

      const medicoAtualId = agendamentoEditando.medicoId?.toString() || '';
      const pacienteAtualId = agendamentoEditando.pacienteId?.toString() || '';
      const procedimentoAtualId =
        agendamentoEditando.procedimentoId?.toString() || '';

      setMedicoId(medicoAtualId);
      setPacienteId(pacienteAtualId);
      setProcedimentoId(procedimentoAtualId);

      const medicoAtual = medicos.find((m) => String(m.id) === medicoAtualId);
      const pacienteAtual = pacientes.find((p) => String(p.id) === pacienteAtualId);
      const procedimentoAtual = agendamentoEditando.procedimento;

      setBuscaMedico(
        medicoAtual
          ? `${medicoAtual.nome} ${medicoAtual.crm ? `- CRM ${medicoAtual.crm}` : ''}`
          : agendamentoEditando.medico?.nome || ''
      );

      setBuscaPaciente(
        pacienteAtual
          ? `${pacienteAtual.nome} ${
              pacienteAtual.cpf ? `- CPF ${pacienteAtual.cpf}` : ''
            }`
          : agendamentoEditando.paciente?.nome || ''
      );

      setBuscaProcedimento(
        procedimentoAtual
          ? `${procedimentoAtual.codigo ? `${procedimentoAtual.codigo} - ` : ''}${
              procedimentoAtual.nome
            }`
          : ''
      );
    } else {
      limparFormulario();
    }
  }, [isOpen, agendamentoEditando, medicos, pacientes]);

  async function carregarProcedimentos() {
    try {
      const dados = await getProcedimentos();
      setProcedimentos(dados || []);
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error);
      setProcedimentos([]);
    }
  }

  function limparFormulario() {
    setDataAgendamento('');
    setStatus('Agendado');
    setMotivoAgendamento('');
    setObservacoes('');
    setTipoAtendimento('Presencial');
    setMedicoId('');
    setPacienteId('');
    setProcedimentoId('');
    setBuscaMedico('');
    setBuscaPaciente('');
    setBuscaProcedimento('');
    setErroFormulario('');
  }

  const medicosFiltrados = useMemo(() => {
    const termo = buscaMedico.toLowerCase().trim();
    if (!termo || medicoId) return [];

    return medicos
      .filter((medico) =>
        `${medico.nome || ''} ${medico.crm || ''} ${medico.especialidade || ''}`
          .toLowerCase()
          .includes(termo)
      )
      .slice(0, 6);
  }, [buscaMedico, medicoId, medicos]);

  const pacientesFiltrados = useMemo(() => {
    const termo = buscaPaciente.toLowerCase().trim();
    if (!termo || pacienteId) return [];

    return pacientes
      .filter((paciente) =>
        `${paciente.nome || ''} ${paciente.cpf || ''} ${paciente.telefone || ''} ${
          paciente.email || ''
        }`
          .toLowerCase()
          .includes(termo)
      )
      .slice(0, 6);
  }, [buscaPaciente, pacienteId, pacientes]);

  const procedimentosFiltrados = useMemo(() => {
    const termo = buscaProcedimento.toLowerCase().trim();
    if (!termo || procedimentoId) return [];

    return procedimentos
      .filter((procedimento) => {
        const ativo = procedimento.ativo === undefined || procedimento.ativo === true;

        return (
          ativo &&
          `${procedimento.nome || ''} ${procedimento.codigo || ''}`
            .toLowerCase()
            .includes(termo)
        );
      })
      .slice(0, 6);
  }, [buscaProcedimento, procedimentoId, procedimentos]);

  const medicoSelecionado = useMemo(
    () => medicos.find((medico) => String(medico.id) === String(medicoId)),
    [medicos, medicoId]
  );

  const pacienteSelecionado = useMemo(
    () => pacientes.find((paciente) => String(paciente.id) === String(pacienteId)),
    [pacientes, pacienteId]
  );

  const procedimentoSelecionado = useMemo(
    () =>
      procedimentos.find(
        (procedimento) => String(procedimento.id) === String(procedimentoId)
      ) || agendamentoEditando?.procedimento,
    [procedimentos, procedimentoId, agendamentoEditando]
  );

  function selecionarMedico(medico) {
    setMedicoId(String(medico.id));
    setBuscaMedico(`${medico.nome} ${medico.crm ? `- CRM ${medico.crm}` : ''}`);
  }

  function selecionarPaciente(paciente) {
    setPacienteId(String(paciente.id));
    setBuscaPaciente(
      `${paciente.nome} ${paciente.cpf ? `- CPF ${paciente.cpf}` : ''}`
    );
  }

  function selecionarProcedimento(procedimento) {
    setProcedimentoId(String(procedimento.id));
    setBuscaProcedimento(
      `${procedimento.codigo ? `${procedimento.codigo} - ` : ''}${procedimento.nome}`
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    setErroFormulario('');

    if (!dataAgendamento) {
      setErroFormulario('Informe a data e o horário do agendamento.');
      return;
    }

    if (!medicoId) {
      setErroFormulario('Selecione um médico.');
      return;
    }

    if (!pacienteId) {
      setErroFormulario('Selecione um paciente.');
      return;
    }

    if (!procedimentoId) {
      setErroFormulario('Selecione um procedimento.');
      return;
    }

    const agendamento = {
      dataAgendamento: new Date(dataAgendamento).toISOString(),
      status: status || 'Agendado',
      motivoAgendamento,
      observacoes,
      tipoAtendimento,
      valorCobrado: Number(procedimentoSelecionado?.valor || 0),
      medicoId: parseInt(medicoId),
      pacienteId: parseInt(pacienteId),
      procedimentoId: parseInt(procedimentoId),
    };

    if (estaEditando) {
      agendamento.id = agendamentoEditando.id;
    }

    onSalvar(agendamento);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="flex max-h-[96vh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-sky-600 px-4 py-2.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <CalendarDays className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold">
                {estaEditando ? 'Editar agendamento' : 'Cadastro de agendamento'}
              </h2>
              <p className="text-[10px] text-sky-100">
                {estaEditando
                  ? 'Atualize os dados do agendamento.'
                  : 'Preencha os dados para cadastrar um novo agendamento.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-3">
            {erroFormulario && (
              <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {erroFormulario}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_220px]">
              <section className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sky-600" />
                  <h3 className="text-xs font-bold text-gray-900">
                    Dados do agendamento
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Campo
                    label="Data e horário"
                    type="datetime-local"
                    value={dataAgendamento}
                    onChange={(e) => setDataAgendamento(e.target.value)}
                    required
                  />

                  <Campo
                    label="Status"
                    value="Agendado"
                    disabled
                    classNameExtra="bg-gray-100 text-gray-500"
                  />

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                      Tipo de atendimento
                    </label>

                    <div className="grid grid-cols-2 gap-1.5">
                      <TipoAtendimentoBotao
                        ativo={tipoAtendimento === 'Presencial'}
                        icon={MapPin}
                        label="Presencial"
                        onClick={() => setTipoAtendimento('Presencial')}
                      />

                      <TipoAtendimentoBotao
                        ativo={tipoAtendimento === 'Online'}
                        icon={Video}
                        label="Online"
                        onClick={() => setTipoAtendimento('Online')}
                      />
                    </div>
                  </div>

                  <Campo
                    label="Motivo"
                    value={motivoAgendamento}
                    onChange={(e) => setMotivoAgendamento(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </section>

              <section className="rounded-xl border border-green-200 bg-green-50 p-2.5 shadow-sm">
                <div className="mb-1.5 flex items-center gap-2 text-green-700">
                  <BadgeDollarSign className="h-4 w-4" />
                  <h3 className="text-xs font-bold">Valor do procedimento</h3>
                </div>

                <p className="text-lg font-black text-green-800">
                  {procedimentoSelecionado
                    ? formatarMoeda(procedimentoSelecionado.valor)
                    : '—'}
                </p>

                <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold text-green-700">
                  {procedimentoSelecionado
                    ? procedimentoSelecionado.nome
                    : 'Selecione um procedimento para calcular o valor.'}
                </p>
              </section>
            </div>

            <section className="mt-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-sky-600" />
                <h3 className="text-xs font-bold text-gray-900">
                  Vínculos do agendamento
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <BuscaVinculo
                  label="Médico"
                  placeholder="Buscar por nome, CRM ou especialidade..."
                  valorBusca={buscaMedico}
                  setValorBusca={(valor) => {
                    setBuscaMedico(valor);
                    setMedicoId('');
                  }}
                  selecionado={medicoSelecionado}
                  onLimpar={() => {
                    setMedicoId('');
                    setBuscaMedico('');
                  }}
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
                  onLimpar={() => {
                    setPacienteId('');
                    setBuscaPaciente('');
                  }}
                  resultados={pacientesFiltrados}
                  onSelecionar={selecionarPaciente}
                  tipo="paciente"
                  icon={Users}
                  acaoExtra={
                    onCadastrarNovoPaciente && (
                      <button
                        type="button"
                        onClick={onCadastrarNovoPaciente}
                        className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700 transition hover:bg-sky-100"
                      >
                        <UserPlus className="h-3 w-3" />
                        Novo
                      </button>
                    )
                  }
                />

                <div className="md:col-span-2">
                  <BuscaVinculo
                    label="Procedimento"
                    placeholder="Buscar por nome ou código..."
                    valorBusca={buscaProcedimento}
                    setValorBusca={(valor) => {
                      setBuscaProcedimento(valor);
                      setProcedimentoId('');
                    }}
                    selecionado={procedimentoSelecionado}
                    onLimpar={() => {
                      setProcedimentoId('');
                      setBuscaProcedimento('');
                    }}
                    resultados={procedimentosFiltrados}
                    onSelecionar={selecionarProcedimento}
                    tipo="procedimento"
                    icon={ClipboardList}
                  />
                </div>
              </div>
            </section>

            <section className="mt-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
              <div className="mb-1.5 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-sky-600" />
                <h3 className="text-xs font-bold text-gray-900">Observações</h3>
              </div>

              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                placeholder="Digite observações importantes sobre o agendamento..."
                className="h-[62px] w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </section>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 py-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-xs font-bold text-white transition hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              {estaEditando ? 'Salvar alterações' : 'Cadastrar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  acaoExtra,
}) {
  return (
    <div className="relative">
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {label} <span className="text-red-500">*</span>
        </label>
        {acaoExtra}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          value={valorBusca}
          onChange={(e) => setValorBusca(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-14 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />

        {selecionado && (
          <button
            type="button"
            onClick={onLimpar}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-600 hover:text-red-700"
          >
            Limpar
          </button>
        )}
      </div>

      {selecionado && (
        <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-[10px] font-semibold text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            Selecionado: {selecionado.nome}
            {tipo === 'medico' && selecionado.crm
              ? ` | CRM ${selecionado.crm}`
              : ''}
            {tipo === 'paciente' && selecionado.cpf
              ? ` | CPF ${selecionado.cpf}`
              : ''}
            {tipo === 'procedimento' && selecionado.codigo
              ? ` | Código ${selecionado.codigo}`
              : ''}
          </span>
        </div>
      )}

      {!selecionado && valorBusca.trim() && (
        <div className="absolute z-50 mt-1 max-h-36 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
          {resultados.length > 0 ? (
            resultados.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelecionar(item)}
                className="flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2 text-left text-xs transition hover:bg-sky-50 last:border-b-0"
              >
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />

                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-800">{item.nome}</p>

                  <p className="truncate text-[11px] text-gray-500">
                    {renderDetalheBusca(tipo, item)}
                  </p>
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

function renderDetalheBusca(tipo, item) {
  if (tipo === 'medico') {
    return `CRM: ${item.crm || 'Não informado'} | ${
      item.especialidade || 'Sem especialidade'
    }`;
  }

  if (tipo === 'paciente') {
    return `CPF: ${item.cpf || 'Não informado'} | ${
      item.telefone || item.email || 'Sem contato'
    }`;
  }

  return `Código: ${item.codigo || 'Não informado'} | ${formatarMoeda(item.valor)}`;
}

function TipoAtendimentoBotao({ ativo, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition ${
        ativo
          ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-100'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Campo({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  disabled = false,
  classNameExtra = '',
  ...props
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-8 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed ${classNameExtra}`}
        {...props}
      />
    </div>
  );
}

function formatarParaDatetimeLocal(data) {
  const d = new Date(data);

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

function formatarMoeda(valor) {
  if (valor === undefined || valor === null || valor === '') return '—';

  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default AgendamentoFormModal;
