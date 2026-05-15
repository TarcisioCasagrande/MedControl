import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Lock,
  Mail,
  HeartPulse,
  Eye,
  EyeOff,
  CalendarDays,
  FileText,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setCarregando(true);
      setErro('');

      await login(email, senha);
      navigate('/dashboard');
    } catch {
      setErro('E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-blue-700/40 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl md:grid-cols-[1fr_0.95fr]">
        <section className="relative hidden min-h-[540px] overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-blue-950 p-8 text-white md:flex md:flex-col">
          <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute bottom-[-100px] left-[-80px] h-60 w-60 rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  ControlMed
                </h1>
                <p className="text-xs text-sky-100">
                  Gestão Médica Inteligente
                </p>
              </div>
            </div>

            <div className="mx-auto mb-5 flex h-[170px] max-w-[260px] items-center justify-center overflow-hidden">
              <DotLottieReact
                src="https://lottie.host/5e755d25-646a-441f-a0e6-9ab3b92d472a/zJF6vYRYjU.lottie"
                loop
                autoplay
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sky-50">
              Plataforma completa para clínicas
            </p>

            <h2 className="max-w-md text-3xl font-black leading-tight">
              Controle sua clínica em um só lugar.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-sky-100">
              Gerencie pacientes, médicos, agenda, prontuários, relatórios e
              acessos com mais segurança e organização.
            </p>
          </div>

          <div className="relative z-10 mt-9 grid grid-cols-3 gap-3">
            <CardInfo icon={Users} titulo="Pacientes" texto="Cadastro completo" />
            <CardInfo icon={CalendarDays} titulo="Agenda" texto="Consultas" />
            <CardInfo icon={FileText} titulo="Prontuários" texto="Histórico clínico" />
          </div>
        </section>

        <section className="flex min-h-[540px] items-center justify-center bg-slate-50 px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-sm md:hidden">
                <HeartPulse className="h-8 w-8" />
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-sky-600">
                Bem-vindo
              </p>

              <h2 className="text-2xl font-black text-gray-900">
                Acesse sua conta
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Entre com seus dados para acessar o painel.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  E-mail
                </label>

                <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 shadow-sm transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-full w-full bg-transparent text-sm text-gray-800 outline-none"
                    placeholder="Digite seu e-mail"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Senha
                </label>

                <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 shadow-sm transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                  <Lock className="h-4 w-4 shrink-0 text-gray-400" />

                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="h-full w-full bg-transparent text-sm text-gray-800 outline-none"
                    placeholder="Digite sua senha"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha((valor) => !valor)}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {erro && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? 'Entrando...' : 'Entrar no sistema'}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-center">
              <p className="text-xs font-semibold text-sky-800">
                Acesso restrito aos usuários autorizados.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CardInfo({ icon: Icone, titulo, texto }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
      <Icone className="mb-2 h-5 w-5 text-sky-100" />
      <p className="text-sm font-bold text-white">{titulo}</p>
      <p className="mt-1 text-[11px] text-sky-100">{texto}</p>
    </div>
  );
}

export default LoginPage;