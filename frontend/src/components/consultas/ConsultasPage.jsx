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

  async function carregarDados() {
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
  }

  function handleNovo() {
    setConsultaEditando(null);
    setIsFormModalOpen(true);
  }

  function handleVisualizar(consulta) {
    setConsultaVisualizando(consulta);
    setIsViewModalOpen(true);
  }

  function handleEditar(consulta) {
    setConsultaEditando(consulta);
    setIsFormModalOpen(true);
  }

  async function handleSalvar(consulta) {
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
  }

  function handleConfirmarDelete(consulta) {
    setConsultaDeletando(consulta);
    setIsDeleteDialogOpen(true);
  }

  async function handleDeletar() {
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
  }

  function handleAbrirBulkDeleteModal() {
    if (selecionados.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  }

  async function handleExcluirSelecionados() {
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
  }

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
    <div className="h-[calc(100vh-44px)] overflow-hidden bg-gray-100 p-4">
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-3">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Consultas</h1>
              <p className="text-xs text-gray-500">
                Gerencie consultas, agenda e seleções em lote
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={carregarDados}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              title="Recarregar lista"
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
              Nova Consulta
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <ResumoCard
            titulo="Consultas"
            valor={totalConsultas}
            descricao="Cadastradas"
            icon={CalendarDays}
            cor="blue"
          />

          <ResumoCard
            titulo="Filtradas"
            valor={consultasFiltradas.length}
            descricao="Resultado atual"
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
                placeholder="Buscar por ID, paciente, médico, status ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
              <Stethoscope className="mr-2 h-4 w-4 text-blue-500" />

              {consultasFiltradas.length}{' '}
              {consultasFiltradas.length === 1
                ? 'consulta encontrada'
                : 'consultas encontradas'}

              {totalEmAndamento > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-1 text-[11px] font-medium text-cyan-700">
                  <Clock3 className="h-3 w-3" />
                  {totalEmAndamento} em andamento
                </span>
              )}

              {totalSelecionados > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-700">
                  <BadgeCheck className="h-3 w-3" />
                  {totalSelecionados} selecionada{totalSelecionados > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-3 text-sm text-gray-500">Carregando consultas...</span>
            </div>
          ) : (
            <div className="h-full overflow-auto">
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
        </div>
      </div>

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