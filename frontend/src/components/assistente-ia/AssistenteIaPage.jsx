import { useState } from 'react';
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
} from 'lucide-react';

function AssistenteIaPage() {
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const enviarMensagem = async (perguntaManual = null, pacienteId = null) => {
    const pergunta = (perguntaManual ?? input).trim();

    if ((!pergunta && !pacienteId) || loading) return;

    if (!perguntaManual) {
      setMensagens((prev) => [
        ...prev,
        { tipo: 'usuario', texto: pergunta },
      ]);
      setInput('');
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5179/api/AssistenteIa', {
        pergunta,
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

  const selecionarPaciente = async (pacienteId, perguntaOriginal) => {
    await enviarMensagem(perguntaOriginal, pacienteId);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">Assistente IA</h1>
          <p className="text-sm text-gray-500">
            Consulte pacientes por nome completo ou CPF e obtenha um resumo inteligente.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-y-auto space-y-4">
        {mensagens.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
              <Bot className="w-7 h-7 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Digite o nome completo ou CPF do paciente para começar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Exemplo: “Resumo do paciente Maria Souza” ou “CPF 11122233344”
            </p>
          </div>
        )}

        {mensagens.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start gap-3 max-w-[90%] ${
                msg.tipo === 'usuario' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  msg.tipo === 'usuario'
                    ? 'bg-blue-600'
                    : 'bg-gray-100 border border-gray-200'
                }`}
              >
                {msg.tipo === 'usuario' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-700" />
                )}
              </div>

              <div
                className={`rounded-xl p-4 text-sm leading-relaxed ${
                  msg.tipo === 'usuario'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 shadow-sm text-gray-800'
                }`}
              >
                {msg.tipo === 'usuario' ? (
                  <p className="whitespace-pre-line">{msg.texto}</p>
                ) : msg.tipo === 'ia-multiplo' ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <BadgeInfo className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Mais de um paciente encontrado</p>
                        <p className="text-sm text-gray-600">{msg.texto}</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {msg.pacientes.map((paciente) => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => selecionarPaciente(paciente.id, msg.perguntaOriginal)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{paciente.nome}</p>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {paciente.cpfMascarado}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  {paciente.dataNascimento}
                                </span>
                              </div>
                            </div>

                            <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
                              Selecionar
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-headings:my-3">
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
                            <h2 className="flex items-center gap-2 text-base font-semibold mt-4 mb-2 text-gray-900">
                              <Icon className="w-4 h-4 text-blue-600" />
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
                          <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                            {children}
                          </p>
                        ),

                        ul: ({ children }) => (
                          <ul className="mb-2 space-y-1">
                            {children}
                          </ul>
                        ),

                        li: ({ children }) => (
                          <li className="ml-5 list-disc text-sm text-gray-700">
                            {children}
                          </li>
                        ),
                      }}
                    >
                      {msg.texto}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gray-100 border border-gray-200">
                <Bot className="w-4 h-4 text-gray-700" />
              </div>

              <div className="rounded-xl p-4 text-sm bg-white border border-gray-200 shadow-sm text-gray-500">
                A IA está analisando as informações do paciente...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <textarea
          placeholder="Digite o nome completo ou CPF do paciente..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <button
          onClick={() => enviarMensagem()}
          disabled={loading || !input.trim()}
          className="px-4 py-3 rounded-xl bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          Enviar
        </button>
      </div>
    </div>
  );
}

export default AssistenteIaPage;