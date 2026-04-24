import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { User, HeartPulse, Phone } from 'lucide-react';

function PacienteFormModal({ isOpen, onClose, pacienteEditando, onSalvar }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [tipoSanguineo, setTipoSanguineo] = useState('');
  const [alergias, setAlergias] = useState('');
  const [doencasPreExistentes, setDoencasPreExistentes] = useState('');
  const [nomeContatoEmergencia, setNomeContatoEmergencia] = useState('');
  const [telefoneContatoEmergencia, setTelefoneContatoEmergencia] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (pacienteEditando) {
      setNome(pacienteEditando.nome || '');
      setCpf(pacienteEditando.cpf || '');
      setTelefone(pacienteEditando.telefone || '');
      setEmail(pacienteEditando.email || '');
      setEndereco(pacienteEditando.endereco || '');
      setDataNascimento(
        pacienteEditando.dataNascimento
          ? pacienteEditando.dataNascimento.split('T')[0]
          : ''
      );
      setSexo(pacienteEditando.sexo || '');
      setTipoSanguineo(pacienteEditando.tipoSanguineo || '');
      setAlergias(pacienteEditando.alergias || '');
      setDoencasPreExistentes(pacienteEditando.doencasPreExistentes || '');
      setNomeContatoEmergencia(pacienteEditando.nomeContatoEmergencia || '');
      setTelefoneContatoEmergencia(pacienteEditando.telefoneContatoEmergencia || '');
    } else {
      setNome('');
      setCpf('');
      setTelefone('');
      setEmail('');
      setEndereco('');
      setDataNascimento('');
      setSexo('');
      setTipoSanguineo('');
      setAlergias('');
      setDoencasPreExistentes('');
      setNomeContatoEmergencia('');
      setTelefoneContatoEmergencia('');
    }
  }, [isOpen, pacienteEditando]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const paciente = {
      nome,
      cpf,
      telefone,
      email,
      endereco,
      dataNascimento,
      sexo,
      tipoSanguineo,
      alergias,
      doencasPreExistentes,
      nomeContatoEmergencia,
      telefoneContatoEmergencia,
    };

    if (pacienteEditando) {
      paciente.id = pacienteEditando.id;
    }

    onSalvar(paciente);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="h-full flex flex-col">
        <div className="mb-2">
          <div className="text-[10px] text-gray-500 mb-0.5">
            Dashboard <span className="mx-1">{'>'}</span> Pacientes <span className="mx-1">{'>'}</span>
            <span className="font-semibold text-blue-600">
              {pacienteEditando ? 'Editar Cadastro' : 'Novo Cadastro'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 leading-tight">
            Cadastro de Pacientes
          </h2>

          <p className="text-[11px] text-gray-500 mt-0.5">
            {pacienteEditando
              ? 'Atualize as informações do paciente.'
              : 'Preencha os dados abaixo para cadastrar um novo paciente.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                {pacienteEditando ? 'Editar Cadastro de Paciente' : 'Novo Cadastro de Paciente'}
              </h3>
            </div>

            <div className="p-3 space-y-3 flex-1 min-h-0 overflow-y-auto">
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                    1. Dados Pessoais
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  <Campo
                    label="Nome Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    placeholder="Ex: Maria Souza"
                  />

                  <Campo
                    label="CPF"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                    placeholder="Ex: 12345678900"
                  />

                  <Campo
                    label="Telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                    placeholder="Ex: (48) 99999-9999"
                  />

                  <Campo
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Ex: paciente@email.com"
                  />

                  <Campo
                    label="Data de Nascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
                      Sexo
                    </label>
                    <select
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value)}
                      className="w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                      <option value="Prefiro não informar">Prefiro não informar</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <Campo
                      label="Endereço"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Ex: Rua das Flores, 123"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-2">
                  <HeartPulse className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                    2. Informações Médicas
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
                      Tipo Sanguíneo
                    </label>
                    <select
                      value={tipoSanguineo}
                      onChange={(e) => setTipoSanguineo(e.target.value)}
                      className="w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <Campo
                    label="Alergias"
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                    placeholder="Ex: Penicilina, poeira..."
                  />

                  <Campo
                    label="Doenças Pré-existentes"
                    value={doencasPreExistentes}
                    onChange={(e) => setDoencasPreExistentes(e.target.value)}
                    placeholder="Ex: Diabetes, hipertensão..."
                  />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800">
                    3. Contato de Emergência
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Campo
                    label="Nome do Contato"
                    value={nomeContatoEmergencia}
                    onChange={(e) => setNomeContatoEmergencia(e.target.value)}
                    placeholder="Ex: João Souza"
                  />

                  <Campo
                    label="Telefone do Contato"
                    value={telefoneContatoEmergencia}
                    onChange={(e) => setTelefoneContatoEmergencia(e.target.value)}
                    placeholder="Ex: (48) 99999-9999"
                  />
                </div>
              </section>
            </div>

            <div className="px-3 py-2.5 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 shrink-0 sticky bottom-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                {pacienteEditando ? 'Salvar Cadastro' : 'Cadastrar Paciente'}
              </button>
            </div>
          </div>
        </form>
      </div>
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
      <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full h-9 border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        {...props}
      />
    </div>
  );
}

export default PacienteFormModal;