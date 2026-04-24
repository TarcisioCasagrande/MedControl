import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  CalendarDays,
  Trash2,
  Search,
  BadgeCheck,
  Clock3,
  Stethoscope,
} from 'lucide-react';
import {
  getConsultas,
  criarConsulta,
  atualizarConsulta,
  deletarConsulta,
} from '../../services/consultaService';
import { getMedicos } from '../../services/medicoService';
import { getPacientes } from '../../services/pacienteService';
import { useToast } from '../../hooks/useToast';
import ConsultaTable from './ConsultasTable';
import ConsultaFormModal from './ConsultasFormModal';
import ConsultaDeleteDialog from './ConsultasDeleteDialog';
import ConsultaViewModal from './ConsultaViewModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function ConsultasPage() {
  const [consultas, setConsultas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selecionados, setSelecionados] = useState([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [consultaEditando, setConsultaEditando] = useState(null);
  const [consultaDeletando, setConsultaDeletando] = useState(null);
  const [consultaVisualizando, setConsultaVisualizando] = useState(null);

  const toast = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [dadosConsultas, dadosMedicos, dadosPacientes] = await Promise.all([
        getConsultas(),
        getMedicos(),
        getPacientes(),
      ]);

      setConsultas(dadosConsultas || []);
      setMedicos(dadosMedicos || []);
      setPacientes(dadosPacientes || []);
    } catch (error) {
      toast.error('Não foi possível carregar as consultas.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setConsultaEditando(null);
    setIsFormModalOpen(true);
  };

  const handleVisualizar = (consulta) => {
    setConsultaVisualizando(consulta);
    setIsViewModalOpen(true);
  };

  const handleEditar = (consulta) => {
    setConsultaEditando(consulta);
    setIsFormModalOpen(true);
  };

  const handleSalvar = async (consulta) => {
    try {
      if (consultaEditando) {
        await atualizarConsulta(consulta);
        toast.success('Consulta atualizada com sucesso!');
      } else {
        await criarConsulta(consulta);
        toast.success('Consulta cadastrada com sucesso!');
      }

      setIsFormModalOpen(false);
      setConsultaEditando(null);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao salvar a consulta.';

      toast.error(mensagem);
      console.error(error);
    }
  };

  const handleConfirmarDelete = (consulta) => {
    setConsultaDeletando(consulta);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletar = async () => {
    try {
      await deletarConsulta(consultaDeletando.id);
      toast.success('Consulta removida com sucesso!');

      setIsDeleteDialogOpen(false);
      setConsultaDeletando(null);
      setSelecionados((prev) => prev.filter((id) => id !== consultaDeletando.id));

      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem || 'Erro ao deletar a consulta.';

      toast.error(mensagem);
      console.error(error);
    }
  };

  const handleAbrirBulkDeleteModal = () => {
    if (selecionados.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const handleExcluirSelecionados = async () => {
    if (selecionados.length === 0) return;

    try {
      setBulkDeleting(true);

      const consultasSelecionadas = consultas.filter((c) => selecionados.includes(c.id));

      const resultados = await Promise.allSettled(
        consultasSelecionadas.map(async (consulta) => {
          try {
            await deletarConsulta(consulta.id);
            return {
              sucesso: true,
              id: consulta.id,
            };
          } catch (error) {
            return {
              sucesso: false,
              id: consulta.id,
              mensagem:
                error?.response?.data?.mensagem || 'Erro ao excluir consulta.',
            };
          }
        })
      );

      const sucessos = resultados
        .filter((resultado) => resultado.status === 'fulfilled')
        .map((resultado) => resultado.value)
        .filter((item) => item.sucesso);

      const falhas = resultados
        .filter((resultado) => resultado.status === 'fulfilled')
        .map((resultado) => resultado.value)
        .filter((item) => !item.sucesso);

      if (sucessos.length > 0 && falhas.length === 0) {
        toast.success(
          `${sucessos.length} ${
            sucessos.length === 1
              ? 'consulta excluída com sucesso!'
              : 'consultas excluídas com sucesso!'
          }`
        );
      } else if (sucessos.length > 0 && falhas.length > 0) {
        toast.success(
          `${sucessos.length} ${
            sucessos.length === 1 ? 'consulta excluída' : 'consultas excluídas'
          }. ${falhas.length} ${
            falhas.length === 1 ? 'não pôde ser excluída.' : 'não puderam ser excluídas.'
          }`
        );
      } else if (falhas.length > 0) {
        toast.error(falhas[0].mensagem);
      }

      const idsComFalha = falhas.map((item) => item.id);
      setSelecionados(idsComFalha);

      setIsBulkDeleteModalOpen(false);
      await carregarDados();
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem ||
        'Erro ao excluir as consultas selecionadas.';

      toast.error(mensagem);
      console.error(error);
    } finally {
      setBulkDeleting(false);
    }
  };

  const consultasFiltradas = useMemo(() => {
    const termo = searchTerm.toLowerCase().trim();

    if (!termo) return consultas;

    return consultas.filter((consulta) => {
      return (
        String(consulta.id || '').includes(termo) ||
        (consulta.status || '').toLowerCase().includes(termo) ||
        (consulta.medico?.nome || '').toLowerCase().includes(termo) ||
        (consulta.paciente?.nome || '').toLowerCase().includes(termo) ||
        (consulta.observacoes || '').toLowerCase().includes(termo) ||
        formatarDataBusca(consulta.dataConsulta).includes(termo)
      );
    });
  }, [consultas, searchTerm]);

  const totalConsultas = consultas.length;
  const totalSelecionados = selecionados.length;

  const consultasHoje = consultas.filter((consulta) => {
    const hoje = new Date();
    const dataConsulta = new Date(consulta.dataConsulta);

    return (
      dataConsulta.getDate() === hoje.getDate() &&
      dataConsulta.getMonth() === hoje.getMonth() &&
      dataConsulta.getFullYear() === hoje.getFullYear()
    );
  }).length;

  const totalEmAndamento = consultas.filter((consulta) => {
    const status = (consulta.status || '').toLowerCase();
    return status.includes('andamento');
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">Consultas</h1>
            <p className="text-sm text-gray-500">
              Gerencie consultas, seleções em lote e novos agendamentos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarDados}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="Recarregar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {selecionados.length > 0 && (
            <button
              onClick={handleAbrirBulkDeleteModal}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir ({selecionados.length})
            </button>
          )}

          <button
            onClick={handleNovo}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Consulta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumoCard
          titulo="Total de Consultas"
          valor={totalConsultas}
          descricao="Consultas cadastradas"
          icon={CalendarDays}
          cor="blue"
        />
        <ResumoCard
          titulo="Filtradas"
          valor={consultasFiltradas.length}
          descricao="Resultado da busca atual"
          icon={Search}
          cor="amber"
        />
        <ResumoCard
          titulo="Hoje"
          valor={consultasHoje}
          descricao="Consultas do dia"
          icon={Clock3}
          cor="violet"
        />
        <ResumoCard
          titulo="Selecionadas"
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
              placeholder="Buscar por ID, paciente, médico, status ou data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              <span>
                {consultasFiltradas.length}{' '}
                {consultasFiltradas.length === 1 ? 'consulta encontrada' : 'consultas encontradas'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {totalEmAndamento > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
                  <Clock3 className="w-3.5 h-3.5" />
                  {totalEmAndamento} em andamento
                </span>
              )}

              {totalSelecionados > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {totalSelecionados} selecionada{totalSelecionados > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-500">Carregando consultas...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ConsultaTable
            consultas={consultasFiltradas}
            onVisualizar={handleVisualizar}
            onEditar={handleEditar}
            onDeletar={handleConfirmarDelete}
            selecionados={selecionados}
            setSelecionados={setSelecionados}
          />
        </div>
      )}

      <ConsultaFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setConsultaEditando(null);
        }}
        consultaEditando={consultaEditando}
        onSalvar={handleSalvar}
        medicos={medicos}
        pacientes={pacientes}
      />

      <ConsultaViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setConsultaVisualizando(null);
        }}
        consulta={consultaVisualizando}
      />

      <ConsultaDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setConsultaDeletando(null);
        }}
        onConfirm={handleDeletar}
        consulta={consultaDeletando}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => {
          if (bulkDeleting) return;
          setIsBulkDeleteModalOpen(false);
        }}
        onConfirm={handleExcluirSelecionados}
        title="Excluir consultas"
        message={`Você deseja excluir ${selecionados.length} ${
          selecionados.length === 1 ? 'consulta selecionada' : 'consultas selecionadas'
        }? Consultas com prontuário vinculado não poderão ser excluídas.`}
        confirmText="Excluir"
        loading={bulkDeleting}
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

function formatarDataBusca(data) {
  if (!data) return '';

  const d = new Date(data);

  const dataBr = d.toLocaleDateString('pt-BR');
  const horaBr = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dataBr} ${horaBr}`.toLowerCase();
}

export default ConsultasPage;