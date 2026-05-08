import ConfirmDialog from '../ui/ConfirmDialog';

function AgendamentoDeleteDialog({ isOpen, onClose, onConfirm, agendamento }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Deletar Agendamento"
      message={
        agendamento
          ? `Tem certeza que deseja excluir o agendamento do paciente "${agendamento.paciente?.nome || ''}"? Esta ação não pode ser desfeita.`
          : ''
      }
    />
  );
}

export default AgendamentoDeleteDialog;
