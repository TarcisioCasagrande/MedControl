import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  CalendarDays,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Bot,
  CreditCard,
  ChevronDown,
  Settings,
  Wallet,
  BrainCircuit,
  Clock3,
  LogOut,
  User,
  UserCog,
  CalendarClock,
  ClipboardList,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const gruposMenu = [
  {
    tipo: 'link',
    to: '/dashboard',
    label: 'Painel',
    icon: LayoutDashboard,
    perfis: ['Admin', 'Recepcionista', 'Medico'],
  },
  {
    tipo: 'link',
    to: '/agenda',
    label: 'Agenda',
    icon: CalendarDays,
    perfis: ['Admin', 'Recepcionista', 'Medico'],
  },
  {
    tipo: 'link',
    to: '/medico/atendimentos',
    label: 'Meus Atendimentos',
    icon: Activity,
    perfis: ['Medico'],
  },
  {
    tipo: 'dropdown',
    label: 'Administrativo',
    icon: Settings,
    perfis: ['Admin', 'Recepcionista', 'Medico'],
    itens: [
      { to: '/pacientes', label: 'Pacientes', icon: Users, perfis: ['Admin', 'Recepcionista', 'Medico'] },
      { to: '/medicos', label: 'Médicos', icon: Stethoscope, perfis: ['Admin', 'Recepcionista'] },
      { to: '/disponibilidade-medico', label: 'Disponibilidade', icon: CalendarClock, perfis: ['Admin', 'Medico'] },
      { to: '/procedimentos', label: 'Procedimentos', icon: ClipboardList, perfis: ['Admin', 'Recepcionista'] },
      { to: '/agendamentos', label: 'Agendamentos', icon: CalendarDays, perfis: ['Admin', 'Recepcionista', 'Medico'] },
      { to: '/prontuarios', label: 'Prontuários', icon: FileText, perfis: ['Admin', 'Medico'] },
      { to: '/usuarios', label: 'Usuários', icon: UserCog, perfis: ['Admin'] },
    ],
  },
  {
    tipo: 'dropdown',
    label: 'Financeiro',
    icon: Wallet,
    perfis: ['Admin', 'Recepcionista'],
    itens: [
      { to: '/pagamentos', label: 'Pagamentos', icon: CreditCard, perfis: ['Admin', 'Recepcionista'] },
    ],
  },
  {
    tipo: 'dropdown',
    label: 'Relatórios',
    icon: FileText,
    perfis: ['Admin', 'Recepcionista'],
    itens: [
      { to: '/relatorios/minutos', label: 'Minutos atendidos', icon: Clock3, perfis: ['Admin', 'Recepcionista'] },
      { to: '/relatorios/pagamentos', label: 'Relatório de pagamentos', icon: CreditCard, perfis: ['Admin', 'Recepcionista'] },
      { to: '/relatorios/agendamentos-usuario', label: 'Agendamentos por Usuário', icon: FileText, perfis: ['Admin', 'Recepcionista'] },
    ],
  },
  {
    tipo: 'dropdown',
    label: 'IA',
    icon: BrainCircuit,
    perfis: ['Admin', 'Medico'],
    itens: [
      { to: '/assistente-ia', label: 'Assistente IA', icon: Bot, perfis: ['Admin', 'Medico'] },
    ],
  },
];

function Sidebar() {
  const { usuario, logout } = useAuth();

  function podeVer(perfis) {
    if (!usuario) return false;
    return perfis.includes(usuario.perfil);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
            <HeartPulse className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-sm font-bold text-slate-900">ControlMed</h1>
            <p className="text-[11px] font-medium text-slate-500">Gestão Médica</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          {gruposMenu
            .filter((grupo) => podeVer(grupo.perfis))
            .map((grupo) =>
              grupo.tipo === 'link' ? (
                <MenuLink key={grupo.to} item={grupo} />
              ) : (
                <MenuDropdown key={grupo.label} grupo={grupo} podeVer={podeVer} />
              )
            )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <User className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">{usuario?.nome}</p>
              <p className="text-[11px] text-slate-500">{usuario?.perfil}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden">
        {gruposMenu
          .filter((grupo) => podeVer(grupo.perfis))
          .map((grupo) =>
            grupo.tipo === 'link' ? (
              <MenuLink key={grupo.to} item={grupo} compacto />
            ) : (
              <MenuDropdown key={grupo.label} grupo={grupo} podeVer={podeVer} compacto />
            )
          )}
      </div>
    </header>
  );
}

function MenuLink({ item, compacto = false }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
          isActive
            ? 'bg-slate-800 text-white shadow-sm'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
        } ${compacto ? 'text-xs' : ''}`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">{item.label}</span>
    </NavLink>
  );
}

function MenuDropdown({ grupo, podeVer, compacto = false }) {
  const location = useLocation();
  const [aberto, setAberto] = useState(false);

  const itensVisiveis = grupo.itens.filter((item) => podeVer(item.perfis));
  const Icon = grupo.icon;

  const algumAtivo = itensVisiveis.some((item) =>
    location.pathname.startsWith(item.to)
  );

  if (itensVisiveis.length === 0) return null;

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
    >
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        className={`flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
          algumAtivo
            ? 'bg-slate-800 text-white shadow-sm'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
        } ${compacto ? 'text-xs' : ''}`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{grupo.label}</span>
        <ChevronDown className={`h-4 w-4 transition ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="absolute left-0 top-11 z-50 min-w-[230px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {itensVisiveis.map((item) => (
            <MenuSubLink key={item.to} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuSubLink({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex h-10 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition ${
          isActive
            ? 'bg-sky-100 text-sky-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate whitespace-nowrap">{item.label}</span>
    </NavLink>
  );
}

export default Sidebar;