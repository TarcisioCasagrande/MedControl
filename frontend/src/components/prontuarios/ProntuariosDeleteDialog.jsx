import ConfirmDialog from '../ui/ConfirmDialog';

function ProntuarioDeleteDialog({ isOpen, onClose, onConfirm, prontuario }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Deletar Prontuário"
      message={
        prontuario
          ? `Deseja realmente excluir este prontuário? Esta ação não pode ser desfeita.`
          : ''
      }
    />
  );
}

export default ProntuarioDeleteDialog;