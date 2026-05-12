import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  RefreshCw,
  Search,
  Filter,
  Stethoscope,
  Clock3,
  ChevronLeft,
  ChevronRight,
  X,
  UserRound,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Ban,
  ClipboardList,
  Wallet,
  Save,
} from 'lucide-react';

import {
  getAgendamentos,
  getMeusAgendamentos,
  criarAgendamento,
  atenderRecepcao,
  cancelarAgendamento,
} from '../../services/agendamentoService';

import {
  criarPagamento,
  atualizarPagamento,
} from '../../services/pagamentosService';

import { getMedicos } from '../../services/medicoService';
import { getPacientes } from '../../services/pacienteService';
import {
  listarDisponibilidades,
  criarDisponibilidade,
} from '../../services/disponibilidadeMedicoService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import AgendamentoFormModal from '../agendamentos/AgendamentosFormModal';

function AgendaPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [medicoFiltro, setMedicoFiltro] = useState('');

  const [modoVisualizacao, setModoVisualizacao] = useState('semana');
  const [dataReferencia, setDataReferencia] = useState(new Date());
  const [dataFiltroTodosMedicos, setDataFiltroTodosMedicos] = useState(
    formatarDataInput(new Date())
  );

  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false);
  const [agendamentoPreenchido, setAgendamentoPreenchido] = useState(null);

  const [modalDisponibilidadeAberto, setModalDisponibilidadeAberto] = useState(false);
  const [disponibilidadePreenchida, setDisponibilidadePreenchida] = useState(null);
  const [salvandoDisponibilidade, setSalvandoDisponibilidade] = useState(false);

  const [modalAtendimentoAberto, setModalAtendimentoAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [observacaoPagamento, setObservacaoPagamento] = useState('');
  const [processandoAtendimento, setProcessandoAtendimento] = useState(false);

  const toast = useToast();
  const { usuario } = useAuth();

  const usuarioEhMedico = ehPerfilMedico(usuario);

  useEffect(() => {
    carregarDados();
  }, [usuario?.perfil]);

  async function carregarDados() {
    try {
      setLoading(true);

      const [
        dadosAgendamentos,
        dadosMedicos,
        dadosPacientes,
        dadosDisponibilidades,
      ] = await Promise.all([
        usuarioEhMedico ? getMeusAgendamentos() : getAgendamentos(),
        getMedicos(),
        getPacientes(),
        listarDisponibilidades(),
      ]);

      setAgendamentos(dadosAgendamentos || []);
      setMedicos(dadosMedicos || []);
      setPacientes(dadosPacientes || []);
      setDisponibilidades(dadosDisponibilidades || []);
    } catch (error) {
      toast.error('Erro ao carregar agenda.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function abrirCadastroAgendamentoLivre(medico, dataHora) {
    setAgendamentoPreenchido({
      medicoId: medico.id,
      dataAgendamento: formatarDataHoraLocal(dataHora),
      status: 'Agendado',
      motivoAgendamento: '',
      observacoes: '',
      tipoAtendimento: 'Presencial',
      valorCobrado: 0,
    });

    setModalAgendamentoAberto(true);
  }

  function abrirCadastroDisponibilidade(medico, dia) {
    if (!medico?.id || !dia) return;

    const data = formatarDataInput(dia);
    const diaSemana = obterDiaSemana(data);

    setDisponibilidadePreenchida({
      medicoId: medico.id,
      medicoNome: medico.nome,
      dataInicio: data,
      dataFim: data,
      diasSemana: [diaSemana],
      horaInicio: '08:00',
      horaFim: '12:00',
      intervaloMinutos: 30,
      ativo: true,
    });

    setModalDisponibilidadeAberto(true);
  }

  function fecharModalDisponibilidade() {
    if (salvandoDisponibilidade) return;

    setModalDisponibilidadeAberto(false);
    setDisponibilidadePreenchida(null);
  }

  async function salvarDisponibilidadePelaAgenda(disponibilidade) {
    try {
      setSalvandoDisponibilidade(true);

      await criarDisponibilidade({
        medicoId: Number(disponibilidade.medicoId),
        diasSemana: disponibilidade.diasSemana.map(Number),
        horaInicio: disponibilidade.horaInicio,
        horaFim: disponibilidade.horaFim,
        intervaloMinutos: Number(disponibilidade.intervaloMinutos),
        dataInicio: disponibilidade.dataInicio,
        dataFim: disponibilidade.dataFim,
        ativo: disponibilidade.ativo,
      });

      toast.success('Disponibilidade criada com sucesso!');

      setModalDisponibilidadeAberto(false);
      setDisponibilidadePreenchida(null);

      await carregarDados();
    } catch (error) {
      toast.error(
        error?.response?.data?.mensagem ||
          error?.mensagem ||
          'Erro ao criar disponibilidade.'
      );
      console.error(error);
    } finally {
      setSalvandoDisponibilidade(false);
    }
  }

  function abrirModalAtendimento(agendamento) {
    setAgendamentoSelecionado(agendamento);
    setFormaPagamento(agendamento.pagamento?.formaPagamento || 'Pix');
    setObservacaoPagamento(agendamento.pagamento?.observacoes || '');
    setModalAtendimentoAberto(true);
  }

  function fecharModalAtendimento() {
    if (processandoAtendimento) return;

    setModalAtendimentoAberto(false);
    setAgendamentoSelecionado(null);
    setFormaPagamento('Pix');
    setObservacaoPagamento('');
  }

  async function salvarAgendamentoPelaAgenda(agendamento) {
    try {
      await criarAgendamento(agendamento);
      toast.success('Agendamento cadastrado com sucesso!');

      setModalAgendamentoAberto(false);
      setAgendamentoPreenchido(null);

      await carregarDados();
    } catch (error) {
      toast.error(error?.response?.data?.mensagem || error?.mensagem || 'Erro ao salvar agendamento.');
      console.error(error);
    }
  }

  async function handleAtenderRecepcaoComPagamento() {
    if (!agendamentoSelecionado) return;

    try {
      setProcessandoAtendimento(true);

      const valorPagamento = Number(
        agendamentoSelecionado.valorCobrado ||
          agendamentoSelecionado.procedimento?.valor ||
          0
      );

      if (valorPagamento <= 0) {
        toast.error('O valor do procedimento precisa ser maior que zero.');
        return;
      }

      const pagamentoPayload = {
        id: agendamentoSelecionado.pagamento?.id,
        agendamentoId: agendamentoSelecionado.id,
        valor: valorPagamento,
        formaPagamento,
        statusPagamento: 'Pago',
        dataPagamento: new Date().toISOString(),
        observacoes: observacaoPagamento || '',
      };

      if (agendamentoSelecionado.pagamento?.id) {
        await atualizarPagamento(pagamentoPayload);
      } else {
        await criarPagamento(pagamentoPayload);
      }

      await atenderRecepcao(agendamentoSelecionado.id);

      toast.success('Paciente atendido pela recepção e liberado para o médico.');

      fecharModalAtendimento();
      await carregarDados();
    } catch (error) {
      toast.error(
        error?.response?.data?.mensagem ||
          error?.mensagem ||
          'Erro ao atender paciente.'
      );
      console.error(error);
    } finally {
      setProcessandoAtendimento(false);
    }
  }

  async function handleCancelarAgendamento() {
    if (!agendamentoSelecionado) return;

    const confirmar = window.confirm(
      `Deseja cancelar o agendamento de ${
        agendamentoSelecionado.paciente?.nome || 'paciente'
      }?`
    );

    if (!confirmar) return;

    try {
      setProcessandoAtendimento(true);

      await cancelarAgendamento(agendamentoSelecionado.id);

      toast.success('Agendamento cancelado com sucesso.');

      fecharModalAtendimento();
      await carregarDados();
    } catch (error) {
      toast.error(
        error?.response?.data?.mensagem ||
          error?.mensagem ||
          'Erro ao cancelar agendamento.'
      );
      console.error(error);
    } finally {
      setProcessandoAtendimento(false);
    }
  }

  function fecharModalAgendamento() {
    setModalAgendamentoAberto(false);
    setAgendamentoPreenchido(null);
  }

  function alterarMedicoFiltro(valor) {
    if (usuarioEhMedico) return;

    if (valor) {
      setDataReferencia(montarDataDoInput(dataFiltroTodosMedicos));
    } else {
      setDataFiltroTodosMedicos(formatarDataInput(dataReferencia));
    }

    setMedicoFiltro(valor);
  }

  function alterarDiaAgenda(valor) {
    const dia = valor || formatarDataInput(new Date());

    if (medicoFiltro) {
      setDataReferencia(montarDataDoInput(dia));
      setModoVisualizacao('dia');
      return;
    }

    setDataFiltroTodosMedicos(dia);
  }

  function limparFiltros() {
    const hoje = new Date();

    setBusca('');
    setStatusFiltro('');
    setMedicoFiltro(usuarioEhMedico && medicosVisiveis[0] ? String(medicosVisiveis[0].id) : '');
    setDataReferencia(hoje);
    setDataFiltroTodosMedicos(formatarDataInput(hoje));
  }

  function irHoje() {
    setDataReferencia(new Date());
  }

  function voltarPeriodo() {
    setDataReferencia((data) => movimentarData(data, modoVisualizacao, -1));
  }

  function avancarPeriodo() {
    setDataReferencia((data) => movimentarData(data, modoVisualizacao, 1));
  }


  const medicosVisiveis = useMemo(() => {
    if (!usuarioEhMedico) return medicos;

    const emailUsuario = (usuario?.email || '').toLowerCase();
    const usuarioId = String(usuario?.id || '');

    return medicos.filter((medico) => {
      const mesmoUsuarioId = medico.usuarioId && String(medico.usuarioId) === usuarioId;
      const mesmoEmail = emailUsuario && (medico.email || '').toLowerCase() === emailUsuario;

      return mesmoUsuarioId || mesmoEmail;
    });
  }, [medicos, usuarioEhMedico, usuario]);

  useEffect(() => {
    if (!usuarioEhMedico) return;
    if (!medicosVisiveis.length) return;

    const medicoAtual = medicosVisiveis[0];

    if (String(medicoFiltro) !== String(medicoAtual.id)) {
      setMedicoFiltro(String(medicoAtual.id));
      setDataReferencia(montarDataDoInput(dataFiltroTodosMedicos));
    }
  }, [usuarioEhMedico, medicosVisiveis, medicoFiltro, dataFiltroTodosMedicos]);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((agendamento) => {
      const texto = `${agendamento.paciente?.nome || ''} ${
        agendamento.medico?.nome || ''
      } ${agendamento.procedimento?.nome || ''} ${
        agendamento.procedimento?.codigo || ''
      } ${agendamento.status || ''} ${
        agendamento.motivoAgendamento || ''
      }`.toLowerCase();

      const bateBusca = texto.includes(busca.toLowerCase());

      const bateStatus = statusFiltro
        ? normalizarStatus(agendamento.status) === normalizarStatus(statusFiltro)
        : true;

      const bateMedico = medicoFiltro
        ? String(agendamento.medicoId ?? agendamento.medico?.id) ===
          String(medicoFiltro)
        : true;

      return bateBusca && bateStatus && bateMedico;
    });
  }, [agendamentos, busca, statusFiltro, medicoFiltro]);

  const dataSelecionadaTodosMedicos = useMemo(() => {
    return montarDataDoInput(dataFiltroTodosMedicos);
  }, [dataFiltroTodosMedicos]);

  const agendamentosDoDiaTodosMedicos = useMemo(() => {
    return agendamentosFiltrados.filter(
      (agendamento) =>
        formatarDataInput(agendamento.dataAgendamento) === dataFiltroTodosMedicos
    );
  }, [agendamentosFiltrados, dataFiltroTodosMedicos]);

  const agendamentosExibidosMedico = useMemo(() => {
    if (!medicoFiltro) return [];

    const diasPeriodo = new Set(
      obterDiasDoPeriodo(dataReferencia, modoVisualizacao).map(formatarDataInput)
    );

    return agendamentosFiltrados.filter((agendamento) =>
      diasPeriodo.has(formatarDataInput(agendamento.dataAgendamento))
    );
  }, [agendamentosFiltrados, medicoFiltro, dataReferencia, modoVisualizacao]);

  const medicoSelecionado = useMemo(() => {
    return medicosVisiveis.find((medico) => String(medico.id) === String(medicoFiltro));
  }, [medicosVisiveis, medicoFiltro]);

  return (
    <div className="flex h-[calc(100dvh-64px)] w-full flex-col overflow-hidden bg-gray-100 p-2 lg:p-3">
      <section className="mb-2 shrink-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100">
              <CalendarDays className="h-5 w-5 text-sky-700" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black text-gray-900">Agenda</h1>
              <p className="truncate text-xs text-gray-500">
                {usuarioEhMedico
                  ? 'Minha agenda médica'
                  : medicoFiltro
                    ? 'Agenda por dias do médico selecionado'
                    : 'Agenda por dia de todos os médicos'}
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5 xl:max-w-5xl">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={usuarioEhMedico ? 'Buscar paciente, procedimento ou status...' : 'Buscar paciente, médico, procedimento...'}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {!usuarioEhMedico ? (
              <select
                value={medicoFiltro}
                onChange={(e) => alterarMedicoFiltro(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Todos os médicos</option>
                {medicosVisiveis.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nome}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex h-10 items-center rounded-xl border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-800">
                <span className="truncate">
                  {medicosVisiveis[0]?.nome || 'Minha agenda'}
                </span>
              </div>
            )}

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Todos os status</option>
              <option value="Agendado">Agendado</option>
              <option value="AtendidoRecepcao">Atendido recepção</option>
              <option value="EmAndamento">Em atendimento</option>
              <option value="Finalizada">Finalizada</option>
              <option value="Cancelada">Cancelada</option>
            </select>

            <input
              type="date"
              value={medicoFiltro ? formatarDataInput(dataReferencia) : dataFiltroTodosMedicos}
              onChange={(e) => alterarDiaAgenda(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={limparFiltros}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>

            <button
              onClick={carregarDados}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 text-xs font-bold text-white transition hover:bg-sky-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <ResumoTopo
            label={medicoFiltro ? 'Agendamentos exibidos' : 'Agendamentos no dia'}
            valor={medicoFiltro ? agendamentosExibidosMedico.length : agendamentosDoDiaTodosMedicos.length}
          />
          <ResumoTopo label="Total geral" valor={agendamentos.length} />
          <ResumoTopo label="Médicos visíveis" valor={medicosVisiveis.length} />
          <ResumoTopo label="Disponibilidades" valor={disponibilidades.length} />
        </div>
      </section>

      <main className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Carregando agenda...
          </div>
        ) : medicoFiltro && medicoSelecionado ? (
          <AgendaPorDias
            medico={medicoSelecionado}
            agendamentos={agendamentosFiltrados}
            disponibilidades={usuarioEhMedico ? disponibilidades.filter((item) => String(item.medicoId) === String(medicoSelecionado.id)) : disponibilidades}
            modoVisualizacao={modoVisualizacao}
            setModoVisualizacao={setModoVisualizacao}
            dataReferencia={dataReferencia}
            onHoje={irHoje}
            onVoltar={voltarPeriodo}
            onAvancar={avancarPeriodo}
            onAbrirAgendamento={abrirModalAtendimento}
            onAbrirLivre={usuarioEhMedico ? null : abrirCadastroAgendamentoLivre}
            onAbrirDisponibilidade={usuarioEhMedico ? null : abrirCadastroDisponibilidade}
          />
        ) : usuarioEhMedico ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-sky-50 p-6 text-center">
            <div className="max-w-md">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
                <Stethoscope className="h-6 w-6 text-sky-700" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Médico não vinculado</h2>
              <p className="mt-2 text-sm text-gray-600">
                Para visualizar a agenda médica, vincule este usuário ao cadastro do médico.
              </p>
            </div>
          </div>
        ) : (
          <AgendaTodosMedicosPorDia
            medicos={medicosVisiveis}
            agendamentosDoDia={agendamentosDoDiaTodosMedicos}
            dataSelecionada={dataSelecionadaTodosMedicos}
            disponibilidades={disponibilidades}
            onAbrirAgendamento={abrirModalAtendimento}
            onAbrirLivre={abrirCadastroAgendamentoLivre}
            onAbrirDisponibilidade={abrirCadastroDisponibilidade}
          />
        )}
      </main>

      <AgendamentoFormModal
        isOpen={modalAgendamentoAberto}
        onClose={fecharModalAgendamento}
        agendamentoEditando={agendamentoPreenchido}
        onSalvar={salvarAgendamentoPelaAgenda}
        medicos={medicosVisiveis}
        pacientes={pacientes}
      />

      <DisponibilidadeRapidaModal
        isOpen={modalDisponibilidadeAberto}
        disponibilidade={disponibilidadePreenchida}
        setDisponibilidade={setDisponibilidadePreenchida}
        salvando={salvandoDisponibilidade}
        onClose={fecharModalDisponibilidade}
        onSalvar={salvarDisponibilidadePelaAgenda}
      />

      <AtendimentoRecepcaoModal
        isOpen={modalAtendimentoAberto}
        agendamento={agendamentoSelecionado}
        formaPagamento={formaPagamento}
        setFormaPagamento={setFormaPagamento}
        observacaoPagamento={observacaoPagamento}
        setObservacaoPagamento={setObservacaoPagamento}
        processando={processandoAtendimento}
        onClose={fecharModalAtendimento}
        onAtender={handleAtenderRecepcaoComPagamento}
        onCancelar={handleCancelarAgendamento}
      />
    </div>
  );
}


function ResumoTopo({ label, valor }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-lg font-black text-gray-900">{valor}</p>
    </div>
  );
}

function AgendaPorDias({
  medico,
  agendamentos,
  disponibilidades,
  modoVisualizacao,
  setModoVisualizacao,
  dataReferencia,
  onHoje,
  onVoltar,
  onAvancar,
  onAbrirAgendamento,
  onAbrirLivre,
  onAbrirDisponibilidade,
}) {
  const dias = useMemo(() => {
    return obterDiasDoPeriodo(dataReferencia, modoVisualizacao);
  }, [dataReferencia, modoVisualizacao]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-gray-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 2xl:px-3 2xl:py-3">
        <div className="flex items-center gap-1.5 xl:gap-2">
          <button
            onClick={onVoltar}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-900 2xl:h-9 2xl:w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={onAvancar}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-900 2xl:h-9 2xl:w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={onHoje}
            className="h-8 rounded-lg bg-slate-600 px-3 text-xs font-semibold text-white hover:bg-slate-700 2xl:h-9 2xl:px-4"
          >
            Hoje
          </button>
        </div>

        <div className="min-w-[220px] flex-1 text-center">
          <h2 className="truncate text-base font-bold text-gray-900 2xl:text-lg">
            {tituloPeriodo(dataReferencia, modoVisualizacao)}
          </h2>
          <p className="truncate text-[11px] text-gray-500 2xl:text-xs">
            {medico.nome} • {medico.especialidade || 'Especialidade não informada'}
          </p>
        </div>

        <div className="flex overflow-hidden rounded-lg border border-slate-800">
          <BotaoModo
            ativo={modoVisualizacao === 'mes'}
            onClick={() => setModoVisualizacao('mes')}
            label="Mensal"
          />
          <BotaoModo
            ativo={modoVisualizacao === 'semana'}
            onClick={() => setModoVisualizacao('semana')}
            label="Semana"
          />
          <BotaoModo
            ativo={modoVisualizacao === 'dia'}
            onClick={() => setModoVisualizacao('dia')}
            label="Dia"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div
          className="flex min-h-full flex-col"
          style={{
            width: obterLarguraGradeAgenda(dias.length, modoVisualizacao),
            minWidth: obterLarguraGradeAgenda(dias.length, modoVisualizacao),
          }}
        >
          <div
            className="sticky top-0 z-20 grid w-full shrink-0 bg-white"
            style={{
              gridTemplateColumns: obterTemplateColunasAgenda(dias.length, modoVisualizacao),
            }}
          >
            {dias.map((dia) => (
              <div
                key={formatarDataInput(dia)}
                className={`border-b border-r border-gray-200 bg-white px-1.5 py-2 2xl:px-2 ${
                  ehHoje(dia) ? 'bg-sky-50' : ''
                }`}
              >
                <div
                  className={`flex min-w-0 ${
                    modoVisualizacao === 'mes'
                      ? 'flex-col items-center justify-center gap-1 text-center'
                      : 'items-center justify-center gap-2 text-center'
                  }`}
                >
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-lg bg-sky-100 ${
                      modoVisualizacao === 'mes' ? 'h-7 w-7' : 'h-8 w-8'
                    }`}
                  >
                    <CalendarDays
                      className={`text-sky-600 ${
                        modoVisualizacao === 'mes' ? 'h-3.5 w-3.5' : 'h-4 w-4'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`truncate font-bold text-gray-900 ${
                        modoVisualizacao === 'mes' ? 'text-xs' : 'text-sm'
                      }`}
                    >
                      {modoVisualizacao === 'mes'
                        ? formatarDiaCabecalhoCompacto(dia)
                        : formatarDiaCabecalho(dia)}
                    </h3>

                    <p
                      className={`truncate text-gray-500 ${
                        modoVisualizacao === 'mes' ? 'text-[11px]' : 'text-xs'
                      }`}
                    >
                      {ehHoje(dia) ? 'Hoje' : formatarDataCurta(dia)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="grid min-h-0 flex-1 w-full"
            style={{
              gridTemplateColumns: obterTemplateColunasAgenda(dias.length, modoVisualizacao),
            }}
          >
            {dias.map((dia) => {
              const slots = gerarSlotsDoMedicoPorDia(
                medico,
                dia,
                agendamentos,
                disponibilidades
              );

              return (
                <div
                  key={formatarDataInput(dia)}
                  className={`min-h-full border-r border-gray-200 p-2 2xl:p-3 ${
                    ehHoje(dia) ? 'bg-sky-50/40' : 'bg-gray-50'
                  }`}
                >
                  <ListaSlots
                    medico={medico}
                    dia={dia}
                    slots={slots}
                    textoVazio="Nenhuma disponibilidade"
                    onAbrirAgendamento={onAbrirAgendamento}
                    onAbrirLivre={onAbrirLivre}
                    onAbrirDisponibilidade={onAbrirDisponibilidade}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaTodosMedicosPorDia({
  medicos,
  agendamentosDoDia,
  dataSelecionada,
  disponibilidades,
  onAbrirAgendamento,
  onAbrirLivre,
  onAbrirDisponibilidade,
}) {
  const medicosComAgenda = medicos.filter((medico) => {
    const temAgendamento = agendamentosDoDia.some(
      (agendamento) =>
        String(agendamento.medicoId ?? agendamento.medico?.id) === String(medico.id)
    );

    const temDisponibilidade = disponibilidades.some((item) =>
      disponibilidadeValeParaData(item, medico.id, dataSelecionada)
    );

    return temAgendamento || temDisponibilidade;
  });

  const listaMedicos = medicosComAgenda.length > 0 ? medicosComAgenda : medicos;
  const totalColunas = Math.max(listaMedicos.length, 1);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-gray-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 xl:px-3 xl:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 2xl:h-9 2xl:w-9">
            <CalendarDays className="h-4 w-4 text-sky-600" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-gray-900 2xl:text-lg">Todos os médicos</h2>
            <p className="truncate text-[11px] text-gray-500 2xl:text-xs">
              {formatarDataLonga(dataSelecionada)}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-sky-50 px-2 py-1.5 text-right xl:px-3 xl:py-2">
          <p className="text-[11px] font-semibold uppercase text-sky-600">
            Agendamentos no dia
          </p>
          <p className="text-sm font-bold text-gray-900">
            {agendamentosDoDia.length}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        {listaMedicos.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Nenhum médico cadastrado.
          </div>
        ) : (
          <>
            <div
              className="sticky top-0 z-10 grid w-full bg-white shadow-sm"
              style={{
                gridTemplateColumns: obterTemplateColunasTodosMedicos(totalColunas),
              }}
            >
              {listaMedicos.map((medico) => (
                <div
                  key={medico.id}
                  className="border-b border-r border-gray-200 px-3 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
                      <Stethoscope className="h-4 w-4 text-sky-600" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-gray-900">
                        {medico.nome}
                      </h3>
                      <p className="truncate text-xs text-gray-500">
                        {medico.especialidade || 'Especialidade não informada'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="grid w-full"
              style={{
                gridTemplateColumns: obterTemplateColunasTodosMedicos(totalColunas),
              }}
            >
              {listaMedicos.map((medico) => {
                const slots = gerarSlotsDoMedicoPorDia(
                  medico,
                  dataSelecionada,
                  agendamentosDoDia,
                  disponibilidades
                );

                return (
                  <div
                    key={medico.id}
                    className="min-h-full border-r border-gray-200 bg-gray-50 p-2 2xl:p-3"
                  >
                    <ListaSlots
                      medico={medico}
                      dia={dataSelecionada}
                      slots={slots}
                      textoVazio="Nenhuma disponibilidade neste dia"
                      onAbrirAgendamento={onAbrirAgendamento}
                      onAbrirLivre={onAbrirLivre}
                      onAbrirDisponibilidade={onAbrirDisponibilidade}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ListaSlots({
  medico,
  dia,
  slots,
  textoVazio,
  onAbrirAgendamento,
  onAbrirLivre,
  onAbrirDisponibilidade,
}) {
  if (slots.length === 0) {
    return (
      <button
        type="button"
        onClick={() => onAbrirDisponibilidade?.(medico, dia)}
        disabled={!onAbrirDisponibilidade}
        className={`flex min-h-24 w-full max-w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-2 py-3 text-center text-[11px] text-gray-400 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 xl:min-h-28 2xl:min-h-32 2xl:text-xs ${!onAbrirDisponibilidade ? 'cursor-default hover:border-gray-300 hover:bg-white hover:text-gray-400' : ''}` }
        title={onAbrirDisponibilidade ? 'Criar disponibilidade para este médico nesta data' : 'Sem disponibilidade para exibir'}
      >
        <CalendarDays className="mb-2 h-5 w-5" />
        <span className="font-semibold leading-tight">{textoVazio}</span>
        <span className="mt-1 text-[10px] leading-tight">
          {onAbrirDisponibilidade ? 'Clique para criar' : 'Somente leitura'}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-1.5 2xl:space-y-2">
      {slots.map((slot) =>
        slot.agendamento ? (
          <button
            key={`${medico.id}-${formatarDataInput(dia)}-${slot.horario}-agendamento-${slot.agendamento.id}`}
            onClick={() => onAbrirAgendamento(slot.agendamento)}
            className={`w-full max-w-full rounded-lg border p-1.5 text-left shadow-sm transition hover:border-sky-300 2xl:p-3 ${classeCardPorStatus(
              slot.agendamento.status
            )}`}
          >
            <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
              <span className="flex items-center gap-1 text-[11px] font-bold text-gray-900 2xl:text-xs">
                <Clock3 className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                {slot.horario}
              </span>

              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white 2xl:px-2 2xl:text-[10px]"
                style={{
                  backgroundColor: corPorStatus(slot.agendamento.status),
                }}
              >
                {formatarStatusCompacto(slot.agendamento.status)}
              </span>
            </div>

            <p className="line-clamp-2 break-words text-[11px] font-bold leading-tight text-gray-900 2xl:text-sm">
              {slot.agendamento.paciente?.nome || 'Paciente'}
            </p>

            <p className="mt-1 line-clamp-2 break-words text-[10px] font-semibold leading-tight text-gray-600 2xl:text-xs">
              {slot.agendamento.procedimento?.nome || 'Sem procedimento informado'}
            </p>

            <p className="mt-1 line-clamp-2 break-words text-[10px] leading-tight text-gray-500 2xl:text-xs">
              {slot.agendamento.motivoAgendamento?.trim()
                ? slot.agendamento.motivoAgendamento
                : 'Motivo não informado'}
            </p>
          </button>
        ) : (
          <button
            key={`${medico.id}-${formatarDataInput(dia)}-${slot.horario}-livre`}
            onClick={() => onAbrirLivre?.(medico, slot.dataHora)}
            disabled={!onAbrirLivre}
            className={`w-full max-w-full rounded-lg border border-dashed border-gray-300 bg-white p-1.5 text-left shadow-sm transition 2xl:p-3 ${onAbrirLivre ? 'hover:border-green-400 hover:bg-green-50' : 'cursor-default opacity-80'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-gray-700">
                <Clock3 className="h-3.5 w-3.5 text-sky-600" />
                {slot.horario}
              </span>

              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                Livre
              </span>
            </div>
          </button>
        )
      )}
    </div>
  );
}


function DisponibilidadeRapidaModal({
  isOpen,
  disponibilidade,
  setDisponibilidade,
  salvando,
  onClose,
  onSalvar,
}) {
  if (!isOpen || !disponibilidade) return null;

  function alterarCampo(campo, valor) {
    setDisponibilidade((dados) => ({
      ...dados,
      [campo]: valor,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!disponibilidade.horaInicio || !disponibilidade.horaFim) {
      return;
    }

    if (disponibilidade.horaInicio >= disponibilidade.horaFim) {
      alert('A hora inicial precisa ser menor que a hora final.');
      return;
    }

    onSalvar(disponibilidade);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-sky-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">Nova disponibilidade</h2>
              <p className="text-xs text-sky-100">
                Crie a disponibilidade sem sair da agenda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto bg-gray-50 p-5">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-gray-900">
                Dados principais
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CampoResumo
                  label="Médico"
                  valor={disponibilidade.medicoNome || '-'}
                />

                <CampoResumo
                  label="Data"
                  valor={`${formatarDataCurta(montarDataDoInput(disponibilidade.dataInicio))} · ${nomeDiaSemana(disponibilidade.diasSemana?.[0])}`}
                />

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Hora início
                  </label>
                  <input
                    type="time"
                    value={disponibilidade.horaInicio}
                    onChange={(e) => alterarCampo('horaInicio', e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Hora fim
                  </label>
                  <input
                    type="time"
                    value={disponibilidade.horaFim}
                    onChange={(e) => alterarCampo('horaFim', e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Intervalo em minutos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={disponibilidade.intervaloMinutos}
                    onChange={(e) =>
                      alterarCampo('intervaloMinutos', e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </div>

                <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={disponibilidade.ativo}
                    onChange={(e) => alterarCampo('ativo', e.target.checked)}
                    className="accent-sky-600"
                  />
                  Disponibilidade ativa
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-800">
              Esta disponibilidade será criada apenas para o dia selecionado na
              agenda. Depois de salvar, os horários livres aparecerão
              automaticamente.
            </section>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="h-10 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="flex h-10 items-center gap-2 rounded-lg bg-sky-600 px-4 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {salvando ? 'Salvando...' : 'Salvar disponibilidade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampoResumo({ label, valor }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-800">
        {valor}
      </div>
    </div>
  );
}

function nomeDiaSemana(valor) {
  const dias = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  return dias[Number(valor)] || '-';
}

function obterDiaSemana(dataInput) {
  if (!dataInput) return 0;

  const [ano, mes, dia] = dataInput.split('-').map(Number);

  if (!ano || !mes || !dia) return 0;

  return new Date(ano, mes - 1, dia).getDay();
}


function AtendimentoRecepcaoModal({
  isOpen,
  agendamento,
  formaPagamento,
  setFormaPagamento,
  observacaoPagamento,
  setObservacaoPagamento,
  processando,
  onClose,
  onAtender,
  onCancelar,
}) {
  if (!isOpen || !agendamento) return null;

  const valor = Number(agendamento.valorCobrado || agendamento.procedimento?.valor || 0);
  const status = normalizarStatus(agendamento.status);
  const jaCancelado = status === 'cancelada';
  const jaFinalizado = status === 'finalizada';
  const jaAtendidoRecepcao = status === 'atendidorecepcao';
  const jaEmAtendimento = status === 'emandamento';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-sky-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">Atendimento da recepção</h2>
              <p className="text-xs text-sky-100">
                Confira os dados, registre o pagamento e libere para o médico.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={processando}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-sky-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Dados do paciente
                </h3>
              </div>

              <InfoLinha label="Nome" valor={agendamento.paciente?.nome} />
              <InfoLinha label="CPF" valor={agendamento.paciente?.cpf || agendamento.paciente?.CPF} />
              <InfoLinha label="Telefone" valor={agendamento.paciente?.telefone} />
              <InfoLinha label="E-mail" valor={agendamento.paciente?.email} />
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-sky-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Dados do agendamento
                </h3>
              </div>

              <InfoLinha label="Código" valor={`#${agendamento.id}`} />
              <InfoLinha label="Data" valor={formatarDataHoraCompleta(agendamento.dataAgendamento)} />
              <InfoLinha label="Médico" valor={agendamento.medico?.nome} />
              <InfoLinha label="Status" valor={formatarStatus(agendamento.status)} />
              <InfoLinha label="Tipo" valor={agendamento.tipoAtendimento} />
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-sky-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Procedimento
                </h3>
              </div>

              <InfoLinha label="Nome" valor={agendamento.procedimento?.nome} />
              <InfoLinha label="Código" valor={agendamento.procedimento?.codigo} />

              <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-green-700">
                  Valor
                </p>
                <p className="text-xl font-black text-green-800">
                  {formatarMoeda(valor)}
                </p>
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-bold text-gray-900">
                Dados para pagamento
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <FormaPagamentoBotao
                ativo={formaPagamento === 'Pix'}
                onClick={() => setFormaPagamento('Pix')}
                icon={Wallet}
                label="Pix"
              />

              <FormaPagamentoBotao
                ativo={formaPagamento === 'Cartão'}
                onClick={() => setFormaPagamento('Cartão')}
                icon={CreditCard}
                label="Cartão"
              />

              <FormaPagamentoBotao
                ativo={formaPagamento === 'Dinheiro'}
                onClick={() => setFormaPagamento('Dinheiro')}
                icon={DollarSign}
                label="Dinheiro"
              />
            </div>

            <textarea
              value={observacaoPagamento}
              onChange={(e) => setObservacaoPagamento(e.target.value)}
              rows={2}
              placeholder="Observações sobre o pagamento, se necessário..."
              className="mt-3 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />

            {agendamento.pagamento && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Este agendamento já possui pagamento cadastrado. Ao atender, o
                pagamento será atualizado como pago.
              </div>
            )}
          </section>

          {agendamento.motivoAgendamento && (
            <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Motivo do agendamento
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {agendamento.motivoAgendamento}
              </p>
            </section>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={processando}
            className="h-10 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-100 disabled:opacity-60"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={onCancelar}
            disabled={processando || jaCancelado || jaFinalizado}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            <Ban className="h-4 w-4" />
            Cancelar agendamento
          </button>

          <button
            type="button"
            onClick={onAtender}
            disabled={
              processando ||
              jaCancelado ||
              jaFinalizado ||
              jaAtendidoRecepcao ||
              jaEmAtendimento
            }
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-xs font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            {processando ? 'Processando...' : 'Atender e liberar para médico'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoLinha({ label, valor }) {
  return (
    <div className="mb-2 last:mb-0">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-gray-900">
        {valor || '-'}
      </p>
    </div>
  );
}

function FormaPagamentoBotao({ ativo, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition ${
        ativo
          ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-100'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function BotaoModo({ ativo, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 text-[11px] font-semibold transition 2xl:h-9 2xl:px-4 2xl:text-xs ${
        ativo
          ? 'bg-slate-900 text-white'
          : 'bg-slate-700 text-white hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );
}

function gerarSlotsDoMedicoPorDia(medico, dia, agendamentos, disponibilidades) {
  const disponibilidadesDoDia = disponibilidades
    .filter(
      (item) =>
        item.horaInicio &&
        item.horaFim &&
        disponibilidadeValeParaData(item, medico.id, dia)
    )
    .sort(
      (a, b) =>
        converterHorarioParaMinutos(a.horaInicio) -
        converterHorarioParaMinutos(b.horaInicio)
    );

  const agendamentosDoDia = agendamentos
    .filter((agendamento) => {
      const agendamentoMedicoId = agendamento.medicoId ?? agendamento.medico?.id;

      return (
        String(agendamentoMedicoId) === String(medico.id) &&
        formatarDataInput(agendamento.dataAgendamento) === formatarDataInput(dia)
      );
    })
    .sort((a, b) => new Date(a.dataAgendamento) - new Date(b.dataAgendamento));

  const slots = [];

  disponibilidadesDoDia.forEach((disp) => {
    let minutoAtual = converterHorarioParaMinutos(disp.horaInicio);
    const minutoFim = converterHorarioParaMinutos(disp.horaFim);
    const intervalo = Math.max(Number(disp.intervaloMinutos || 30), 1);

    while (minutoAtual < minutoFim) {
      const horario = converterMinutosParaHorario(minutoAtual);
      const dataHora = montarDataComHorario(dia, horario);

      const agendamento = agendamentosDoDia.find(
        (item) => formatarHora(item.dataAgendamento) === horario
      );

      if (!slots.some((slot) => slot.horario === horario)) {
        slots.push({
          horario,
          dataHora,
          agendamento: agendamento || null,
        });
      }

      minutoAtual += intervalo;
    }
  });

  agendamentosDoDia.forEach((agendamento) => {
    const horario = formatarHora(agendamento.dataAgendamento);

    if (!slots.some((slot) => slot.horario === horario)) {
      slots.push({
        horario,
        dataHora: new Date(agendamento.dataAgendamento),
        agendamento,
      });
    }
  });

  return slots.sort(
    (a, b) =>
      converterHorarioParaMinutos(a.horario) -
      converterHorarioParaMinutos(b.horario)
  );
}

function obterDiasDoPeriodo(dataReferencia, modo) {
  const data = new Date(dataReferencia);

  if (modo === 'dia') {
    return [normalizarDataComparacao(data)];
  }

  if (modo === 'semana') {
    const inicio = normalizarDataComparacao(data);
    const diaSemana = inicio.getDay();
    inicio.setDate(inicio.getDate() - diaSemana);

    return Array.from({ length: 7 }, (_, index) => {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + index);
      return dia;
    });
  }

  const primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);
  const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0);

  const dias = [];
  const atual = new Date(primeiroDia);

  while (atual <= ultimoDia) {
    dias.push(new Date(atual));
    atual.setDate(atual.getDate() + 1);
  }

  return dias;
}

function movimentarData(data, modo, direcao) {
  const novaData = new Date(data);

  if (modo === 'dia') {
    novaData.setDate(novaData.getDate() + direcao);
  } else if (modo === 'semana') {
    novaData.setDate(novaData.getDate() + direcao * 7);
  } else {
    novaData.setMonth(novaData.getMonth() + direcao);
  }

  return novaData;
}

function tituloPeriodo(dataReferencia, modo) {
  const data = new Date(dataReferencia);

  if (modo === 'dia') {
    return formatarDataLonga(data);
  }

  if (modo === 'semana') {
    const dias = obterDiasDoPeriodo(data, 'semana');

    if (!dias.length) return '';

    const inicio = dias[0];
    const fim = dias[dias.length - 1];

    return `${inicio.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })} - ${fim.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`;
  }

  return data.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}

function obterTemplateColunasAgenda(totalDias, modoVisualizacao) {
  if (modoVisualizacao === 'dia') {
    return 'minmax(0, 1fr)';
  }

  return `repeat(${totalDias}, minmax(0, 1fr))`;
}

function obterLarguraGradeAgenda(totalDias, modoVisualizacao) {
  if (modoVisualizacao === 'mes') {
    return `${(totalDias / 7) * 100}%`;
  }

  return '100%';
}

function obterTemplateColunasTodosMedicos(totalColunas) {
  if (totalColunas <= 4) {
    return `repeat(${totalColunas}, minmax(0, 1fr))`;
  }

  return `repeat(${totalColunas}, minmax(180px, 1fr))`;
}


function disponibilidadeValeParaData(item, medicoId, data) {
  if (!item.ativo) return false;
  if (String(item.medicoId) !== String(medicoId)) return false;

  const diaSemana = data.getDay();

  if (Number(item.diaSemana) !== Number(diaSemana)) return false;

  const dataAgendamento = normalizarDataComparacao(data);
  const dataInicio = item.dataInicio ? normalizarDataComparacao(item.dataInicio) : null;
  const dataFim = item.dataFim ? normalizarDataComparacao(item.dataFim) : null;

  if (dataInicio && dataAgendamento < dataInicio) return false;
  if (dataFim && dataAgendamento > dataFim) return false;

  return true;
}

function ResumoItem({ label, valor }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-gray-600">{label}</span>
      <strong className="text-gray-900">{valor}</strong>
    </div>
  );
}

function Legenda({ cor, label }) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <span className={`h-3 w-3 rounded ${cor}`} />
      {label}
    </div>
  );
}

function normalizarStatus(status) {
  return (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '')
    .trim();
}

function corPorStatus(status) {
  const s = normalizarStatus(status);

  if (s === 'agendado' || s === 'agendada') return '#3b82f6';
  if (s === 'atendido' || s === 'atendida' || s === 'atendidorecepcao') return '#f59e0b';
  if (s === 'emandamento' || s === 'ematendimentomedico') return '#06b6d4';
  if (s === 'finalizada' || s === 'finalizado') return '#10b981';
  if (s === 'cancelada' || s === 'cancelado') return '#ef4444';

  return '#64748b';
}

function classeCardPorStatus(status) {
  const s = normalizarStatus(status);

  if (s === 'agendado' || s === 'agendada') {
    return 'border-blue-200 bg-blue-50/70 hover:bg-blue-50';
  }

  if (s === 'atendido' || s === 'atendida' || s === 'atendidorecepcao') {
    return 'border-amber-200 bg-amber-50/80 hover:bg-amber-50';
  }

  if (s === 'emandamento' || s === 'ematendimentomedico') {
    return 'border-cyan-300 bg-cyan-100 hover:bg-cyan-50';
  }

  if (s === 'finalizada' || s === 'finalizado') {
    return 'border-green-200 bg-green-50/80 hover:bg-green-50';
  }

  if (s === 'cancelada' || s === 'cancelado') {
    return 'border-red-200 bg-red-50/80 opacity-80 hover:bg-red-50';
  }

  return 'border-gray-200 bg-white hover:bg-sky-50';
}

function formatarStatus(status) {
  const s = normalizarStatus(status);

  if (s === 'agendado' || s === 'agendada') return 'Agendado';
  if (s === 'atendido' || s === 'atendida' || s === 'atendidorecepcao') return 'Atendido recepção';
  if (s === 'emandamento' || s === 'ematendimentomedico') return 'Em atendimento médico';
  if (s === 'finalizada' || s === 'finalizado') return 'Finalizada';
  if (s === 'cancelada' || s === 'cancelado') return 'Cancelada';

  return 'Sem status';
}

function formatarStatusCompacto(status) {
  const s = normalizarStatus(status);

  if (s === 'agendado' || s === 'agendada') return 'Agendado';
  if (s === 'atendido' || s === 'atendida' || s === 'atendidorecepcao') return 'Recepção';
  if (s === 'emandamento' || s === 'ematendimentomedico') return 'Em atendimento';
  if (s === 'finalizada' || s === 'finalizado') return 'Finalizada';
  if (s === 'cancelada' || s === 'cancelado') return 'Cancelada';

  return 'Status';
}

function normalizarDataComparacao(data) {
  if (!data) return null;

  if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return montarDataDoInput(data);
  }

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return null;

  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function montarDataDoInput(valor) {
  if (!valor) return normalizarDataComparacao(new Date());

  const [ano, mes, dia] = valor.split('-').map(Number);

  if (!ano || !mes || !dia) return normalizarDataComparacao(new Date());

  return new Date(ano, mes - 1, dia);
}

function converterHorarioParaMinutos(horario) {
  const [hora, minuto] = horario.split(':').map(Number);
  return hora * 60 + minuto;
}

function converterMinutosParaHorario(totalMinutos) {
  const hora = Math.floor(totalMinutos / 60);
  const minuto = totalMinutos % 60;

  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

function montarDataComHorario(dataBase, horario) {
  const [hora, minuto] = horario.split(':').map(Number);
  const data = new Date(dataBase);

  data.setHours(hora);
  data.setMinutes(minuto);
  data.setSeconds(0);
  data.setMilliseconds(0);

  return data;
}

function formatarDataInput(data) {
  if (!data) return '';

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return '';

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarDataHoraLocal(data) {
  const d = new Date(data);

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');

  return `${ano}-${mes}-${dia}T${hora}:${minuto}:00`;
}

function formatarHora(data) {
  if (!data) return '-';

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return '-';

  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarDataHoraCompleta(data) {
  if (!data) return '-';

  const d = new Date(data);

  if (Number.isNaN(d.getTime())) return '-';

  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarDiaCabecalho(data) {
  return data.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function formatarDiaCabecalhoCompacto(data) {
  const semana = data.toLocaleDateString('pt-BR', {
    weekday: 'short',
  });

  return `${semana.replace('.', '')} ${String(data.getDate()).padStart(2, '0')}`;
}

function formatarDataCurta(data) {
  return data.toLocaleDateString('pt-BR');
}

function formatarDataLonga(data) {
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function ehHoje(data) {
  return formatarDataInput(data) === formatarDataInput(new Date());
}

function ehPerfilMedico(usuario) {
  const perfil = usuario?.perfil;

  return perfil === 'Medico' || perfil === 'Médico' || Number(perfil) === 3;
}

export default AgendaPage;