import ConfirmDialog from '../ui/ConfirmDialog';

function AgendamentoDeleteDialog({ isOpen, onClose, onConfirm, agendamento }) {
  if (!isOpen || !agendamento) {
    return null;
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Deletar Agendamento"
      message={`Tem certeza que deseja excluir o agendamento do paciente "${
        agendamento.paciente?.nome || ''
      }"? Esta ação não pode ser desfeita.`}
      confirmText="Confirmar"
    />
  );
}

export default AgendamentoDeleteDialog;