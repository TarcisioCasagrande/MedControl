import ConfirmDialog from '../ui/ConfirmDialog';

function ConsultaDeleteDialog({ isOpen, onClose, onConfirm, consulta }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Deletar Consulta"
      message={
        consulta
          ? `Tem certeza que deseja excluir a consulta do paciente "${consulta.paciente?.nome || ''}"? Esta ação não pode ser desfeita.`
          : ''
      }
    />
  );
}

export default ConsultaDeleteDialog;