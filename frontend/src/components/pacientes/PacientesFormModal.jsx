import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import {
  User,
  HeartPulse,
  Phone,
} from 'lucide-react';

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
      setTelefoneContatoEmergencia(
        pacienteEditando.telefoneContatoEmergencia || ''
      );
    } else {
      limparCampos();
    }
  }, [isOpen, pacienteEditando]);

  function limparCampos() {
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

  function handleSubmit(e) {
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
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="flex h-[82vh] flex-col overflow-hidden">
        <div className="mb-2 shrink-0">
          <div className="mb-0.5 text-[10px] text-gray-500">
            Dashboard &gt; Pacientes &gt;{' '}
            <span className="font-semibold text-blue-600">
              {pacienteEditando ? 'Editar' : 'Novo'}
            </span>
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Cadastro de Paciente
          </h2>

          <p className="text-[11px] text-gray-500">
            {pacienteEditando
              ? 'Atualize as informações do paciente.'
              : 'Preencha os dados para cadastrar.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <Section icon={User} title="Dados pessoais">
                <div className="grid grid-cols-2 gap-1.3">
                  <Campo
                    label="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />

                  <Campo
                    label="CPF"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                  />

                  <Campo
                    label="Telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                  />

                  <Campo
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Campo
                    label="Nascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                  />

                  <Select
                    label="Sexo"
                    value={sexo}
                    onChange={setSexo}
                    options={[
                      'Feminino',
                      'Masculino',
                      'Outro',
                      'Prefiro não informar',
                    ]}
                  />

                  <div className="col-span-2">
                    <Campo
                      label="Endereço"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                    />
                  </div>
                </div>
              </Section>

              <Section icon={HeartPulse} title="Informações médicas">
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    label="Tipo sanguíneo"
                    value={tipoSanguineo}
                    onChange={setTipoSanguineo}
                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                  />

                  <Campo
                    label="Alergias"
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                  />

                  <Campo
                    label="Doenças"
                    value={doencasPreExistentes}
                    onChange={(e) => setDoencasPreExistentes(e.target.value)}
                  />
                </div>
              </Section>

              <Section icon={Phone} title="Contato de emergência">
                <div className="grid grid-cols-2 gap-2">
                  <Campo
                    label="Nome"
                    value={nomeContatoEmergencia}
                    onChange={(e) => setNomeContatoEmergencia(e.target.value)}
                  />

                  <Campo
                    label="Telefone"
                    value={telefoneContatoEmergencia}
                    onChange={(e) =>
                      setTelefoneContatoEmergencia(e.target.value)
                    }
                  />
                </div>
              </Section>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-gray-300 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-400"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-md bg-green-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-green-700"
              >
                {pacienteEditando ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="mb-0.3 first:mb-2">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      </div>

      {children}
    </section>
  );
}

function Campo({ label, type = 'text', value, onChange, required = false }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-gray-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-gray-300 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Selecione</option>
        {options.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PacienteFormModal;