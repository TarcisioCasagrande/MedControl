import { useState, useEffect } from 'react';
import { User, Briefcase, MapPin } from 'lucide-react';
import Modal from '../ui/Modal';

function MedicoFormModal({ isOpen, onClose, medicoEditando, onSalvar }) {
  const [nome, setNome] = useState('');
  const [crm, setCrm] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [clinica, setClinica] = useState('');
  const [turnoAtendimento, setTurnoAtendimento] = useState('');
  const [valorConsulta, setValorConsulta] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (medicoEditando) {
      setNome(medicoEditando.nome || '');
      setCrm(medicoEditando.crm || '');
      setEspecialidade(medicoEditando.especialidade || '');
      setTelefone(medicoEditando.telefone || '');
      setEmail(medicoEditando.email || '');
      setClinica(medicoEditando.clinica || '');
      setTurnoAtendimento(medicoEditando.turnoAtendimento || '');
      setValorConsulta(
        medicoEditando.valorConsulta !== undefined && medicoEditando.valorConsulta !== null
          ? medicoEditando.valorConsulta
          : ''
      );
    } else {
      setNome('');
      setCrm('');
      setEspecialidade('');
      setTelefone('');
      setEmail('');
      setClinica('');
      setTurnoAtendimento('');
      setValorConsulta('');
    }
  }, [isOpen, medicoEditando]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const medico = {
      nome,
      crm,
      especialidade,
      telefone,
      email,
      clinica,
      turnoAtendimento,
      valorConsulta: valorConsulta === '' ? 0 : Number(valorConsulta),
    };

    if (medicoEditando) {
      medico.id = medicoEditando.id;
    }

    onSalvar(medico);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
    >
      <div className="mb-4">
        <div className="mb-1 text-[11px] text-gray-500">
          Dashboard <span className="mx-1">{'>'}</span>
          Médicos <span className="mx-1">{'>'}</span>
          <span className="font-semibold text-blue-600">
            {medicoEditando ? 'Editar Cadastro' : 'Novo Cadastro'}
          </span>
        </div>

        <h2 className="text-2xl font-semibold leading-tight text-gray-900">
          Cadastro de Médicos
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {medicoEditando
            ? 'Atualize os dados abaixo para editar o cadastro do médico.'
            : 'Preencha os dados abaixo para cadastrar um novo médico.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
            <h3 className="text-base font-semibold text-gray-800">
              {medicoEditando ? 'Editar Cadastro de Médico' : 'Novo Cadastro de Médico'}
            </h3>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
            <div className="space-y-6">
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-800">
                    1. Dados Pessoais
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Campo
                    label="Nome Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    placeholder="Ex: Dr. João Silva"
                  />

                  <Campo
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Ex: medico@email.com"
                  />

                  <Campo
                    label="Telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                    placeholder="Ex: (48) 99999-9999"
                  />
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-800">
                    2. Informações Profissionais
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Campo
                    label="CRM"
                    value={crm}
                    onChange={(e) => setCrm(e.target.value)}
                    required
                    placeholder="Ex: CRM-SC-12345"
                  />

                  <Campo
                    label="Especialidade"
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    required
                    placeholder="Ex: Cardiologia"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Turno de Atendimento
                    </label>
                    <select
                      value={turnoAtendimento}
                      onChange={(e) => setTurnoAtendimento(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Selecione</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>

                  <Campo
                    label="Valor da Consulta"
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorConsulta}
                    onChange={(e) => setValorConsulta(e.target.value)}
                    placeholder="Ex: 250.00"
                  />
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-800">
                    3. Local de Atendimento
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Campo
                    label="Nome da Clínica / Local"
                    value={clinica}
                    onChange={(e) => setClinica(e.target.value)}
                    placeholder="Ex: Clínica Vida Centro"
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
            >
              {medicoEditando ? 'Salvar Cadastro' : 'Cadastrar Médico'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function Campo({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...props}
      />
    </div>
  );
}

export default MedicoFormModal;