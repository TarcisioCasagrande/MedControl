import { useState, useEffect } from 'react';
import {
  X,
  User,
  HeartPulse,
  Phone,
  MapPin,
  Save,
  CalendarDays,
  Mail,
  IdCard,
  AlertTriangle,
  CheckCircle2,
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

  const [aviso, setAviso] = useState({
    aberto: false,
    titulo: '',
    mensagem: '',
    tipo: 'erro',
  });

  useEffect(() => {
    if (!isOpen) return;

    if (pacienteEditando) {
      setNome(pacienteEditando.nome || '');
      setCpf(formatarCpf(pacienteEditando.cpf || pacienteEditando.CPF || ''));
      setTelefone(formatarTelefone(pacienteEditando.telefone || ''));
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
        formatarTelefone(pacienteEditando.telefoneContatoEmergencia || '')
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
    setAviso({
      aberto: false,
      titulo: '',
      mensagem: '',
      tipo: 'erro',
    });
  }

  function abrirAviso(titulo, mensagem, tipo = 'erro') {
    setAviso({
      aberto: true,
      titulo,
      mensagem,
      tipo,
    });
  }

  function fecharAviso() {
    setAviso({
      aberto: false,
      titulo: '',
      mensagem: '',
      tipo: 'erro',
    });
  }

  function handleCpfChange(e) {
    setCpf(formatarCpf(e.target.value));
  }

  function handleTelefoneChange(e) {
    setTelefone(formatarTelefone(e.target.value));
  }

  function handleTelefoneEmergenciaChange(e) {
    setTelefoneContatoEmergencia(formatarTelefone(e.target.value));
  }

  function handleEmailChange(e) {
    setEmail(e.target.value.trim().toLowerCase());
  }

  function validarFormulario() {
    const cpfNumeros = somenteNumeros(cpf);
    const telefoneNumeros = somenteNumeros(telefone);
    const telefoneEmergenciaNumeros = somenteNumeros(telefoneContatoEmergencia);

    if (!nome.trim()) {
      abrirAviso('Campo obrigatório', 'Informe o nome do paciente.');
      return false;
    }

    if (cpfNumeros.length !== 11) {
      abrirAviso('CPF inválido', 'Informe o CPF completo no formato 000.000.000-00.');
      return false;
    }

    if (!validarCpf(cpfNumeros)) {
      abrirAviso('CPF inválido', 'O CPF informado não é válido.');
      return false;
    }

    if (telefoneNumeros.length !== 10 && telefoneNumeros.length !== 11) {
      abrirAviso('Telefone inválido', 'Informe o telefone no formato (00) 00000-0000.');
      return false;
    }

    if (!validarEmail(email)) {
      abrirAviso('E-mail inválido', 'Informe um e-mail válido, como nome@email.com.');
      return false;
    }

    if (!dataNascimento) {
      abrirAviso('Campo obrigatório', 'Informe a data de nascimento.');
      return false;
    }

    if (!validarDataNascimento(dataNascimento)) {
      abrirAviso(
        'Data inválida',
        'A data de nascimento não pode ser futura e precisa ser uma data válida.'
      );
      return false;
    }

    if (
      telefoneContatoEmergencia.trim() &&
      telefoneEmergenciaNumeros.length !== 10 &&
      telefoneEmergenciaNumeros.length !== 11
    ) {
      abrirAviso(
        'Telefone de emergência inválido',
        'Informe o telefone do contato no formato (00) 00000-0000.'
      );
      return false;
    }

    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validarFormulario()) return;

    const paciente = {
      nome: nome.trim(),
      cpf: formatarCpf(cpf),
      telefone: formatarTelefone(telefone),
      email: email.trim().toLowerCase(),
      endereco: endereco.trim(),
      dataNascimento,
      sexo,
      tipoSanguineo,
      alergias: alergias.trim(),
      doencasPreExistentes: doencasPreExistentes.trim(),
      nomeContatoEmergencia: nomeContatoEmergencia.trim(),
      telefoneContatoEmergencia: telefoneContatoEmergencia.trim()
        ? formatarTelefone(telefoneContatoEmergencia)
        : '',
    };

    if (pacienteEditando) {
      paciente.id = pacienteEditando.id;
    }

    onSalvar(paciente);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-sky-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <User className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                {pacienteEditando ? 'Editar paciente' : 'Cadastro de paciente'}
              </h2>
              <p className="text-xs text-sky-100">
                {pacienteEditando
                  ? 'Atualize os dados do paciente no sistema.'
                  : 'Preencha os dados para cadastrar um novo paciente.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Dados pessoais
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Campo
                    label="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    icon={User}
                    placeholder="Nome completo"
                    maxLength={150}
                  />

                  <Campo
                    label="CPF"
                    value={cpf}
                    onChange={handleCpfChange}
                    required
                    icon={IdCard}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    inputMode="numeric"
                  />

                  <Campo
                    label="Telefone"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    required
                    icon={Phone}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    inputMode="numeric"
                  />

                  <Campo
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    icon={Mail}
                    placeholder="paciente@email.com"
                    maxLength={150}
                  />

                  <Campo
                    label="Data de nascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                    icon={CalendarDays}
                    max={formatarDataInput(new Date())}
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

                  <div className="md:col-span-2">
                    <Campo
                      label="Endereço"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      icon={MapPin}
                      placeholder="Rua, número, bairro, cidade"
                      maxLength={200}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Informações médicas
                  </h3>
                </div>

                <div className="space-y-3">
                  <Select
                    label="Tipo sanguíneo"
                    value={tipoSanguineo}
                    onChange={setTipoSanguineo}
                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                  />

                  <Textarea
                    label="Alergias"
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                    placeholder="Informe alergias conhecidas"
                    maxLength={500}
                  />

                  <Textarea
                    label="Doenças pré-existentes"
                    value={doencasPreExistentes}
                    onChange={(e) => setDoencasPreExistentes(e.target.value)}
                    placeholder="Informe condições importantes"
                    maxLength={500}
                  />
                </div>
              </section>
            </div>

            <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Contato de emergência
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Campo
                  label="Nome do contato"
                  value={nomeContatoEmergencia}
                  onChange={(e) => setNomeContatoEmergencia(e.target.value)}
                  icon={User}
                  placeholder="Nome da pessoa de contato"
                  maxLength={150}
                />

                <Campo
                  label="Telefone do contato"
                  value={telefoneContatoEmergencia}
                  onChange={handleTelefoneEmergenciaChange}
                  icon={Phone}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  inputMode="numeric"
                />
              </div>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-xs font-bold text-white transition hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              {pacienteEditando ? 'Salvar alterações' : 'Cadastrar paciente'}
            </button>
          </div>
        </form>
      </div>

      <AvisoModal aviso={aviso} onClose={fecharAviso} />
    </div>
  );
}

function Campo({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  icon: Icon,
  placeholder = '',
  maxLength,
  inputMode,
  max,
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          max={max}
          className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
            Icon ? 'pl-9' : ''
          }`}
        />
      </div>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder = '', maxLength }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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

function AvisoModal({ aviso, onClose }) {
  if (!aviso.aberto) return null;

  const ehSucesso = aviso.tipo === 'sucesso';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                ehSucesso ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}
            >
              {ehSucesso ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                {aviso.titulo}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {aviso.mensagem}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg bg-sky-600 px-4 text-xs font-bold text-white transition hover:bg-sky-700"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

function somenteNumeros(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function formatarCpf(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/^(\(\d{2}\) \d{4})(\d)/, '$1-$2');
  }

  return numeros
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/^(\(\d{2}\) \d{5})(\d)/, '$1-$2');
}

function validarEmail(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor || '').trim());
}

function validarDataNascimento(valor) {
  if (!valor) return false;

  const data = new Date(`${valor}T00:00:00`);
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  return !Number.isNaN(data.getTime()) && data <= hoje;
}

function validarCpf(cpf) {
  const numeros = somenteNumeros(cpf);

  if (numeros.length !== 11) return false;
  if (/^(\d)\1+$/.test(numeros)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i += 1) {
    soma += parseInt(numeros.charAt(i), 10) * (10 - i);
  }

  let resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;
  if (resto !== parseInt(numeros.charAt(9), 10)) return false;

  soma = 0;

  for (let i = 0; i < 10; i += 1) {
    soma += parseInt(numeros.charAt(i), 10) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  return resto === parseInt(numeros.charAt(10), 10);
}

function formatarDataInput(data) {
  const d = new Date(data);

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

export default PacienteFormModal;