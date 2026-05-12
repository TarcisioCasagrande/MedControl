// src/components/medicos/MedicoDeleteDialog.jsx

import ConfirmDialog from '../ui/ConfirmDialog';

function MedicoDeleteDialog({ isOpen, onClose, onConfirm, medico }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Excluir Médico"
      message={
        medico
          ? `Tem certeza que deseja excluir o médico "${medico.nome}"? 
          
Caso existam agendamentos vinculados, a exclusão não será permitida.`
          : ''
      }
    />
  );
}

export default MedicoDeleteDialog;