import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Eye,
  EyeOff,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@controlmed.com');
  const [senha, setSenha] = useState('123456');
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.25),transparent_40%)]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[560px] overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-blue-950 p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute right-[-70px] top-[-70px] h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute bottom-[-90px] left-[-70px] h-56 w-56 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <HeartPulse className="h-7 w-7 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  ControlMed
                </h1>
                <p className="text-sm text-sky-100">Gestão Médica</p>
              </div>
            </div>

            <div className="max-w-md">
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sky-50">
                Sistema seguro para clínicas
              </p>

              <h2 className="text-4xl font-black leading-tight">
                Organize sua clínica com mais controle e agilidade.
              </h2>

              <p className="mt-4 text-sm leading-6 text-sky-100">
                Acompanhe pacientes, médicos, agendamentos, prontuários e
                relatórios em um painel moderno e centralizado.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            <CardInfo icon={ShieldCheck} titulo="Seguro" texto="Acesso protegido" />
            <CardInfo icon={Stethoscope} titulo="Clínico" texto="Fluxos médicos" />
            <CardInfo icon={Activity} titulo="Gestão" texto="Dados em tempo real" />
          </div>
        </section>

        <section className="flex min-h-[560px] items-center justify-center bg-slate-50 px-6 py-10 sm:px-10">
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
                Entre com seus dados para continuar no ControlMed.
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
                    className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
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
                    className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    placeholder="Digite sua senha"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha((valor) => !valor)}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-sky-600"
                  />
                  Lembrar-me
                </label>

                <button
                  type="button"
                  className="font-semibold text-sky-700 transition hover:text-sky-800 hover:underline"
                >
                  Esqueceu a senha?
                </button>
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
                Acesso restrito aos usuários autorizados do ControlMed.
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
