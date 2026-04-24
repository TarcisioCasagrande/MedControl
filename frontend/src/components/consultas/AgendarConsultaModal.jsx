import { useEffect, useMemo, useState } from 'react';
import {
  CalendarPlus,
  User,
  CalendarDays,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Modal from '../ui/Modal';
import { getPacientes } from '../../services/pacienteService';
import { getConsultas } from '../../services/consultaService';

function AgendarConsultaModal({ isOpen, onClose, medico, onSalvar }) {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [dataConsulta, setDataConsulta] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [mostrarListaPacientes, setMostrarListaPacientes] = useState(false);

  const [erroConflitoMedico, setErroConflitoMedico] = useState('');
  const [erroConflitoPaciente, setErroConflitoPaciente] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    carregarDados();
    limparFormulario();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    validarConflitos();
  }, [dataConsulta, medico, pacienteSelecionado, consultas, isOpen]);

  const carregarDados = async () => {
    try {
      setCarregando(true);

      const [dadosPacientes, dadosConsultas] = await Promise.all([
        getPacientes(),
        getConsultas().catch(() => []),
      ]);

      setPacientes(dadosPacientes || []);
      setConsultas(dadosConsultas || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes e consultas:', error);
    } finally {
      setCarregando(false);
    }
  };

  const limparFormulario = () => {
    setBuscaPaciente('');
    setPacienteSelecionado(null);
    setDataConsulta('');
    setObservacoes('');
    setMostrarListaPacientes(false);
    setErroConflitoMedico('');
    setErroConflitoPaciente('');
  };

  const pacientesFiltrados = useMemo(() => {
    const termo = buscaPaciente.toLowerCase().trim();

    if (!termo) {
      return pacientes.slice(0, 8);
    }

    return pacientes
      .filter((paciente) => {
        return (
          (paciente.nome || '').toLowerCase().includes(termo) ||
          (paciente.cpf || '').toLowerCase().includes(termo) ||
          (paciente.telefone || '').toLowerCase().includes(termo)
        );
      })
      .slice(0, 8);
  }, [pacientes, buscaPaciente]);

  const selecionarPaciente = (paciente) => {
    setPacienteSelecionado(paciente);
    setBuscaPaciente(paciente.nome || '');
    setMostrarListaPacientes(false);
  };

  const normalizarDataHora = (valor) => {
    if (!valor) return '';

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
      return valor?.slice?.(0, 16) || '';
    }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');

    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
  };

  const validarConflitos = () => {
    if (!dataConsulta) {
      setErroConflitoMedico('');
      setErroConflitoPaciente('');
      return;
    }

    const dataHoraSelecionada = normalizarDataHora(dataConsulta);

    const conflitoMedico = consultas.some((consulta) => {
      const mesmoMedico = Number(consulta.medicoId) === Number(medico?.id);
      const mesmaDataHora =
        normalizarDataHora(consulta.dataConsulta) === dataHoraSelecionada;

      return mesmoMedico && mesmaDataHora;
    });

    const conflitoPaciente = consultas.some((consulta) => {
      const mesmoPaciente =
        Number(consulta.pacienteId) === Number(pacienteSelecionado?.id);
      const mesmaDataHora =
        normalizarDataHora(consulta.dataConsulta) === dataHoraSelecionada;

      return mesmoPaciente && mesmaDataHora;
    });

    if (conflitoMedico) {
      setErroConflitoMedico(
        'O médico já possui uma consulta nesse horário. Escolha outro horário disponível.'
      );
    } else {
      setErroConflitoMedico('');
    }

    if (pacienteSelecionado?.id && conflitoPaciente) {
      setErroConflitoPaciente(
        'O paciente já possui uma consulta agendada nesse mesmo horário.'
      );
    } else {
      setErroConflitoPaciente('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!pacienteSelecionado?.id) return;
    if (erroConflitoMedico || erroConflitoPaciente) return;

    const consulta = {
      medicoId: medico.id,
      pacienteId: pacienteSelecionado.id,
      dataConsulta,
      observacoes,
    };

    onSalvar(consulta);
  };

  if (!medico) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => {
      limparFormulario();
      onClose();
    }} title="Nova Consulta">
      <div className="max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <CalendarPlus className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Agendamento de Consulta
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Selecione o paciente e informe a data e o horário para registrar a nova consulta.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-800">
                Médico selecionado
              </h3>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">{medico.nome}</p>
              <p className="mt-1 text-xs text-gray-500">
                {medico.especialidade || 'Especialidade não informada'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-800">
                Dados da consulta
              </h3>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Paciente <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={buscaPaciente}
                    onChange={(e) => {
                      setBuscaPaciente(e.target.value);
                      setPacienteSelecionado(null);
                      setMostrarListaPacientes(true);
                    }}
                    onFocus={() => setMostrarListaPacientes(true)}
                    onBlur={() => setTimeout(() => setMostrarListaPacientes(false), 150)}
                    placeholder="Pesquise por nome, CPF ou telefone"
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {mostrarListaPacientes && (
                  <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    {carregando ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Carregando pacientes...
                      </div>
                    ) : pacientesFiltrados.length > 0 ? (
                      pacientesFiltrados.map((paciente) => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => selecionarPaciente(paciente)}
                          className="flex w-full flex-col items-start border-b border-gray-100 px-4 py-3 text-left transition hover:bg-blue-50 last:border-b-0"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {paciente.nome}
                          </span>
                          <span className="mt-1 text-xs text-gray-500">
                            {paciente.cpf ? `CPF: ${paciente.cpf}` : 'CPF não informado'}
                            {paciente.telefone ? ` • Tel: ${paciente.telefone}` : ''}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Nenhum paciente encontrado.
                      </div>
                    )}
                  </div>
                )}

                {pacienteSelecionado && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Paciente selecionado: {pacienteSelecionado.nome}
                      </p>
                      <p className="mt-1 text-xs text-green-700">
                        {pacienteSelecionado.cpf
                          ? `CPF: ${pacienteSelecionado.cpf}`
                          : 'CPF não informado'}
                        {pacienteSelecionado.telefone
                          ? ` • Tel: ${pacienteSelecionado.telefone}`
                          : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Data e horário <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={dataConsulta}
                  onChange={(e) => setDataConsulta(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {erroConflitoMedico && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Conflito de agenda do médico
                    </p>
                    <p className="mt-1 text-sm text-red-700">{erroConflitoMedico}</p>
                  </div>
                </div>
              )}

              {erroConflitoPaciente && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Conflito de agenda do paciente
                    </p>
                    <p className="mt-1 text-sm text-amber-700">{erroConflitoPaciente}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                  placeholder="Informações adicionais sobre a consulta"
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                limparFormulario();
                onClose();
              }}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                !pacienteSelecionado ||
                !dataConsulta ||
                !!erroConflitoMedico ||
                !!erroConflitoPaciente
              }
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default AgendarConsultaModal;