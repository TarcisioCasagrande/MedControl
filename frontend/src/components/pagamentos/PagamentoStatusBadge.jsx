import { CheckCircle2, Clock3, XCircle, RotateCcw } from 'lucide-react';

function PagamentoStatusBadge({ status }) {
  const statusNormalizado = status || 'Pendente';

  const estilos = {
    Pago: {
      classe: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle2,
    },
    Pendente: {
      classe: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Clock3,
    },
    Cancelado: {
      classe: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
    },
    Estornado: {
      classe: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: RotateCcw,
    },
  };

  const estilo = estilos[statusNormalizado] || estilos.Pendente;
  const Icon = estilo.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${estilo.classe}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {statusNormalizado}
    </span>
  );
}

export default PagamentoStatusBadge;