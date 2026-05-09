import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardPlus,
  FileText,
  Loader2,
  PlayCircle,
  RefreshCw,
  Search,
  Stethoscope,
  X,
} from 'lucide-react';

import {
  finalizarAtendimento,
  getAtendimentosMedicoLogado,
  iniciarAtendimento,
} from '../../services/agendamentoService';

import {
  atualizarProntuario,
  criarProntuario,
  getProntuarioPorAgendamento,
} from '../../services/prontuarioService';

import { useToast } from '../../hooks/useToast';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'AtendidoRecepcao', label: 'Liberados pela recepção' },
  { value: 'EmAndamento', label: 'Em atendimento' },
  { value: 'Finalizado', label: 'Finalizados' },
  { value: 'Agendado', label: 'Agendados' },
  { value: 'Cancelado', label: 'Cancelados' },
];

const prontuarioInicial = {
  id: null,
  agendamentoId: '',
  queixaPrincipal: '',
  historicoClinico: '',
  diagnostico: '',
  conduta: '',
  prescricao: '',
  receita: '',
  examesSolicitados: '',
  observacoes: '',
};

function MedicoAtendimentosPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('AtendidoRecepcao');
  const [data, setData] = useState(formatarDataInput(new Date()));

  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [prontuario, setProntuario] = useState(prontuarioInicial);
  const [salvandoProntuario, setSalvandoProntuario] = useState(false);

  const toast = useToast();

  useEffect(() => {
    carregarAtendimentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, data]);

  async function carregarAtendimentos() {
    try {
      setCarregando(true);

      const dados = await getAtendimentosMedicoLogado({ status, data });

      setAgendamentos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.mensagem ||
          'Erro ao carregar atendimentos do médico.'
      );
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  async function handleIniciar(agendamento) {
    try {
      setProcessandoId(agendamento.id);

      await iniciarAtendimento(agendamento.id);

      toast.success('Atendimento iniciado.');
      setStatus('EmAndamento');
      await carregarAtendimentos();
    } catch (error) {
      toast.error(
        error?.response?.data?.mensagem || 'Erro ao iniciar atendimento.'
      );
      console.error(error);
    } finally {
      setProcessandoId(null);
    }
  }

  async function abrirProntuario(agendamento) {
    if (!agendamento?.id) {
      toast.error('Agendamento inválido para abrir prontuário.');
      return;
    }

    setAgendamentoSelecionado(agendamento);

    try {
      const existente = await getProntuarioPorAgendamento(agendamento.id);

      setProntuario(normalizarProntuario(existente, agendamento.id));
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error(
          error?.response?.data?.mensagem ||
            'Erro ao buscar prontuário do atendimento.'
        );
        console.error(error);
      }

      setProntuario({
        ...prontuarioInicial,
        agendamentoId: agendamento.id,
      });
    }

    setModalAberto(true);
  }

  function fecharModal() {
    if (salvandoProntuario) return;

    setModalAberto(false);
    setAgendamentoSelecionado(null);
    setProntuario(prontuarioInicial);
  }

  function alterarCampoProntuario(campo, valor) {
    setProntuario((dados) => ({
      ...dados,
      [campo]: valor,
    }));
  }

  function montarPayloadProntuario() {
    const agendamentoId =
      Number(prontuario.agendamentoId) ||
      Number(agendamentoSelecionado?.id) ||
      0;

    return {
      id: prontuario.id || 0,
      agendamentoId,
      queixaPrincipal: prontuario.queixaPrincipal?.trim() || '',
      historicoClinico: prontuario.historicoClinico?.trim() || '',
      diagnostico: prontuario.diagnostico?.trim() || '',
      conduta: prontuario.conduta?.trim() || '',
      prescricao:
        prontuario.prescricao?.trim() || prontuario.receita?.trim() || '',
      receita:
        prontuario.receita?.trim() || prontuario.prescricao?.trim() || '',
      examesSolicitados: prontuario.examesSolicitados?.trim() || '',
      observacoes: prontuario.observacoes?.trim() || '',
    };
  }

  async function salvarProntuario() {
    const payload = montarPayloadProntuario();

    if (!payload.agendamentoId || payload.agendamentoId <= 0) {
      toast.error('Agendamento não encontrado para salvar o prontuário.');
      return null;
    }

    if (!payload.diagnostico) {
      toast.error('Informe pelo menos o diagnóstico para salvar o prontuário.');
      return null;
    }

    try {
      setSalvandoProntuario(true);

      let salvo;

      if (payload.id && payload.id > 0) {
        salvo = await atualizarProntuario(payload);
      } else {
        const { id, ...payloadCriacao } = payload;
        salvo = await criarProntuario(payloadCriacao);
      }

      const prontuarioAtualizado = normalizarProntuario(
        salvo || payload,
        payload.agendamentoId
      );

      setProntuario(prontuarioAtualizado);

      toast.success('Prontuário salvo com sucesso.');

      return prontuarioAtualizado;
    } catch (error) {
      toast.error(
        error?.response?.data?.mensagem || 'Erro ao salvar prontuário.'
      );
      console.error(error);
      return null;
    } finally {
      setSalvandoProntuario(false);
    }
  }

  async function salvarProntuarioEFinalizar() {
    if (!agendamentoSelecionado?.id) {
      toast.error('Agendamento não encontrado para finalizar.');
      return;
    }

    const salvo = await salvarProntuario();

    if (!salvo) return;

    try {
      setProcessandoId(agendamentoSelecionado.id);

      await finalizarAtendimento(agendamentoSelecionado.id);

      toast.success('Atendimento finalizado com sucesso.');

      fecharModal();
      await carregarAtendimentos();
    } catch (error) {
      toast.error(
        error?.response?.data?.mensagem || 'Erro ao finalizar atendimento.'
      );
      console.error(error);
    } finally {
      setProcessandoId(null);
    }
  }

  const agendamentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return agendamentos;

    return agendamentos.filter((agendamento) => {
      const texto = `
        ${agendamento.paciente?.nome || ''}
        ${agendamento.medico?.nome || ''}
        ${agendamento.procedimento?.nome || ''}
        ${agendamento.motivoAgendamento || ''}
        ${agendamento.status || ''}
      `.toLowerCase();

      return texto.includes(termo);
    });
  }, [agendamentos, busca]);

  const resumo = useMemo(() => {
    return {
      liberados: agendamentos.filter(
        (item) => item.status === 'AtendidoRecepcao'
      ).length,
      emAtendimento: agendamentos.filter(
        (item) => item.status === 'EmAndamento'
      ).length,
      finalizados: agendamentos.filter((item) => item.status === 'Finalizado')
        .length,
    };
  }, [agendamentos]);

  return (
    <div className="min-h-[calc(100vh-44px)] bg-gray-100 p-4">
      <div className="mb-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-700 to-sky-500 p-5 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Stethoscope className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-xl font-bold">Meus Atendimentos</h1>
                <p className="mt-1 max-w-2xl text-sm text-sky-50">
                  Área do médico para acompanhar pacientes liberados pela
                  recepção, iniciar atendimento, registrar prontuário e
                  finalizar.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={carregarAtendimentos}
              className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-sky-700 transition hover:bg-sky-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`}
              />
              Atualizar
            </button>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <ResumoCard
            label="Liberados"
            valor={resumo.liberados}
            icon={CheckCircle2}
          />
          <ResumoCard
            label="Em atendimento"
            valor={resumo.emAtendimento}
            icon={Activity}
          />
          <ResumoCard
            label="Finalizados"
            valor={resumo.finalizados}
            icon={FileText}
          />
        </section>
      </div>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 px-3">
            <Search className="h-4 w-4 text-gray-400" />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar paciente, médico, procedimento ou motivo..."
              className="h-full w-full border-none bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-sky-500"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-sky-500"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {carregando ? (
          <div className="flex h-56 items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando atendimentos...
          </div>
        ) : agendamentosFiltrados.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center text-sm text-gray-500">
            <CalendarDays className="mb-2 h-8 w-8 text-gray-300" />
            Nenhum atendimento encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {agendamentosFiltrados.map((agendamento) => (
              <AtendimentoCard
                key={agendamento.id}
                agendamento={agendamento}
                processando={processandoId === agendamento.id}
                onIniciar={() => handleIniciar(agendamento)}
                onProntuario={() => abrirProntuario(agendamento)}
              />
            ))}
          </div>
        )}
      </section>

      <ProntuarioAtendimentoModal
        aberto={modalAberto}
        agendamento={agendamentoSelecionado}
        prontuario={prontuario}
        salvando={salvandoProntuario || !!processandoId}
        onClose={fecharModal}
        onChange={alterarCampoProntuario}
        onSalvar={salvarProntuario}
        onFinalizar={salvarProntuarioEFinalizar}
      />
    </div>
  );
}

function ResumoCard({ label, valor, icon: Icon }) {
  return (
    <div className="rounded-xl bg-sky-50 p-3">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-lg font-bold text-gray-900">{valor}</p>
      <p className="text-[11px] font-semibold text-gray-500">{label}</p>
    </div>
  );
}

function AtendimentoCard({ agendamento, processando, onIniciar, onProntuario }) {
  const status = agendamento.status || 'Agendado';

  const podeIniciar = status === 'AtendidoRecepcao';
  const podeProntuario = status === 'EmAndamento' || status === 'Finalizado';

  return (
    <article className="grid gap-4 p-4 transition hover:bg-slate-50 xl:grid-cols-[1fr_auto] xl:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
            {formatarStatus(status)}
          </span>

          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <Clock3 className="h-3.5 w-3.5" />
            {formatarDataHora(agendamento.dataAgendamento)}
          </span>
        </div>

        <h2 className="truncate text-base font-bold text-gray-900">
          {agendamento.paciente?.nome || 'Paciente não informado'}
        </h2>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          <span>
            <strong>Médico:</strong>{' '}
            {agendamento.medico?.nome || 'Não informado'}
          </span>

          <span>
            <strong>Procedimento:</strong>{' '}
            {agendamento.procedimento?.nome || 'Não informado'}
          </span>

          <span>
            <strong>Tipo:</strong>{' '}
            {agendamento.tipoAtendimento || 'Presencial'}
          </span>

          <span>
            <strong>Valor:</strong> {formatarMoeda(agendamento.valorCobrado)}
          </span>
        </div>

        {agendamento.motivoAgendamento && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {agendamento.motivoAgendamento}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onIniciar}
          disabled={!podeIniciar || processando}
          className="flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-xs font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {processando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          Iniciar
        </button>

        <button
          type="button"
          onClick={onProntuario}
          disabled={!podeProntuario || processando}
          className="flex h-10 items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 text-xs font-bold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
        >
          <ClipboardPlus className="h-4 w-4" />
          Prontuário
        </button>
      </div>
    </article>
  );
}

function ProntuarioAtendimentoModal({
  aberto,
  agendamento,
  prontuario,
  salvando,
  onClose,
  onChange,
  onSalvar,
  onFinalizar,
}) {
  if (!aberto || !agendamento) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-200 bg-sky-600 px-5 py-4 text-white">
          <div>
            <h2 className="text-lg font-bold">Prontuário do atendimento</h2>

            <p className="text-xs text-sky-100">
              {agendamento.paciente?.nome || 'Paciente'} •{' '}
              {formatarDataHora(agendamento.dataAgendamento)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
          <div className="mb-4 rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
            <div className="grid gap-3 text-xs text-gray-600 md:grid-cols-3">
              <InfoAtendimento
                label="Agendamento"
                valor={`#${agendamento.id}`}
              />

              <InfoAtendimento
                label="Paciente"
                valor={agendamento.paciente?.nome || 'Não informado'}
              />

              <InfoAtendimento
                label="Procedimento"
                valor={agendamento.procedimento?.nome || 'Não informado'}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CampoTexto
              label="Queixa principal"
              value={prontuario.queixaPrincipal}
              onChange={(v) => onChange('queixaPrincipal', v)}
            />

            <CampoTexto
              label="Histórico clínico"
              value={prontuario.historicoClinico}
              onChange={(v) => onChange('historicoClinico', v)}
            />

            <CampoTexto
              obrigatorio
              label="Diagnóstico"
              value={prontuario.diagnostico}
              onChange={(v) => onChange('diagnostico', v)}
            />

            <CampoTexto
              label="Conduta"
              value={prontuario.conduta}
              onChange={(v) => onChange('conduta', v)}
            />

            <CampoTexto
              label="Prescrição / Receita"
              value={prontuario.prescricao || prontuario.receita}
              onChange={(v) => {
                onChange('prescricao', v);
                onChange('receita', v);
              }}
            />

            <CampoTexto
              label="Exames solicitados"
              value={prontuario.examesSolicitados}
              onChange={(v) => onChange('examesSolicitados', v)}
            />

            <div className="lg:col-span-2">
              <CampoTexto
                label="Observações"
                value={prontuario.observacoes}
                onChange={(v) => onChange('observacoes', v)}
                linhas={4}
              />
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-gray-200 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="h-10 rounded-xl border border-gray-300 px-4 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSalvar}
            disabled={salvando}
            className="flex h-10 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-xs font-bold text-sky-700 transition hover:bg-sky-100 disabled:opacity-60"
          >
            <FileText className="h-4 w-4" />
            Salvar prontuário
          </button>

          <button
            type="button"
            onClick={onFinalizar}
            disabled={salvando}
            className="flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-xs font-bold text-white transition hover:bg-sky-700 disabled:opacity-60"
          >
            {salvando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Salvar e finalizar
          </button>
        </footer>
      </div>
    </div>
  );
}

function InfoAtendimento({ label, valor }) {
  return (
    <div>
      <p className="font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 truncate font-semibold text-gray-800">{valor}</p>
    </div>
  );
}

function CampoTexto({ label, value, onChange, linhas = 3, obrigatorio = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </span>

      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={linhas}
        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </label>
  );
}

function normalizarProntuario(dados, agendamentoId) {
  return {
    ...prontuarioInicial,
    ...(dados || {}),
    id: dados?.id || null,
    agendamentoId: dados?.agendamentoId || agendamentoId || '',
    queixaPrincipal: dados?.queixaPrincipal || '',
    historicoClinico: dados?.historicoClinico || '',
    diagnostico: dados?.diagnostico || '',
    conduta: dados?.conduta || '',
    prescricao: dados?.prescricao || dados?.receita || '',
    receita: dados?.receita || dados?.prescricao || '',
    examesSolicitados: dados?.examesSolicitados || '',
    observacoes: dados?.observacoes || '',
  };
}

function formatarStatus(status) {
  const mapa = {
    Agendado: 'Agendado',
    AtendidoRecepcao: 'Liberado pela recepção',
    EmAndamento: 'Em atendimento',
    Finalizado: 'Finalizado',
    Cancelado: 'Cancelado',
  };

  return mapa[status] || status || '-';
}

function formatarDataHora(data) {
  if (!data) return '-';

  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarDataInput(data) {
  const d = new Date(data);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

export default MedicoAtendimentosPage;