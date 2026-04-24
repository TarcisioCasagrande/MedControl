import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  User,
  Trash2,
  Search,
  BadgeCheck,
  CalendarDays,
  Stethoscope,
  Users,
} from 'lucide-react';
import {
  getMedicos,
  criarMedico,
  atualizarMedico,
  deletarMedico,
} from '../../services/medicoService';
import { criarConsulta } from '../../services/consultaService';
import { useToast } from '../../hooks/useToast';

import MedicoTable from './MedicosTable';
import MedicoFormModal from './MedicosFormModal';
import MedicoDeleteDialog from './MedicosDeleteDialog';
import MedicoViewModal from './MedicoViewModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import AgendarConsultaModal from '../consultas/AgendarConsultaModal';

function MedicosPage() {
  const [medicos, setMedicos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selecionados, setSelecionados] = useState([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAgendarModalOpen, setIsAgendarModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [medicoEditando, setMedicoEditando] = useState(null);
  const [medicoDeletando, setMedicoDeletando] = useState(null);
  const [medicoSelecionadoAgendamento, setMedicoSelecionadoAgendamento] = useState(null);
  const [medicoVisualizando, setMedicoVisualizando] = useState(null);

  const toast = useToast();

  useEffect(() => {
    carregarMedicos();
  }, []);

  const carregarMedicos = async () => {
    try {
      setLoading(true);
      const dados = await getMedicos();
      setMedicos(dados || []);
    } catch (error) {
      toast.error('Não foi possível carregar os médicos.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setMedicoEditando(null);
    setIsFormModalOpen(true);
  };

  const handleVisualizar = (medico) => {
    setMedicoVisualizando(medico);
    setIsViewModalOpen(true);
  };

  const handleEditar = (medico) => {
    setMedicoEditando(medico);
    setIsFormModalOpen(true);
  };

  const handleSalvar = async (medico) => {
    try {
      if (medicoEditando) {
        await atualizarMedico(medico);
        toast.success(`Médico "${medico.nome}" atualizado com sucesso!`);
      } else {
        await criarMedico(medico);
        toast.success(`Médico "${medico.nome}" cadastrado com sucesso!`);
      }

      setIsFormModalOpen(false);
      setMedicoEditando(null);
      await carregarMedicos();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar o médico.';

      toast.error(mensagem);
      console.error(error);
    }
  };

  const handleConfirmarDelete = (medico) => {
    setMedicoDeletando(medico);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletar = async () => {
    try {
      await deletarMedico(medicoDeletando.id);

      toast.success(`Médico "${medicoDeletando.nome}" removido com sucesso!`);
      setIsDeleteDialogOpen(false);
      setMedicoDeletando(null);
      setSelecionados((prev) => prev.filter((id) => id !== medicoDeletando.id));

      await carregarMedicos();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao deletar o médico.';

      toast.error(mensagem);
      console.error(error);
    }
  };

  const handleAbrirBulkDeleteModal = () => {
    if (selecionados.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const handleExcluirSelecionados = async () => {
    try {
      setBulkDeleting(true);

      await Promise.all(selecionados.map((id) => deletarMedico(id)));

      toast.success(
        `${selecionados.length} ${
          selecionados.length === 1
            ? 'médico excluído com sucesso!'
            : 'médicos excluídos com sucesso!'
        }`
      );

      setSelecionados([]);
      setIsBulkDeleteModalOpen(false);
      await carregarMedicos();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem ||
        'Erro ao excluir os médicos selecionados.';

      toast.error(mensagem);
      console.error(error);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleAbrirAgendamento = (medico) => {
    setMedicoSelecionadoAgendamento(medico);
    setIsAgendarModalOpen(true);
  };

  const handleSalvarAgendamento = async (consulta) => {
    try {
      await criarConsulta(consulta);

      toast.success('Consulta agendada com sucesso!');
      setIsAgendarModalOpen(false);
      setMedicoSelecionadoAgendamento(null);
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao agendar consulta.';

      toast.error(mensagem);
      console.error(error);
    }
  };

  const medicosFiltrados = useMemo(() => {
    const termo = searchTerm.toLowerCase().trim();

    if (!termo) return medicos;

    return medicos.filter((medico) => {
      return (
        String(medico.id || '').includes(termo) ||
        (medico.nome || '').toLowerCase().includes(termo) ||
        (medico.crm || '').toLowerCase().includes(termo) ||
        (medico.especialidade || '').toLowerCase().includes(termo) ||
        (medico.email || '').toLowerCase().includes(termo) ||
        (medico.telefone || '').toLowerCase().includes(termo)
      );
    });
  }, [medicos, searchTerm]);

  const totalMedicos = medicos.length;
  const totalSelecionados = selecionados.length;
  const totalEspecialidades = new Set(
    medicos.map((m) => (m.especialidade || '').trim()).filter(Boolean)
  ).size;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">Médicos</h1>
            <p className="text-sm text-gray-500">
              Gerencie médicos, seleções em lote e novos agendamentos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarMedicos}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {selecionados.length > 0 && (
            <button
              onClick={handleAbrirBulkDeleteModal}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir ({selecionados.length})
            </button>
          )}

          <button
            onClick={handleNovo}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Médico
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumoCard
          titulo="Total de Médicos"
          valor={totalMedicos}
          descricao="Profissionais cadastrados"
          icon={Users}
          cor="blue"
        />
        <ResumoCard
          titulo="Filtrados"
          valor={medicosFiltrados.length}
          descricao="Resultado da busca atual"
          icon={Search}
          cor="amber"
        />
        <ResumoCard
          titulo="Especialidades"
          valor={totalEspecialidades}
          descricao="Especialidades encontradas"
          icon={Stethoscope}
          cor="violet"
        />
        <ResumoCard
          titulo="Selecionados"
          valor={totalSelecionados}
          descricao="Itens marcados em lote"
          icon={BadgeCheck}
          cor="green"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, nome, CRM, especialidade, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              <span>
                {medicosFiltrados.length}{' '}
                {medicosFiltrados.length === 1 ? 'médico encontrado' : 'médicos encontrados'}
              </span>
            </div>

            {totalSelecionados > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                <BadgeCheck className="w-3.5 h-3.5" />
                {totalSelecionados} selecionado{totalSelecionados > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-500">Carregando médicos...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <MedicoTable
            medicos={medicosFiltrados}
            onVisualizar={handleVisualizar}
            onEditar={handleEditar}
            onDeletar={handleConfirmarDelete}
            onAgendar={handleAbrirAgendamento}
            selecionados={selecionados}
            setSelecionados={setSelecionados}
          />
        </div>
      )}

      <MedicoFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setMedicoEditando(null);
        }}
        medicoEditando={medicoEditando}
        onSalvar={handleSalvar}
      />

      <MedicoViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setMedicoVisualizando(null);
        }}
        medico={medicoVisualizando}
      />

      <MedicoDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setMedicoDeletando(null);
        }}
        onConfirm={handleDeletar}
        medico={medicoDeletando}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => {
          if (bulkDeleting) return;
          setIsBulkDeleteModalOpen(false);
        }}
        onConfirm={handleExcluirSelecionados}
        title="Excluir médicos"
        message={`Você deseja excluir ${selecionados.length} ${
          selecionados.length === 1 ? 'médico selecionado' : 'médicos selecionados'
        }?`}
        confirmText="Excluir"
        loading={bulkDeleting}
      />

      <AgendarConsultaModal
        isOpen={isAgendarModalOpen}
        onClose={() => {
          setIsAgendarModalOpen(false);
          setMedicoSelecionadoAgendamento(null);
        }}
        medico={medicoSelecionadoAgendamento}
        onSalvar={handleSalvarAgendamento}
      />
    </div>
  );
}

function ResumoCard({ titulo, valor, descricao, icon: Icon, cor }) {
  const cores = {
    blue: {
      box: 'bg-blue-50 border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      value: 'text-blue-900',
    },
    amber: {
      box: 'bg-amber-50 border-amber-200',
      icon: 'bg-amber-100 text-amber-600',
      value: 'text-amber-900',
    },
    green: {
      box: 'bg-green-50 border-green-200',
      icon: 'bg-green-100 text-green-600',
      value: 'text-green-900',
    },
    violet: {
      box: 'bg-violet-50 border-violet-200',
      icon: 'bg-violet-100 text-violet-600',
      value: 'text-violet-900',
    },
  };

  const estilo = cores[cor] || cores.blue;

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${estilo.box}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">{titulo}</p>
          <h3 className={`mt-2 text-2xl font-bold ${estilo.value}`}>{valor}</h3>
          <p className="mt-1 text-xs text-gray-500">{descricao}</p>
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${estilo.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default MedicosPage;