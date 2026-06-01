// src/components/agenda/AgendaPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Stethoscope } from 'lucide-react';

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

import AgendaFiltros from './AgendaFiltros';
import AgendaResumoCards from './AgendaResumoCards';
import AgendaPorDias from './AgendaPorDias';
import AgendaPorAbasDias from './AgendaPorAbasDias';
import DisponibilidadeRapidaModal from './DisponibilidadeRapidaModal';
import AtendimentoRecepcaoModal from './AtendimentoRecepcaoModal';
import ConfirmarCancelamentoModal from './ConfirmarCancelamentoModal';

import {
  calcularResumoFinanceiro,
  converterDataHoraInputParaIso,
  formatarDataHoraInputLocal,
  formatarDataHoraLocal,
  formatarDataInput,
  formatarMoeda,
  gerarFormasPagamentoIniciais,
  gerarIdLocal,
  montarObservacoesFinanceiras,
  normalizarNumeroDecimal,
  obterValorBaseAgendamento,
  removerResumoFinanceiroDasObservacoes,
  montarDataDoInput,
} from './utils/agendaFormatters';
import {
  ehPerfilMedico,
  movimentarData,
  obterDiaSemana,
  obterDiasDoPeriodo,
} from './utils/agendaSlots';
import { normalizarStatus } from './utils/agendaStatus';

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

  const [dataFinalTodosMedicos, setDataFinalTodosMedicos] = useState(
    formatarDataInput(new Date())
  );

  const [dataSelecionadaAbaTodosMedicos, setDataSelecionadaAbaTodosMedicos] =
    useState(formatarDataInput(new Date()));

  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false);
  const [agendamentoPreenchido, setAgendamentoPreenchido] = useState(null);

  const [modalDisponibilidadeAberto, setModalDisponibilidadeAberto] =
    useState(false);
  const [disponibilidadePreenchida, setDisponibilidadePreenchida] =
    useState(null);
  const [salvandoDisponibilidade, setSalvandoDisponibilidade] =
    useState(false);

  const [modalAtendimentoAberto, setModalAtendimentoAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState([
    { id: gerarIdLocal(), formaPagamento: 'Pix', valor: '0.00' },
  ]);
  const [statusPagamento, setStatusPagamento] = useState('Pago');
  const [dataPagamento, setDataPagamento] = useState(
    formatarDataHoraInputLocal(new Date())
  );
  const [observacaoPagamento, setObservacaoPagamento] = useState('');
  const [tipoDesconto, setTipoDesconto] = useState('Nenhum');
  const [valorDesconto, setValorDesconto] = useState('0');
  const [processandoAtendimento, setProcessandoAtendimento] = useState(false);
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);

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
    const valorBase = obterValorBaseAgendamento(agendamento);
    const pagamentoExistente = agendamento.pagamento;
    const valorPagoExistente = Number(pagamentoExistente?.valor || valorBase || 0);

    setAgendamentoSelecionado(agendamento);
    setFormasPagamento(
      gerarFormasPagamentoIniciais(
        pagamentoExistente,
        valorPagoExistente > 0 ? valorPagoExistente : valorBase
      )
    );
    setStatusPagamento(pagamentoExistente?.statusPagamento || 'Pago');
    setDataPagamento(
      formatarDataHoraInputLocal(pagamentoExistente?.dataPagamento || new Date())
    );
    setObservacaoPagamento(
      removerResumoFinanceiroDasObservacoes(
        pagamentoExistente?.observacoes || ''
      )
    );
    setTipoDesconto('Nenhum');
    setValorDesconto('0');
    setModalAtendimentoAberto(true);
  }

  function fecharModalAtendimento() {
    if (processandoAtendimento) return;

    setModalAtendimentoAberto(false);
    setAgendamentoSelecionado(null);
    setFormasPagamento([
      { id: gerarIdLocal(), formaPagamento: 'Pix', valor: '0.00' },
    ]);
    setStatusPagamento('Pago');
    setDataPagamento(formatarDataHoraInputLocal(new Date()));
    setObservacaoPagamento('');
    setTipoDesconto('Nenhum');
    setValorDesconto('0');
  }

  async function salvarAgendamentoPelaAgenda(agendamento) {
    try {
      await criarAgendamento(agendamento);
      toast.success('Agendamento cadastrado com sucesso!');

      setModalAgendamentoAberto(false);
      setAgendamentoPreenchido(null);

      await carregarDados();
    } catch (error) {
      toast.error(
        error?.response?.data?.mensagem ||
          error?.mensagem ||
          'Erro ao salvar agendamento.'
      );
      console.error(error);
    }
  }

  async function handleAtenderRecepcaoComPagamento() {
    if (!agendamentoSelecionado) return;

    try {
      setProcessandoAtendimento(true);

      const valorBase = obterValorBaseAgendamento(agendamentoSelecionado);
      const resumoFinanceiro = calcularResumoFinanceiro(
        valorBase,
        tipoDesconto,
        valorDesconto,
        formasPagamento
      );

      if (resumoFinanceiro.valorFinal <= 0) {
        toast.error('O valor final precisa ser maior que zero.');
        return;
      }

      if (resumoFinanceiro.totalPago <= 0) {
        toast.error(
          'Informe pelo menos uma forma de pagamento com valor maior que zero.'
        );
        return;
      }

      if (resumoFinanceiro.diferenca > 0.009) {
        toast.error(`Ainda falta pagar ${formatarMoeda(resumoFinanceiro.diferenca)}.`);
        return;
      }

      if (resumoFinanceiro.diferenca < -0.009) {
        toast.error(
          `O valor pago ultrapassa o valor final em ${formatarMoeda(
            Math.abs(resumoFinanceiro.diferenca)
          )}.`
        );
        return;
      }

      if (!statusPagamento) {
        toast.error('Selecione o status do pagamento.');
        return;
      }

      const formasValidas = formasPagamento
        .map((item) => ({
          ...item,
          valorNumerico: normalizarNumeroDecimal(item.valor),
        }))
        .filter((item) => item.valorNumerico > 0);

      if (formasValidas.some((item) => !item.formaPagamento)) {
        toast.error('Selecione a forma de pagamento de todos os lançamentos.');
        return;
      }

      const pagamentoPayload = {
        id: agendamentoSelecionado.pagamento?.id,
        agendamentoId: agendamentoSelecionado.id,
        valor: resumoFinanceiro.totalPago,
        formaPagamento:
          formasValidas.length > 1
            ? 'Misto'
            : formasValidas[0]?.formaPagamento || 'Pix',
        statusPagamento,
        dataPagamento: dataPagamento
          ? converterDataHoraInputParaIso(dataPagamento)
          : null,
        observacoes: montarObservacoesFinanceiras({
          observacaoManual: observacaoPagamento,
          valorBase,
          tipoDesconto,
          valorDesconto: resumoFinanceiro.descontoAplicado,
          valorFinal: resumoFinanceiro.valorFinal,
          formasPagamento: formasValidas,
        }),
      };

      if (agendamentoSelecionado.pagamento?.id) {
        await atualizarPagamento(pagamentoPayload);
      } else {
        await criarPagamento(pagamentoPayload);
      }

      await atenderRecepcao(agendamentoSelecionado.id);

      toast.success('Pagamento registrado e paciente liberado para o médico.');

      fecharModalAtendimento();
      await carregarDados();
    } catch (error) {
      toast.error(
        error?.response?.data?.mensagem ||
          error?.mensagem ||
          'Erro ao registrar pagamento e atender paciente.'
      );
      console.error(error);
    } finally {
      setProcessandoAtendimento(false);
    }
  }

  function handleCancelarAgendamento() {
    if (!agendamentoSelecionado) return;

    setModalCancelarAberto(true);
  }

  async function confirmarCancelamentoAgendamento() {
    if (!agendamentoSelecionado) return;

    try {
      setProcessandoAtendimento(true);

      await cancelarAgendamento(agendamentoSelecionado.id);

      toast.success('Agendamento cancelado com sucesso.');

      setModalCancelarAberto(false);
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
      setDataReferencia(montarDataDoInput(dataSelecionadaAbaTodosMedicos));
    } else {
      const dataAtual = formatarDataInput(dataReferencia);
      setDataFiltroTodosMedicos(dataAtual);
      setDataFinalTodosMedicos(dataAtual);
      setDataSelecionadaAbaTodosMedicos(dataAtual);
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
    setDataSelecionadaAbaTodosMedicos(dia);

    if (
      !dataFinalTodosMedicos ||
      montarDataDoInput(dataFinalTodosMedicos) < montarDataDoInput(dia)
    ) {
      setDataFinalTodosMedicos(dia);
    }
  }

  function alterarDataFinalTodosMedicos(valor) {
    const dia = valor || dataFiltroTodosMedicos;

    setDataFinalTodosMedicos(dia);

    if (montarDataDoInput(dia) < montarDataDoInput(dataFiltroTodosMedicos)) {
      setDataFiltroTodosMedicos(dia);
      setDataSelecionadaAbaTodosMedicos(dia);
      return;
    }

    if (
      montarDataDoInput(dataSelecionadaAbaTodosMedicos) > montarDataDoInput(dia)
    ) {
      setDataSelecionadaAbaTodosMedicos(dia);
    }
  }

  function limparFiltros() {
    const hoje = new Date();
    const hojeInput = formatarDataInput(hoje);

    setBusca('');
    setStatusFiltro('');
    setMedicoFiltro(
      usuarioEhMedico && medicosVisiveis[0] ? String(medicosVisiveis[0].id) : ''
    );
    setDataReferencia(hoje);
    setDataFiltroTodosMedicos(hojeInput);
    setDataFinalTodosMedicos(hojeInput);
    setDataSelecionadaAbaTodosMedicos(hojeInput);
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
      const mesmoUsuarioId =
        medico.usuarioId && String(medico.usuarioId) === usuarioId;
      const mesmoEmail =
        emailUsuario && (medico.email || '').toLowerCase() === emailUsuario;

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

  useEffect(() => {
    if (medicoFiltro) return;

    const inicio = montarDataDoInput(dataFiltroTodosMedicos);
    const fim = montarDataDoInput(dataFinalTodosMedicos);
    const selecionada = montarDataDoInput(dataSelecionadaAbaTodosMedicos);

    const menorData = inicio <= fim ? inicio : fim;
    const maiorData = inicio <= fim ? fim : inicio;

    if (selecionada < menorData || selecionada > maiorData) {
      setDataSelecionadaAbaTodosMedicos(formatarDataInput(menorData));
    }
  }, [
    medicoFiltro,
    dataFiltroTodosMedicos,
    dataFinalTodosMedicos,
    dataSelecionadaAbaTodosMedicos,
  ]);

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
    return montarDataDoInput(dataSelecionadaAbaTodosMedicos);
  }, [dataSelecionadaAbaTodosMedicos]);

  const agendamentosDoDiaTodosMedicos = useMemo(() => {
    return agendamentosFiltrados.filter(
      (agendamento) =>
        formatarDataInput(agendamento.dataAgendamento) ===
        dataSelecionadaAbaTodosMedicos
    );
  }, [agendamentosFiltrados, dataSelecionadaAbaTodosMedicos]);

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
    return medicosVisiveis.find(
      (medico) => String(medico.id) === String(medicoFiltro)
    );
  }, [medicosVisiveis, medicoFiltro]);

  return (
    <div className="flex h-[calc(100dvh-64px)] w-full flex-col overflow-hidden bg-gray-100 p-2 lg:p-3">
      <section className="mb-2 shrink-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <AgendaFiltros
          busca={busca}
          setBusca={setBusca}
          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}
          medicoFiltro={medicoFiltro}
          alterarMedicoFiltro={alterarMedicoFiltro}
          dataReferencia={dataReferencia}
          dataFiltroTodosMedicos={dataFiltroTodosMedicos}
          dataFinalTodosMedicos={dataFinalTodosMedicos}
          alterarDiaAgenda={alterarDiaAgenda}
          alterarDataFinalTodosMedicos={alterarDataFinalTodosMedicos}
          limparFiltros={limparFiltros}
          carregarDados={carregarDados}
          loading={loading}
          usuarioEhMedico={usuarioEhMedico}
          medicosVisiveis={medicosVisiveis}
        />

        <AgendaResumoCards
          medicoFiltro={medicoFiltro}
          agendamentosExibidosMedico={agendamentosExibidosMedico}
          agendamentosDoDiaTodosMedicos={agendamentosDoDiaTodosMedicos}
          agendamentos={agendamentos}
          medicosVisiveis={medicosVisiveis}
          disponibilidades={disponibilidades}
        />
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
            disponibilidades={
              usuarioEhMedico
                ? disponibilidades.filter(
                    (item) => String(item.medicoId) === String(medicoSelecionado.id)
                  )
                : disponibilidades
            }
            modoVisualizacao={modoVisualizacao}
            setModoVisualizacao={setModoVisualizacao}
            dataReferencia={dataReferencia}
            onHoje={irHoje}
            onVoltar={voltarPeriodo}
            onAvancar={avancarPeriodo}
            onAbrirAgendamento={abrirModalAtendimento}
            onAbrirLivre={usuarioEhMedico ? null : abrirCadastroAgendamentoLivre}
            onAbrirDisponibilidade={
              usuarioEhMedico ? null : abrirCadastroDisponibilidade
            }
          />
        ) : usuarioEhMedico ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-sky-50 p-6 text-center">
            <div className="max-w-md">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
                <Stethoscope className="h-6 w-6 text-sky-700" />
              </div>
              <h2 className="text-lg font-black text-gray-900">
                Médico não vinculado
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Para visualizar a agenda médica, vincule este usuário ao cadastro
                do médico.
              </p>
            </div>
          </div>
        ) : (
          <AgendaPorAbasDias
            medicos={medicosVisiveis}
            agendamentosFiltrados={agendamentosFiltrados}
            dataInicial={dataFiltroTodosMedicos}
            dataFinal={dataFinalTodosMedicos}
            dataSelecionada={dataSelecionadaAbaTodosMedicos}
            setDataSelecionada={setDataSelecionadaAbaTodosMedicos}
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
        formasPagamento={formasPagamento}
        setFormasPagamento={setFormasPagamento}
        tipoDesconto={tipoDesconto}
        setTipoDesconto={setTipoDesconto}
        valorDesconto={valorDesconto}
        setValorDesconto={setValorDesconto}
        statusPagamento={statusPagamento}
        setStatusPagamento={setStatusPagamento}
        dataPagamento={dataPagamento}
        setDataPagamento={setDataPagamento}
        observacaoPagamento={observacaoPagamento}
        setObservacaoPagamento={setObservacaoPagamento}
        processando={processandoAtendimento}
        onClose={fecharModalAtendimento}
        onAtender={handleAtenderRecepcaoComPagamento}
        onCancelar={handleCancelarAgendamento}
      />

      <ConfirmarCancelamentoModal
        isOpen={modalCancelarAberto}
        agendamento={agendamentoSelecionado}
        processando={processandoAtendimento}
        onClose={() => setModalCancelarAberto(false)}
        onConfirmar={confirmarCancelamentoAgendamento}
      />
    </div>
  );
}

export default AgendaPage;