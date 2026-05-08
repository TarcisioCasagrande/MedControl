import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  FileText,
  Stethoscope,
  DollarSign,
  ClipboardList,
  CheckCircle,
  Users,
  CalendarDays,
  BadgeInfo,
  Sparkles,
  Search,
  RefreshCw,
  ShieldCheck,
  MessageCircle,
  CornerDownLeft,
  X,
  UserRound,
  Check,
} from 'lucide-react';
import { getPacientes } from '../../services/pacienteService';

function AssistenteIaPage() {
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [pacientes, setPacientes] = useState([]);
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [carregandoPacientes, setCarregandoPacientes] = useState(false);

  const mensagensRef = useRef(null);

  useEffect(() => {
    carregarPacientes();
  }, []);

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [mensagens, loading]);

  const pacientesFiltrados = useMemo(() => {
    const termo = buscaPaciente.trim().toLowerCase();

    if (!termo) {
      return pacientes.slice(0, 8);
    }

    return pacientes
      .filter((paciente) => {
        const texto = `${paciente.nome || ''} ${paciente.cpf || ''} ${
          paciente.CPF || ''
        } ${paciente.telefone || ''} ${paciente.email || ''}`.toLowerCase();

        return texto.includes(termo);
      })
      .slice(0, 10);
  }, [pacientes, buscaPaciente]);

  async function carregarPacientes() {
    try {
      setCarregandoPacientes(true);
      const dados = await getPacientes();
      setPacientes(dados || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setCarregandoPacientes(false);
    }
  }

  function selecionarPaciente(paciente) {
    setPacienteSelecionado(paciente);
    setBuscaPaciente(paciente?.nome || '');

    if (!input.trim()) {
      setInput(`Resumo do paciente ${paciente?.nome || ''}`.trim());
    }
  }

  function removerPacienteSelecionado() {
    setPacienteSelecionado(null);
    setBuscaPaciente('');
  }

  const enviarMensagem = async (perguntaManual = null, pacienteIdManual = null) => {
    const pergunta = (perguntaManual ?? input).trim();
    const pacienteId = pacienteIdManual ?? pacienteSelecionado?.id ?? null;

    if ((!pergunta && !pacienteId) || loading) return;

    const textoUsuario = pacienteSelecionado
      ? `${pergunta || 'Gerar resumo do paciente'}\n\nPaciente selecionado: ${
          pacienteSelecionado.nome
        }`
      : pergunta;

    if (!perguntaManual) {
      setMensagens((prev) => [
        ...prev,
        { tipo: 'usuario', texto: textoUsuario },
      ]);
      setInput('');
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5179/api/AssistenteIa', {
        pergunta: pergunta || `Resumo do paciente ${pacienteSelecionado?.nome || ''}`,
        pacienteId,
      });

      const data = response.data;

      if (data.tipo === 'multiplo') {
        setMensagens((prev) => [
          ...prev,
          {
            tipo: 'ia-multiplo',
            texto: data.mensagem,
            pacientes: data.pacientes || [],
            perguntaOriginal: pergunta,
          },
        ]);
      } else if (data.tipo === 'resumo') {
        setMensagens((prev) => [
          ...prev,
          {
            tipo: 'ia',
            texto: data.resposta,
          },
        ]);
      } else {
        setMensagens((prev) => [
          ...prev,
          {
            tipo: 'ia',
            texto: `## Atenção\n${data.mensagem || 'Não foi possível concluir a consulta.'}`,
          },
        ]);
      }
    } catch (error) {
      setMensagens((prev) => [
        ...prev,
        {
          tipo: 'ia',
          texto: '## Erro\nNão foi possível consultar a IA no momento. Verifique se o backend está rodando corretamente.',
        },
      ]);
      console.error('Erro ao consultar IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const selecionarPacienteDuplicado = async (pacienteId, perguntaOriginal) => {
    await enviarMensagem(perguntaOriginal, pacienteId);
  };

  const usarSugestao = (sugestao) => {
    setInput(sugestao);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const limparConversa = () => {
    if (loading) return;
    setMensagens([]);
    setInput('');
  };

  const sugestoes = [
    'Gerar resumo clínico completo',
    'Quais foram as últimos agendamentos?',
    'Resumo financeiro do paciente',
    'Quais procedimentos já foram realizados?',
  ];

  return (
    <div className="flex h-[calc(100vh-44px)] gap-3 overflow-hidden bg-gray-100 p-4">
      <aside className="hidden w-[300px] shrink-0 flex-col gap-3 overflow-hidden lg:flex">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100">
              <Bot className="h-5 w-5 text-sky-700" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900">Assistente IA</h1>
              <p className="text-xs text-gray-500">
                Resumos inteligentes de pacientes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={limparConversa}
            disabled={loading || mensagens.length === 0}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 text-xs font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Nova conversa
          </button>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <UserRound className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-semibold text-gray-800">
              Selecionar paciente
            </h2>
          </div>

          {pacienteSelecionado ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-sky-900">
                    {pacienteSelecionado.nome}
                  </p>
                  <p className="mt-1 text-xs text-sky-700">
                    CPF: {pacienteSelecionado.cpf || pacienteSelecionado.CPF || 'Não informado'}
                  </p>
                  <p className="text-xs text-sky-700">
                    Tel: {pacienteSelecionado.telefone || 'Não informado'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removerPacienteSelecionado}
                  className="rounded-lg p-1 text-sky-700 transition hover:bg-white/70"
                  title="Remover paciente selecionado"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={buscaPaciente}
                  onChange={(e) => setBuscaPaciente(e.target.value)}
                  placeholder="Buscar por nome, CPF..."
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="mt-3 max-h-[260px] space-y-2 overflow-y-auto pr-1">
                {carregandoPacientes ? (
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                    Carregando pacientes...
                  </div>
                ) : pacientesFiltrados.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                    Nenhum paciente encontrado.
                  </div>
                ) : (
                  pacientesFiltrados.map((paciente) => (
                    <button
                      key={paciente.id}
                      type="button"
                      onClick={() => selecionarPaciente(paciente)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-sky-300 hover:bg-sky-50"
                    >
                      <p className="truncate text-xs font-bold text-gray-900">
                        {paciente.nome}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        CPF: {paciente.cpf || paciente.CPF || 'Não informado'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-semibold text-gray-800">
              Perguntas rápidas
            </h2>
          </div>

          <div className="space-y-2">
            {sugestoes.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => usarSugestao(sugestao)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sugestao}
              </button>
            ))}
          </div>
        </section>

        <section className="min-h-0 flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-semibold text-gray-800">
              Boas práticas
            </h2>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="rounded-lg bg-gray-50 p-3">
              Primeiro selecione o paciente para evitar informações ambíguas.
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              Depois escolha uma pergunta rápida ou escreva uma solicitação.
            </div>
            <div className="rounded-lg bg-sky-50 p-3 text-sky-800">
              A IA ajuda na análise, mas a decisão clínica continua sendo do profissional.
            </div>
          </div>
        </section>
      </aside>

      <main className="min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100">
              <MessageCircle className="h-5 w-5 text-sky-700" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-900">
                Chat do Assistente IA
              </h2>
              <p className="truncate text-xs text-gray-500">
                Selecione um paciente e peça um resumo, histórico ou análise.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 sm:flex">
            <Bot className="h-4 w-4" />
            IA clínica
          </div>
        </header>

        <div className="flex h-[calc(100%-65px)] flex-col overflow-hidden bg-gray-50">
          <div
            ref={mensagensRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4"
          >
            {mensagens.length === 0 && (
              <TelaInicial
                sugestoes={sugestoes}
                loading={loading}
                pacienteSelecionado={pacienteSelecionado}
                onUsarSugestao={usarSugestao}
              />
            )}

            {mensagens.map((msg, index) => (
              <MensagemChat
                key={`${msg.tipo}-${index}`}
                msg={msg}
                selecionarPaciente={selecionarPacienteDuplicado}
              />
            ))}

            {loading && <MensagemCarregando />}
          </div>

          <footer className="border-t border-gray-200 bg-white p-4">
            {pacienteSelecionado && (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-sky-900">
                      Paciente selecionado: {pacienteSelecionado.nome}
                    </p>
                    <p className="truncate text-[11px] text-sky-700">
                      CPF: {pacienteSelecionado.cpf || pacienteSelecionado.CPF || 'Não informado'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removerPacienteSelecionado}
                  className="rounded-lg p-1.5 text-sky-700 transition hover:bg-white/70"
                  title="Trocar paciente"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />

                <textarea
                  placeholder={
                    pacienteSelecionado
                      ? 'Digite o que deseja saber sobre o paciente selecionado...'
                      : 'Selecione um paciente na lateral ou digite nome/CPF...'
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  className="max-h-28 min-h-[48px] w-full resize-none rounded-xl border border-gray-300 bg-white px-10 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />

                <div className="pointer-events-none absolute bottom-2 right-3 hidden items-center gap-1 text-[11px] text-gray-400 sm:flex">
                  <CornerDownLeft className="h-3.5 w-3.5" />
                  Enter para enviar
                </div>
              </div>

              <button
                type="button"
                onClick={() => enviarMensagem()}
                disabled={loading || (!input.trim() && !pacienteSelecionado)}
                className="flex h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

function TelaInicial({ sugestoes, loading, pacienteSelecionado, onUsarSugestao }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100">
        <Bot className="h-8 w-8 text-sky-600" />
      </div>

      <h3 className="text-lg font-bold text-gray-900">
        {pacienteSelecionado
          ? `Paciente selecionado: ${pacienteSelecionado.nome}`
          : 'Selecione um paciente para começar'}
      </h3>

      <p className="mt-2 max-w-xl text-sm text-gray-500">
        {pacienteSelecionado
          ? 'Agora escolha uma pergunta rápida ou escreva o que deseja analisar.'
          : 'Escolha um paciente na barra lateral. Depois, selecione uma pergunta rápida ou escreva sua solicitação.'}
      </p>

      <div className="mt-5 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {sugestoes.map((sugestao) => (
          <button
            key={sugestao}
            type="button"
            onClick={() => onUsarSugestao(sugestao)}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-xs font-semibold text-gray-600 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sugestao}
          </button>
        ))}
      </div>
    </div>
  );
}

function MensagemChat({ msg, selecionarPaciente }) {
  const ehUsuario = msg.tipo === 'usuario';

  return (
    <div className={`flex ${ehUsuario ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex max-w-[92%] items-start gap-3 ${
          ehUsuario ? 'flex-row-reverse' : ''
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            ehUsuario
              ? 'bg-sky-600 text-white'
              : 'border border-gray-200 bg-white text-gray-700 shadow-sm'
          }`}
        >
          {ehUsuario ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>

        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
            ehUsuario
              ? 'bg-sky-600 text-white'
              : 'border border-gray-200 bg-white text-gray-800'
          }`}
        >
          {ehUsuario ? (
            <p className="whitespace-pre-line">{msg.texto}</p>
          ) : msg.tipo === 'ia-multiplo' ? (
            <MensagemMultipla msg={msg} selecionarPaciente={selecionarPaciente} />
          ) : (
            <MensagemMarkdown texto={msg.texto} />
          )}
        </div>
      </div>
    </div>
  );
}

function MensagemMultipla({ msg, selecionarPaciente }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <BadgeInfo className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="font-semibold text-gray-900">
            Mais de um paciente encontrado
          </p>
          <p className="text-sm text-gray-600">{msg.texto}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {msg.pacientes.map((paciente) => (
          <button
            key={paciente.id}
            type="button"
            onClick={() => selecionarPaciente(paciente.id, msg.perguntaOriginal)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-sky-300 hover:bg-sky-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {paciente.nome}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {paciente.cpfMascarado}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {paciente.dataNascimento}
                  </span>
                </div>
              </div>

              <span className="shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white">
                Selecionar
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MensagemMarkdown({ texto }) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:my-3 prose-li:my-1 prose-p:my-2 prose-ul:my-2">
      <ReactMarkdown
        components={{
          h2: ({ children }) => {
            const text = String(children).toLowerCase();

            let Icon = FileText;

            if (text.includes('resumo')) Icon = ClipboardList;
            if (text.includes('médico')) Icon = Stethoscope;
            if (text.includes('total')) Icon = DollarSign;
            if (text.includes('conclusão')) Icon = CheckCircle;

            return (
              <h2 className="mb-2 mt-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                <Icon className="h-4 w-4 text-sky-600" />
                {children}
              </h2>
            );
          },

          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),

          p: ({ children }) => (
            <p className="mb-2 text-sm leading-relaxed text-gray-700">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="mb-2 space-y-1">{children}</ul>
          ),

          li: ({ children }) => (
            <li className="ml-5 list-disc text-sm text-gray-700">
              {children}
            </li>
          ),
        }}
      >
        {texto}
      </ReactMarkdown>
    </div>
  );
}

function MensagemCarregando() {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
          <Bot className="h-4 w-4 text-gray-700" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500" />
            A IA está analisando as informações do paciente...
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssistenteIaPage;
