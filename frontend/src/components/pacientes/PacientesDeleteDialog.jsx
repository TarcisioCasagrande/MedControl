import ConfirmDialog from '../ui/ConfirmDialog';

function PacienteDeleteDialog({ isOpen, onClose, onConfirm, paciente }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Deletar Paciente"
      message={
        paciente
          ? `Tem certeza que deseja excluir o paciente "${paciente.nome}"? Esta ação não pode ser desfeita.`
          : ''
      }
    />
  );
}

export default PacienteDeleteDialog;