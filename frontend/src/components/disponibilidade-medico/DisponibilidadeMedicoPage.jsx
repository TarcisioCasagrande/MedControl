import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  Power,
  Search,
  Save,
  X,
  Info,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { getMedicos } from '../../services/medicoService';
import {
  listarDisponibilidades,
  criarDisponibilidade,
  atualizarDisponibilidade,
  alterarStatusDisponibilidade,
  excluirDisponibilidade,
} from '../../services/disponibilidadeMedicoService';

const diasSemana = [
  { valor: 0, label: 'Domingo' },
  { valor: 1, label: 'Segunda-feira' },
  { valor: 2, label: 'Terça-feira' },
  { valor: 3, label: 'Quarta-feira' },
  { valor: 4, label: 'Quinta-feira' },
  { valor: 5, label: 'Sexta-feira' },
  { valor: 6, label: 'Sábado' },
];

const formInicial = {
  medicoId: '',
  diasSemana: [],
  horaInicio: '08:00',
  horaFim: '12:00',
  intervaloMinutos: 30,
  dataInicio: '',
  dataFim: '',
  ativo: true,
};

function DisponibilidadeMedicoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formInicial);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [parametrosAplicados, setParametrosAplicados] = useState(false);

  const [aviso, setAviso] = useState({
    aberto: false,
    titulo: '',
    mensagem: '',
    tipo: 'erro',
  });

  const [confirmacao, setConfirmacao] = useState({
    aberto: false,
    item: null,
    carregando: false,
  });

  const [selecionados, setSelecionados] = useState([]);

  const [confirmacaoLote, setConfirmacaoLote] = useState({
    aberto: false,
    carregando: false,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarParametrosDaAgenda();
  }, [medicos, parametrosAplicados]);

  function aplicarParametrosDaAgenda() {
    if (parametrosAplicados || !medicos.length) return;

    const medicoId = searchParams.get('medicoId');
    const data = searchParams.get('data');

    if (!medicoId || !data) return;

    const medicoExiste = medicos.some(
      (medico) => String(medico.id) === String(medicoId)
    );

    const diaSemana = obterDiaSemanaDoInput(data);

    if (!medicoExiste || diaSemana === null) return;

    setEditando(null);

    setForm({
      ...formInicial,
      medicoId,
      dataInicio: data,
      dataFim: data,
      diasSemana: [diaSemana],
      ativo: true,
    });

    setModalAberto(true);
    setParametrosAplicados(true);
    setSearchParams({});
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

  async function carregarDados() {
    try {
      setCarregando(true);

      const [dadosDisponibilidades, dadosMedicos] = await Promise.all([
        listarDisponibilidades(),
        getMedicos(),
      ]);

      const disponibilidadesCarregadas = dadosDisponibilidades || [];
      const idsDisponiveis = disponibilidadesCarregadas.map((item) => item.id);

      setDisponibilidades(disponibilidadesCarregadas);
      setMedicos(dadosMedicos || []);
      setSelecionados((prev) => prev.filter((id) => idsDisponiveis.includes(id)));
    } catch (error) {
      abrirAviso(
        'Erro ao carregar dados',
        'Não foi possível carregar as disponibilidades médicas.'
      );
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  function dataHoje() {
    return new Date().toISOString().substring(0, 10);
  }

  function abrirNovo() {
    setParametrosAplicados(true);

    const hoje = dataHoje();
    const diaSemanaHoje = obterDiaSemanaDoInput(hoje);

    setEditando(null);

    setForm({
      ...formInicial,
      dataInicio: hoje,
      dataFim: hoje,
      diasSemana: diaSemanaHoje !== null ? [diaSemanaHoje] : [],
    });

    setModalAberto(true);
  }

  function abrirEdicao(item) {
    setEditando(item);

    setForm({
      medicoId: item.medicoId || '',
      diasSemana: [Number(item.diaSemana)],
      horaInicio: item.horaInicio || '08:00',
      horaFim: item.horaFim || '12:00',
      intervaloMinutos: item.intervaloMinutos || 30,
      dataInicio: item.dataInicio ? item.dataInicio.substring(0, 10) : dataHoje(),
      dataFim: item.dataFim ? item.dataFim.substring(0, 10) : dataHoje(),
      ativo: item.ativo,
    });

    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setEditando(null);
    setForm(formInicial);
  }

  function atualizarDataInicio(valor) {
    const diaSemana = obterDiaSemanaDoInput(valor);

    setForm((prev) => ({
      ...prev,
      dataInicio: valor,
      dataFim: prev.dataFim && prev.dataFim >= valor ? prev.dataFim : valor,
      diasSemana:
        !editando && diaSemana !== null && prev.diasSemana.length === 0
          ? [diaSemana]
          : prev.diasSemana,
    }));
  }

  function atualizarDataFim(valor) {
    setForm((prev) => ({
      ...prev,
      dataFim: valor,
    }));
  }

  function selecionarSomenteDiaDaDataInicial() {
    const diaSemana = obterDiaSemanaDoInput(form.dataInicio);

    if (diaSemana === null) return;

    setForm((prev) => ({
      ...prev,
      diasSemana: [diaSemana],
    }));
  }

  function alternarDiaSemana(valor) {
    if (editando) {
      setForm({
        ...form,
        diasSemana: [valor],
      });
      return;
    }

    const existe = form.diasSemana.includes(valor);

    setForm({
      ...form,
      diasSemana: existe
        ? form.diasSemana.filter((dia) => dia !== valor)
        : [...form.diasSemana, valor],
    });
  }

  async function salvar(e) {
    e.preventDefault();

    if (!form.medicoId) {
      abrirAviso(
        'Médico obrigatório',
        'Selecione um médico para criar a disponibilidade.'
      );
      return;
    }

    if (!form.dataInicio || !form.dataFim) {
      abrirAviso(
        'Datas obrigatórias',
        'Informe a data inicial e a data final da disponibilidade.'
      );
      return;
    }

    if (form.dataInicio > form.dataFim) {
      abrirAviso(
        'Período inválido',
        'A data inicial não pode ser maior que a data final.'
      );
      return;
    }

    if (!form.diasSemana.length) {
      abrirAviso(
        'Dia da semana obrigatório',
        'Selecione pelo menos um dia da semana para criar a disponibilidade.'
      );
      return;
    }

    if (editando && form.diasSemana.length !== 1) {
      abrirAviso(
        'Edição de disponibilidade',
        'Na edição, selecione apenas um dia da semana.'
      );
      return;
    }

    const datasPrevistas = calcularDatasPrevistas(
      form.dataInicio,
      form.dataFim,
      form.diasSemana
    );

    if (!datasPrevistas.length) {
      abrirAviso(
        'Período sem datas disponíveis',
        'Nenhuma data dentro do período corresponde aos dias da semana selecionados. Ajuste o período ou escolha outro dia da semana.'
      );
      return;
    }

    try {
      setSalvando(true);

      const dados = {
        medicoId: Number(form.medicoId),
        diasSemana: form.diasSemana.map(Number),
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
        intervaloMinutos: Number(form.intervaloMinutos),
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        ativo: form.ativo,
      };

      if (editando) {
        await atualizarDisponibilidade(editando.id, dados);
      } else {
        await criarDisponibilidade(dados);
      }

      setModalAberto(false);
      setEditando(null);
      setForm(formInicial);

      await carregarDados();
    } catch (error) {
      abrirAviso(
        'Erro ao salvar',
        error?.response?.data?.mensagem || 'Erro ao salvar disponibilidade.'
      );
      console.error(error);
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus(id) {
    if (!confirm('Deseja alterar o status desta disponibilidade?')) return;

    try {
      await alterarStatusDisponibilidade(id);
      await carregarDados();
    } catch (error) {
      abrirAviso(
        'Erro ao alterar status',
        error?.response?.data?.mensagem || 'Erro ao alterar status.'
      );
      console.error(error);
    }
  }

  function remover(item) {
    setConfirmacao({
      aberto: true,
      item,
      carregando: false,
    });
  }

  function fecharConfirmacao() {
    setConfirmacao({
      aberto: false,
      item: null,
      carregando: false,
    });
  }

  async function confirmarExclusao() {
    if (!confirmacao.item?.id) return;

    try {
      setConfirmacao((prev) => ({
        ...prev,
        carregando: true,
      }));

      await excluirDisponibilidade(confirmacao.item.id);

      setSelecionados((prev) => prev.filter((id) => id !== confirmacao.item.id));
      fecharConfirmacao();

      await carregarDados();
    } catch (error) {
      fecharConfirmacao();

      abrirAviso(
        'Não foi possível excluir',
        error?.response?.data?.mensagem ||
          'Não foi possível excluir esta disponibilidade. Verifique se existe algum agendamento vinculado antes de tentar novamente.'
      );

      console.error(error);
    }
  }

  function alternarSelecionado(id) {
    setSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  }

  function alternarTodosFiltrados() {
    const idsFiltrados = disponibilidadesFiltradas.map((item) => item.id);

    if (!idsFiltrados.length) return;

    const todosMarcados = idsFiltrados.every((id) => selecionados.includes(id));

    if (todosMarcados) {
      setSelecionados((prev) => prev.filter((id) => !idsFiltrados.includes(id)));
      return;
    }

    setSelecionados((prev) => Array.from(new Set([...prev, ...idsFiltrados])));
  }

  function abrirConfirmacaoLote() {
    if (!selecionados.length) {
      abrirAviso(
        'Nenhuma disponibilidade selecionada',
        'Selecione pelo menos uma disponibilidade para excluir em lote.'
      );
      return;
    }

    setConfirmacaoLote({
      aberto: true,
      carregando: false,
    });
  }

  function fecharConfirmacaoLote() {
    setConfirmacaoLote({
      aberto: false,
      carregando: false,
    });
  }

  async function confirmarExclusaoLote() {
    if (!selecionados.length) return;

    const itensSelecionados = disponibilidades.filter((item) =>
      selecionados.includes(item.id)
    );

    if (!itensSelecionados.length) {
      fecharConfirmacaoLote();
      setSelecionados([]);
      return;
    }

    try {
      setConfirmacaoLote((prev) => ({
        ...prev,
        carregando: true,
      }));

      const resultados = await Promise.all(
        itensSelecionados.map(async (item) => {
          try {
            await excluirDisponibilidade(item.id);

            return {
              sucesso: true,
              id: item.id,
              nome: item.medicoNome || 'Disponibilidade',
            };
          } catch (error) {
            return {
              sucesso: false,
              id: item.id,
              nome: item.medicoNome || 'Disponibilidade',
              mensagem:
                error?.response?.data?.mensagem ||
                'Não foi possível excluir esta disponibilidade. Verifique se existe algum agendamento vinculado.',
            };
          }
        })
      );

      const sucessos = resultados.filter((item) => item.sucesso);
      const falhas = resultados.filter((item) => !item.sucesso);

      const idsComFalha = falhas.map((item) => item.id);

      setSelecionados(idsComFalha);
      fecharConfirmacaoLote();

      await carregarDados();

      if (sucessos.length > 0 && falhas.length === 0) {
        abrirAviso(
          'Exclusão concluída',
          `${sucessos.length} ${
            sucessos.length === 1
              ? 'disponibilidade foi excluída com sucesso.'
              : 'disponibilidades foram excluídas com sucesso.'
          }`,
          'info'
        );
      } else if (sucessos.length > 0 && falhas.length > 0) {
        abrirAviso(
          'Exclusão parcial',
          `${sucessos.length} ${
            sucessos.length === 1
              ? 'disponibilidade foi excluída'
              : 'disponibilidades foram excluídas'
          }. ${falhas.length} ${
            falhas.length === 1
              ? 'não pôde ser excluída porque possui agendamento vinculado ou outra restrição.'
              : 'não puderam ser excluídas porque possuem agendamentos vinculados ou outra restrição.'
          }`,
          'info'
        );
      } else if (falhas.length > 0) {
        abrirAviso(
          'Não foi possível excluir',
          falhas[0].mensagem ||
            'As disponibilidades selecionadas não puderam ser excluídas. Verifique se existem agendamentos vinculados.'
        );
      }
    } catch (error) {
      fecharConfirmacaoLote();

      abrirAviso(
        'Erro ao excluir em lote',
        error?.response?.data?.mensagem ||
          'Não foi possível excluir as disponibilidades selecionadas.'
      );

      console.error(error);
    }
  }

  function nomeDia(valor) {
    return diasSemana.find((dia) => dia.valor === Number(valor))?.label || '-';
  }

  function formatarData(data) {
    if (!data) return '-';

    return new Date(data).toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
    });
  }

  const disponibilidadesFiltradas = useMemo(() => {
    return disponibilidades.filter((item) => {
      const texto = `
        ${item.medicoNome || ''}
        ${nomeDia(item.diaSemana)}
        ${item.horaInicio || ''}
        ${item.horaFim || ''}
        ${item.intervaloMinutos || ''}
      `.toLowerCase();

      return texto.includes(busca.toLowerCase());
    });
  }, [disponibilidades, busca]);

  const idsFiltrados = useMemo(() => {
    return disponibilidadesFiltradas.map((item) => item.id);
  }, [disponibilidadesFiltradas]);

  const todosFiltradosSelecionados = useMemo(() => {
    return (
      idsFiltrados.length > 0 &&
      idsFiltrados.every((id) => selecionados.includes(id))
    );
  }, [idsFiltrados, selecionados]);

  const algumasDisponibilidadesSelecionadas = useMemo(() => {
    return idsFiltrados.some((id) => selecionados.includes(id));
  }, [idsFiltrados, selecionados]);

  const datasPrevistas = useMemo(() => {
    return calcularDatasPrevistas(
      form.dataInicio,
      form.dataFim,
      form.diasSemana
    );
  }, [form.dataInicio, form.dataFim, form.diasSemana]);

  const diaSemanaDataInicial = useMemo(() => {
    const dia = obterDiaSemanaDoInput(form.dataInicio);
    return dia === null ? null : diasSemana.find((item) => item.valor === dia);
  }, [form.dataInicio]);

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-3 lg:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100">
              <CalendarClock className="h-5 w-5 text-sky-600" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xs font-bold text-gray-900 sm:text-lg">
                Disponibilidade Médica
              </h1>

              <p className="text-xs text-gray-500">
                Configure datas reais, dias, horários e intervalos de atendimento
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {selecionados.length > 0 && (
              <button
                type="button"
                onClick={abrirConfirmacaoLote}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Excluir ({selecionados.length})
              </button>
            )}

            <button
              onClick={abrirNovo}
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 text-xs font-semibold text-white transition hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Nova disponibilidade
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm lg:px-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 px-3">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />

              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por médico, dia, horário ou intervalo..."
                className="h-full w-full border-none bg-transparent text-xs outline-none sm:text-sm"
              />
            </div>

            <div className="flex min-h-9 flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
              <span>
                {disponibilidadesFiltradas.length}{' '}
                {disponibilidadesFiltradas.length === 1
                  ? 'disponibilidade encontrada'
                  : 'disponibilidades encontradas'}
              </span>

              {selecionados.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-700">
                  {selecionados.length} selecionada{selecionados.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {carregando ? (
            <div className="p-4 text-sm text-gray-500">
              Carregando disponibilidades...
            </div>
          ) : (
            <>
              <div className="grid gap-3 p-3 lg:hidden">
                {disponibilidadesFiltradas.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    Nenhuma disponibilidade encontrada.
                  </div>
                ) : (
                  disponibilidadesFiltradas.map((item) => (
                    <DisponibilidadeCardMobile
                      key={item.id}
                      item={item}
                      selecionado={selecionados.includes(item.id)}
                      nomeDia={nomeDia}
                      formatarData={formatarData}
                      onSelecionar={() => alternarSelecionado(item.id)}
                      onEditar={() => abrirEdicao(item)}
                      onAlternarStatus={() => alternarStatus(item.id)}
                      onRemover={() => remover(item)}
                    />
                  ))
                )}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="w-[52px] px-3 py-3">
                        <input
                          type="checkbox"
                          checked={todosFiltradosSelecionados}
                          ref={(elemento) => {
                            if (elemento) {
                              elemento.indeterminate =
                                algumasDisponibilidadesSelecionadas &&
                                !todosFiltradosSelecionados;
                            }
                          }}
                          onChange={alternarTodosFiltrados}
                          className="accent-sky-600"
                        />
                      </th>

                      <th className="w-[90px] px-3 py-3 text-left">
                        ID
                      </th>

                      <th className="min-w-[260px] px-3 py-3 text-left">
                        Médico
                      </th>

                      <th className="min-w-[130px] px-3 py-3 text-left">
                        Data
                      </th>

                      <th className="min-w-[160px] px-3 py-3 text-left">
                        Dia
                      </th>

                      <th className="min-w-[170px] px-3 py-3 text-left">
                        Horário
                      </th>

                      <th className="min-w-[120px] px-3 py-3 text-left">
                        Intervalo
                      </th>

                      <th className="min-w-[120px] px-3 py-3 text-left">
                        Status
                      </th>

                      <th className="min-w-[150px] px-3 py-3 text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {disponibilidadesFiltradas.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selecionados.includes(item.id)}
                            onChange={() => alternarSelecionado(item.id)}
                            className="accent-sky-600"
                            title="Selecionar disponibilidade"
                          />
                        </td>

                        <td className="px-3 py-3">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">
                            # {item.id}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold uppercase text-gray-900">
                              {item.medicoNome || '-'}
                            </p>

                            <p className="text-[11px] text-gray-400">
                              Disponibilidade médica
                            </p>
                          </div>
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-600">
                          {formatarData(item.dataInicio)}
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-600">
                          {nomeDia(item.diaSemana)}
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-600">
                          {item.horaInicio} às {item.horaFim}
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-600">
                          {item.intervaloMinutos} min
                        </td>

                        <td className="px-3 py-3">
                          <StatusDisponibilidade ativo={item.ativo} />
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
                            <BotaoAcao
                              onClick={() => abrirEdicao(item)}
                              titulo="Editar"
                              cor="blue"
                            >
                              <Pencil className="h-4 w-4" />
                            </BotaoAcao>

                            <BotaoAcao
                              onClick={() => alternarStatus(item.id)}
                              titulo="Ativar/Inativar"
                              cor="amber"
                            >
                              <Power className="h-4 w-4" />
                            </BotaoAcao>

                            <BotaoAcao
                              onClick={() => remover(item)}
                              titulo="Excluir"
                              cor="red"
                            >
                              <Trash2 className="h-4 w-4" />
                            </BotaoAcao>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {disponibilidadesFiltradas.length === 0 && (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-4 py-8 text-center text-sm text-gray-500"
                        >
                          Nenhuma disponibilidade encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-sky-600 px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <CalendarClock className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold">
                    {editando ? 'Editar disponibilidade' : 'Nova disponibilidade'}
                  </h2>

                  <p className="text-xs text-sky-100">
                    {editando
                      ? 'Edite uma data específica de atendimento.'
                      : 'O sistema criará uma disponibilidade para cada data correspondente aos dias selecionados.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={salvar} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3">
                <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-sky-600" />
                    <h3 className="text-xs font-bold text-gray-900">
                      Período e médico
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        Médico
                      </label>

                      <select
                        value={form.medicoId}
                        onChange={(e) =>
                          setForm({ ...form, medicoId: e.target.value })
                        }
                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        required
                      >
                        <option value="">Selecione um médico</option>

                        {medicos.map((medico) => (
                          <option key={medico.id} value={medico.id}>
                            {medico.nome} - {medico.especialidade}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          Data inicial
                        </label>

                        <input
                          type="date"
                          value={form.dataInicio}
                          onChange={(e) => atualizarDataInicio(e.target.value)}
                          className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          required
                        />

                        {diaSemanaDataInicial && (
                          <p className="mt-1 text-[11px] font-semibold text-sky-700">
                            Essa data cai em {diaSemanaDataInicial.label}.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          Data final
                        </label>

                        <input
                          type="date"
                          value={form.dataFim}
                          onChange={(e) => atualizarDataFim(e.target.value)}
                          className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-sky-600" />
                      <h3 className="text-xs font-bold text-gray-900">
                        Dias da semana
                      </h3>
                    </div>

                    {form.dataInicio && (
                      <button
                        type="button"
                        onClick={selecionarSomenteDiaDaDataInicial}
                        className="rounded-lg bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-700 transition hover:bg-sky-100"
                      >
                        Usar dia da data inicial
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {diasSemana.map((dia) => {
                      const totalDia = calcularDatasPrevistas(
                        form.dataInicio,
                        form.dataFim,
                        [dia.valor]
                      ).length;

                      return (
                        <label
                          key={dia.valor}
                          className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                            form.diasSemana.includes(dia.valor)
                              ? 'border-sky-500 bg-sky-50 text-sky-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={form.diasSemana.includes(dia.valor)}
                              onChange={() => alternarDiaSemana(dia.valor)}
                              className="accent-sky-600"
                            />
                            {dia.label}
                          </span>

                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                            {totalDia}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {editando && (
                    <p className="mt-2 text-xs text-amber-600">
                      Na edição, o sistema permite apenas uma data/dia por registro.
                    </p>
                  )}
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-sky-600" />
                    <h3 className="text-xs font-bold text-gray-900">
                      Horário de atendimento
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        Hora início
                      </label>

                      <input
                        type="time"
                        value={form.horaInicio}
                        onChange={(e) =>
                          setForm({ ...form, horaInicio: e.target.value })
                        }
                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        Hora fim
                      </label>

                      <input
                        type="time"
                        value={form.horaFim}
                        onChange={(e) =>
                          setForm({ ...form, horaFim: e.target.value })
                        }
                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        Intervalo
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={form.intervaloMinutos}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            intervaloMinutos: e.target.value,
                          })
                        }
                        placeholder="Ex: 30"
                        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        required
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-700" />

                    <div>
                      <h3 className="text-sm font-bold text-sky-900">
                        Prévia da criação
                      </h3>

                      <p className="mt-1 text-xs text-sky-800">
                        {editando
                          ? 'Você está editando uma disponibilidade específica.'
                          : `Serão criadas ${datasPrevistas.length} disponibilidade(s) com base no período e nos dias selecionados.`}
                      </p>

                      {!editando && datasPrevistas.length > 0 && (
                        <div className="mt-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                          {datasPrevistas.map((data) => (
                            <span
                              key={data}
                              className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-sky-700 shadow-sm"
                            >
                              {formatarDataInputParaBR(data)} ·{' '}
                              {nomeDia(obterDiaSemanaDoInput(data))}
                            </span>
                          ))}
                        </div>
                      )}

                      {!editando &&
                        form.dataInicio &&
                        form.dataFim &&
                        !datasPrevistas.length && (
                          <p className="mt-2 text-xs font-semibold text-red-600">
                            Nenhuma data dentro do período corresponde aos dias selecionados.
                          </p>
                        )}
                    </div>
                  </div>
                </section>

                <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm">
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(e) =>
                      setForm({ ...form, ativo: e.target.checked })
                    }
                    className="accent-sky-600"
                  />
                  Disponibilidade ativa
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="flex h-9 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {salvando ? 'Salvando...' : 'Salvar disponibilidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ModalConfirmacaoExclusaoLote
        aberto={confirmacaoLote.aberto}
        quantidade={selecionados.length}
        carregando={confirmacaoLote.carregando}
        onCancelar={fecharConfirmacaoLote}
        onConfirmar={confirmarExclusaoLote}
      />

      <ModalConfirmacaoExclusao
        aberto={confirmacao.aberto}
        item={confirmacao.item}
        carregando={confirmacao.carregando}
        onCancelar={fecharConfirmacao}
        onConfirmar={confirmarExclusao}
      />

      <ModalAviso
        aberto={aviso.aberto}
        titulo={aviso.titulo}
        mensagem={aviso.mensagem}
        tipo={aviso.tipo}
        onClose={fecharAviso}
      />
    </div>
  );
}

function DisponibilidadeCardMobile({
  item,
  selecionado,
  nomeDia,
  formatarData,
  onSelecionar,
  onEditar,
  onAlternarStatus,
  onRemover,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="checkbox"
            checked={selecionado}
            onChange={onSelecionar}
            className="accent-sky-600"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                # {item.id}
              </span>

              <p className="truncate text-xs font-bold text-gray-900">
                {item.medicoNome || '-'}
              </p>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              {formatarData(item.dataInicio)} · {nomeDia(item.diaSemana)}
            </p>
          </div>
        </div>

        <StatusDisponibilidade ativo={item.ativo} />
      </div>

      <div className="grid gap-2 text-xs">
        <LinhaMobile label="Horário" valor={`${item.horaInicio} às ${item.horaFim}`} />
        <LinhaMobile label="Intervalo" valor={`${item.intervaloMinutos} min`} />
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
        <BotaoAcao onClick={onEditar} titulo="Editar" cor="blue">
          <Pencil className="h-4 w-4" />
        </BotaoAcao>

        <BotaoAcao onClick={onAlternarStatus} titulo="Ativar/Inativar" cor="amber">
          <Power className="h-4 w-4" />
        </BotaoAcao>

        <BotaoAcao onClick={onRemover} titulo="Excluir" cor="red">
          <Trash2 className="h-4 w-4" />
        </BotaoAcao>
      </div>
    </div>
  );
}

function LinhaMobile({ label, valor }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-800">{valor}</p>
    </div>
  );
}

function StatusDisponibilidade({ ativo }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${
        ativo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function BotaoAcao({ children, onClick, titulo, cor = 'slate' }) {
  const estilos = {
    slate: 'text-slate-600 hover:bg-slate-100',
    blue: 'text-blue-600 hover:bg-blue-50',
    amber: 'text-amber-600 hover:bg-amber-50',
    red: 'text-red-600 hover:bg-red-50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition ${
        estilos[cor] || estilos.slate
      }`}
    >
      {children}
    </button>
  );
}

function ModalConfirmacaoExclusaoLote({
  aberto,
  quantidade,
  carregando,
  onCancelar,
  onConfirmar,
}) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 bg-red-600 px-4 py-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold">Excluir em lote</h2>
            <p className="text-xs text-white/80">
              O backend validará cada disponibilidade antes de excluir.
            </p>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5">
          <p className="text-sm leading-relaxed text-gray-700">
            Deseja excluir {quantidade}{' '}
            {quantidade === 1
              ? 'disponibilidade selecionada'
              : 'disponibilidades selecionadas'}?
          </p>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
            Disponibilidades com agendamentos vinculados não serão excluídas.
            O sistema manterá selecionadas apenas as que falharem, para você conseguir revisar.
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onCancelar}
            disabled={carregando}
            className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={carregando}
            className="h-9 rounded-lg bg-red-600 px-5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? 'Excluindo...' : 'Excluir selecionadas'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalConfirmacaoExclusao({
  aberto,
  item,
  carregando,
  onCancelar,
  onConfirmar,
}) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 bg-red-600 px-4 py-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold">Confirmar exclusão</h2>
            <p className="text-xs text-white/80">
              Essa ação será validada antes de remover o registro.
            </p>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5">
          <p className="text-sm leading-relaxed text-gray-700">
            Deseja realmente excluir esta disponibilidade?
          </p>

          {item && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-800">
              <p className="font-bold">{item.medicoNome || 'Médico não informado'}</p>
              <p>
                {formatarDataModal(item.dataInicio)} · {item.horaInicio} às{' '}
                {item.horaFim}
              </p>
            </div>
          )}

          <p className="text-xs leading-relaxed text-gray-500">
            Se existir algum agendamento nesse período, o sistema não permitirá a exclusão e mostrará a orientação correta.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onCancelar}
            disabled={carregando}
            className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={carregando}
            className="h-9 rounded-lg bg-red-600 px-5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? 'Excluindo...' : 'Excluir disponibilidade'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalAviso({ aberto, titulo, mensagem, tipo = 'erro', onClose }) {
  if (!aberto) return null;

  const estilos = {
    erro: {
      header: 'bg-red-600',
      iconBox: 'bg-white/15',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-200',
      icon: AlertTriangle,
    },
    info: {
      header: 'bg-sky-600',
      iconBox: 'bg-white/15',
      button: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-200',
      icon: Info,
    },
  };

  const estilo = estilos[tipo] || estilos.erro;
  const Icon = estilo.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className={`flex items-center gap-3 px-4 py-3 text-white ${estilo.header}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${estilo.iconBox}`}>
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold">{titulo || 'Atenção'}</h2>
            <p className="text-xs text-white/80">Verifique a informação abaixo.</p>
          </div>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-gray-700">
            {mensagem}
          </p>
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className={`h-9 rounded-lg px-5 text-xs font-bold text-white outline-none transition focus:ring-4 ${estilo.button}`}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

function obterDiaSemanaDoInput(dataInput) {
  if (!dataInput) return null;

  const [ano, mes, dia] = dataInput.split('-').map(Number);

  if (!ano || !mes || !dia) return null;

  return new Date(ano, mes - 1, dia).getDay();
}

function calcularDatasPrevistas(dataInicio, dataFim, diasSelecionados) {
  if (!dataInicio || !dataFim || !diasSelecionados?.length) return [];

  const inicio = montarDataLocal(dataInicio);
  const fim = montarDataLocal(dataFim);

  if (!inicio || !fim || inicio > fim) return [];

  const dias = diasSelecionados.map(Number);
  const datas = [];
  const atual = new Date(inicio);

  while (atual <= fim) {
    if (dias.includes(atual.getDay())) {
      datas.push(formatarDataInputLocal(atual));
    }

    atual.setDate(atual.getDate() + 1);
  }

  return datas;
}

function montarDataLocal(dataInput) {
  if (!dataInput) return null;

  const [ano, mes, dia] = dataInput.split('-').map(Number);

  if (!ano || !mes || !dia) return null;

  return new Date(ano, mes - 1, dia);
}

function formatarDataInputLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarDataInputParaBR(dataInput) {
  const data = montarDataLocal(dataInput);

  if (!data) return '-';

  return data.toLocaleDateString('pt-BR');
}

function formatarDataModal(data) {
  if (!data) return '-';

  return new Date(data).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  });
}

export default DisponibilidadeMedicoPage;
