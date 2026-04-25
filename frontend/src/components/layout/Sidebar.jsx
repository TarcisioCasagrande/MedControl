import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

const gruposMenu = [
  { tipo: 'link', to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { tipo: 'link', to: '/agenda', label: 'Agenda', icon: CalendarDays },
  {
    tipo: 'dropdown',
    label: 'Administrativo',
    icon: Settings,
    itens: [
      { to: '/medicos', label: 'Médicos', icon: Stethoscope },
      { to: '/pacientes', label: 'Pacientes', icon: Users },
      { to: '/consultas', label: 'Consultas', icon: CalendarDays },
      { to: '/prontuarios', label: 'Prontuários', icon: FileText },
    ],
  },
  {
    tipo: 'dropdown',
    label: 'Financeiro',
    icon: Wallet,
    itens: [{ to: '/pagamentos', label: 'Pagamentos', icon: CreditCard }],
  },
  {
    tipo: 'dropdown',
    label: 'IA',
    icon: BrainCircuit,
    itens: [{ to: '/assistente-ia', label: 'Assistente IA', icon: Bot }],
  },
];

function Sidebar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-700 bg-sky-600 text-white shadow-sm">
      <div className="flex h-11 items-center px-4">
        <div className="mr-6 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-white/15">
            <HeartPulse className="h-4 w-4 text-white" />
          </div>

          <div className="leading-none">
            <h1 className="text-sm font-bold leading-4">ControlMed</h1>
            <p className="text-[10px] leading-3 text-sky-100">Gestão Médica</p>
          </div>
        </div>

        <nav className="flex h-full items-center gap-1 overflow-visible">
          {gruposMenu.map((item) =>
            item.tipo === 'link' ? (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex h-8 items-center gap-1.5 rounded px-3 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-sky-800 text-white'
                      : 'text-sky-50 hover:bg-sky-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <DropdownMenu key={item.label} grupo={item} />
            )
          )}
        </nav>
      </div>
    </header>
  );
}

function DropdownMenu({ grupo }) {
  return (
    <div className="group relative flex h-8 items-center">
      <button
        type="button"
        className="flex h-8 items-center gap-1.5 rounded px-3 text-xs font-semibold text-sky-50 transition-colors hover:bg-sky-700 hover:text-white"
      >
        <grupo.icon className="h-3.5 w-3.5" />
        <span>{grupo.label}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      <div className="invisible absolute left-0 top-9 min-w-48 rounded-md border border-gray-200 bg-white p-1.5 text-gray-700 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
        {grupo.itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;