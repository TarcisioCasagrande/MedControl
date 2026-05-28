// src/components/agenda/AgendaResumoCards.jsx
function AgendaResumoCards({
  medicoFiltro,
  agendamentosExibidosMedico,
  agendamentosDoDiaTodosMedicos,
  agendamentos,
  medicosVisiveis,
  disponibilidades,
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
      <ResumoTopo
        label={medicoFiltro ? 'Agendamentos exibidos' : 'Agendamentos no dia'}
        valor={medicoFiltro ? agendamentosExibidosMedico.length : agendamentosDoDiaTodosMedicos.length}
      />
      <ResumoTopo label="Total geral" valor={agendamentos.length} />
      <ResumoTopo label="Médicos visíveis" valor={medicosVisiveis.length} />
      <ResumoTopo label="Disponibilidades" valor={disponibilidades.length} />
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

export default AgendaResumoCards;