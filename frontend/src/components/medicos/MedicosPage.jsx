import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  User,
  Trash2,
  Search,
  BadgeCheck,
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

  async function carregarMedicos() {
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
  }

  function handleNovo() {
    setMedicoEditando(null);
    setIsFormModalOpen(true);
  }

  function handleVisualizar(medico) {
    setMedicoVisualizando(medico);
    setIsViewModalOpen(true);
  }

  function handleEditar(medico) {
    setMedicoEditando(medico);
    setIsFormModalOpen(true);
  }

  async function handleSalvar(medico) {
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
  }

  function handleConfirmarDelete(medico) {
    setMedicoDeletando(medico);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeletar() {
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
  }

  function handleAbrirBulkDeleteModal() {
    if (selecionados.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  }

  async function handleExcluirSelecionados() {
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
  }

  function handleAbrirAgendamento(medico) {
    setMedicoSelecionadoAgendamento(medico);
    setIsAgendarModalOpen(true);
  }

  async function handleSalvarAgendamento(consulta) {
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
  }

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
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Médicos</h1>
              <p className="text-xs text-gray-500">
                Gerencie médicos, especialidades e agendamentos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={carregarMedicos}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            {selecionados.length > 0 && (
              <button
                onClick={handleAbrirBulkDeleteModal}
                className="flex h-9 items-center gap-2 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Excluir ({selecionados.length})
              </button>
            )}

            <button
              onClick={handleNovo}
              className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Novo Médico
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <ResumoCard
            titulo="Médicos"
            valor={totalMedicos}
            descricao="Cadastrados"
            icon={Users}
            cor="blue"
          />

          <ResumoCard
            titulo="Filtrados"
            valor={medicosFiltrados.length}
            descricao="Resultado atual"
            icon={Search}
            cor="amber"
          />

          <ResumoCard
            titulo="Especialidades"
            valor={totalEspecialidades}
            descricao="Áreas"
            icon={Stethoscope}
            cor="violet"
          />

          <ResumoCard
            titulo="Selecionados"
            valor={totalSelecionados}
            descricao="Em lote"
            icon={BadgeCheck}
            cor="green"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Buscar por ID, nome, CRM, especialidade, e-mail ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
              {medicosFiltrados.length}{' '}
              {medicosFiltrados.length === 1
                ? 'médico encontrado'
                : 'médicos encontrados'}

              {totalSelecionados > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-700">
                  <BadgeCheck className="h-3 w-3" />
                  {totalSelecionados} selecionado{totalSelecionados > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-3 text-sm text-gray-500">Carregando médicos...</span>
            </div>
          ) : (
            <div className="h-full overflow-auto">
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
        </div>
      </div>

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
    <div className={`rounded-lg border px-3 py-2 shadow-sm ${estilo.box}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-xl font-bold leading-none ${estilo.value}`}>
              {valor}
            </h3>

            <p className="truncate text-xs font-semibold text-gray-700">
              {titulo}
            </p>
          </div>

          <p className="mt-1 truncate text-[11px] leading-none text-gray-500">
            {descricao}
          </p>
        </div>

        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${estilo.icon}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default MedicosPage;