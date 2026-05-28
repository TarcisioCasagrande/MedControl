import { useState, useEffect } from 'react';
import {
  X,
  FileText,
  ClipboardList,
  Stethoscope,
  Activity,
  Pill,
  FlaskConical,
  MessageSquareText,
  Save,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

function ProntuarioFormModal({
  isOpen,
  onClose,
  prontuarioEditando,
  onSalvar,
  agendamentos,
  agendamentoSelecionada,
}) {
  const [agendamentoId, setAgendamentoId] = useState('');
  const [queixaPrincipal, setQueixaPrincipal] = useState('');
  const [historicoClinico, setHistoricoClinico] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [conduta, setConduta] = useState('');
  const [prescricao, setPrescricao] = useState('');
  const [receita, setReceita] = useState('');
  const [examesSolicitados, setExamesSolicitados] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [aviso, setAviso] = useState({
    aberto: false,
    titulo: '',
    mensagem: '',
    tipo: 'erro',
  });

  useEffect(() => {
    if (!isOpen) return;

    if (prontuarioEditando) {
      setAgendamentoId(prontuarioEditando.agendamentoId?.toString() || '');
      setQueixaPrincipal(prontuarioEditando.queixaPrincipal || '');
      setHistoricoClinico(prontuarioEditando.historicoClinico || '');
      setDiagnostico(prontuarioEditando.diagnostico || '');
      setConduta(prontuarioEditando.conduta || '');
      setPrescricao(prontuarioEditando.prescricao || prontuarioEditando.receita || '');
      setReceita(prontuarioEditando.receita || prontuarioEditando.prescricao || '');
      setExamesSolicitados(prontuarioEditando.examesSolicitados || '');
      setObservacoes(prontuarioEditando.observacoes || '');
    } else {
      limparCampos();
      setAgendamentoId(agendamentoSelecionada?.id?.toString() || '');
    }
  }, [isOpen, prontuarioEditando, agendamentoSelecionada]);

  function limparCampos() {
    setAgendamentoId('');
    setQueixaPrincipal('');
    setHistoricoClinico('');
    setDiagnostico('');
    setConduta('');
    setPrescricao('');
    setReceita('');
    setExamesSolicitados('');
    setObservacoes('');
    setAviso({
      aberto: false,
      titulo: '',
      mensagem: '',
      tipo: 'erro',
    });
  }

  function abrirAviso(titulo, mensagem, tipo = 'erro') {
    setAviso({
      aberto: true,
      titulo,
      mensagem,
      tipo,
    });
  }

  function fecharAviso() {
    setAviso({
      aberto: false,
      titulo: '',
      mensagem: '',
      tipo: 'erro',
    });
  }

  function validarFormulario() {
    if (!agendamentoId || Number(agendamentoId) <= 0) {
      abrirAviso('Campo obrigatório', 'Selecione o agendamento vinculado ao prontuário.');
      return false;
    }

    if (!diagnostico.trim()) {
      abrirAviso('Campo obrigatório', 'Informe o diagnóstico do paciente.');
      return false;
    }

    return true;
  }

  function handlePrescricaoChange(e) {
    const valor = e.target.value;
    setPrescricao(valor);
    setReceita(valor);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validarFormulario()) return;

    const prontuario = {
      agendamentoId: parseInt(agendamentoId, 10),
      queixaPrincipal: queixaPrincipal.trim(),
      historicoClinico: historicoClinico.trim(),
      diagnostico: diagnostico.trim(),
      conduta: conduta.trim(),
      prescricao: prescricao.trim(),
      receita: receita.trim() || prescricao.trim(),
      examesSolicitados: examesSolicitados.trim(),
      observacoes: observacoes.trim(),
    };

    if (prontuarioEditando) {
      prontuario.id = prontuarioEditando.id;
    }

    onSalvar(prontuario);
  }

  if (!isOpen) return null;

  const agendamentoTravado = !!agendamentoSelecionada;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-sky-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                {prontuarioEditando ? 'Editar prontuário' : 'Cadastro de prontuário'}
              </h2>
              <p className="text-xs text-sky-100">
                {prontuarioEditando
                  ? 'Atualize os dados clínicos registrados no atendimento.'
                  : 'Preencha os dados para cadastrar um novo prontuário.'}
              </p>
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

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Vínculo do atendimento
                  </h3>
                </div>

                <SelectAgendamento
                  label="Agendamento"
                  value={agendamentoId}
                  onChange={setAgendamentoId}
                  required
                  disabled={agendamentoTravado}
                  agendamentos={agendamentos}
                />

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Textarea
                    label="Queixa principal"
                    value={queixaPrincipal}
                    onChange={(e) => setQueixaPrincipal(e.target.value)}
                    icon={Stethoscope}
                    placeholder="Ex.: dor, desconforto, sintomas relatados pelo paciente"
                    maxLength={500}
                  />

                  <Textarea
                    label="Histórico clínico"
                    value={historicoClinico}
                    onChange={(e) => setHistoricoClinico(e.target.value)}
                    icon={Activity}
                    placeholder="Histórico, evolução dos sintomas e informações relevantes"
                    maxLength={1000}
                  />
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Resumo clínico
                  </h3>
                </div>

                <div className="space-y-3">
                  <InfoMini
                    icon={ClipboardList}
                    titulo="Agendamento"
                    valor={agendamentoId ? `#${agendamentoId}` : 'Não selecionado'}
                    cor="blue"
                  />

                  <InfoMini
                    icon={Stethoscope}
                    titulo="Diagnóstico"
                    valor={diagnostico ? 'Preenchido' : 'Obrigatório'}
                    cor={diagnostico ? 'green' : 'orange'}
                  />

                  <InfoMini
                    icon={Pill}
                    titulo="Prescrição"
                    valor={prescricao ? 'Preenchida' : 'Pendente'}
                    cor="violet"
                  />
                </div>
              </section>
            </div>

            <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-sky-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Informações clínicas
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Textarea
                  label="Diagnóstico"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  required
                  icon={Stethoscope}
                  placeholder="Descreva o diagnóstico do paciente"
                  maxLength={1000}
                />

                <Textarea
                  label="Conduta"
                  value={conduta}
                  onChange={(e) => setConduta(e.target.value)}
                  icon={ClipboardList}
                  placeholder="Informe a conduta adotada no atendimento"
                  maxLength={1000}
                />

                <Textarea
                  label="Prescrição / Receita"
                  value={prescricao}
                  onChange={handlePrescricaoChange}
                  icon={Pill}
                  placeholder="Medicamentos, orientações ou prescrição"
                  maxLength={1000}
                />

                <Textarea
                  label="Exames solicitados"
                  value={examesSolicitados}
                  onChange={(e) => setExamesSolicitados(e.target.value)}
                  icon={FlaskConical}
                  placeholder="Informe os exames solicitados"
                  maxLength={1000}
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="Observações"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    icon={MessageSquareText}
                    placeholder="Observações complementares sobre o atendimento"
                    maxLength={1500}
                    rows={4}
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-xs font-bold text-white transition hover:bg-sky-700"
            >
              <Save className="h-4 w-4" />
              {prontuarioEditando ? 'Salvar alterações' : 'Cadastrar prontuário'}
            </button>
          </div>
        </form>
      </div>

      <AvisoModal aviso={aviso} onClose={fecharAviso} />
    </div>
  );
}

function SelectAgendamento({
  label,
  value,
  onChange,
  agendamentos,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500'
            : 'border-gray-300 bg-white text-gray-900'
        }`}
      >
        <option value="">Selecione um agendamento</option>

        {(agendamentos || []).map((agendamento) => (
          <option key={agendamento.id} value={agendamento.id}>
            #{agendamento.id} - {agendamento.paciente?.nome || 'Paciente não informado'} |{' '}
            {agendamento.medico?.nome || 'Médico não informado'}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder = '',
  maxLength,
  rows = 3,
  required = false,
  icon: Icon,
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        )}

        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
            Icon ? 'pl-9' : ''
          }`}
        />
      </div>
    </div>
  );
}

function InfoMini({ icon: Icon, titulo, valor, cor }) {
  const cores = {
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 ${cores[cor] || cores.blue}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" />

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide">
            {titulo}
          </p>
          <p className="truncate text-[11px] font-semibold">{valor}</p>
        </div>
      </div>
    </div>
  );
}

function AvisoModal({ aviso, onClose }) {
  if (!aviso.aberto) return null;

  const ehSucesso = aviso.tipo === 'sucesso';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                ehSucesso
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {ehSucesso ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                {aviso.titulo}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {aviso.mensagem}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg bg-sky-600 px-4 text-xs font-bold text-white transition hover:bg-sky-700"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProntuarioFormModal;