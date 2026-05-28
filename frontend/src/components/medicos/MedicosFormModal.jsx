import { useState, useEffect } from 'react';
import {
  X,
  User,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Save,
  Stethoscope,
  Clock3,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

function MedicoFormModal({ isOpen, onClose, medicoEditando, onSalvar }) {
  const [nome, setNome] = useState('');
  const [crm, setCrm] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [clinica, setClinica] = useState('');
  const [turnoAtendimento, setTurnoAtendimento] = useState('');

  const [aviso, setAviso] = useState({
    aberto: false,
    titulo: '',
    mensagem: '',
    tipo: 'erro',
  });

  useEffect(() => {
    if (!isOpen) return;

    if (medicoEditando) {
      setNome(medicoEditando.nome || '');
      setCrm(formatarCRM(medicoEditando.crm || ''));
      setEspecialidade(medicoEditando.especialidade || '');
      setTelefone(formatarTelefone(medicoEditando.telefone || ''));
      setEmail(medicoEditando.email || '');
      setClinica(medicoEditando.clinica || '');
      setTurnoAtendimento(medicoEditando.turnoAtendimento || '');
    } else {
      limparCampos();
    }
  }, [isOpen, medicoEditando]);

  function limparCampos() {
    setNome('');
    setCrm('');
    setEspecialidade('');
    setTelefone('');
    setEmail('');
    setClinica('');
    setTurnoAtendimento('');
    setAviso({ aberto: false, titulo: '', mensagem: '', tipo: 'erro' });
  }

  function abrirAviso(titulo, mensagem, tipo = 'erro') {
    setAviso({ aberto: true, titulo, mensagem, tipo });
  }

  function fecharAviso() {
    setAviso({ aberto: false, titulo: '', mensagem: '', tipo: 'erro' });
  }

  function handleTelefoneChange(e) {
    setTelefone(formatarTelefone(e.target.value));
  }

  function handleCrmChange(e) {
    setCrm(formatarCRM(e.target.value));
  }

  function handleEmailChange(e) {
    setEmail(e.target.value.trim().toLowerCase());
  }

  function validarFormulario() {
    const telefoneNumeros = somenteNumeros(telefone);

    if (!nome.trim()) {
      abrirAviso('Campo obrigatório', 'Informe o nome do médico.');
      return false;
    }

    if (!emailValido(email)) {
      abrirAviso('E-mail inválido', 'Informe um e-mail válido, como medico@email.com.');
      return false;
    }

    if (telefoneNumeros.length !== 10 && telefoneNumeros.length !== 11) {
      abrirAviso('Telefone inválido', 'Informe o telefone no formato (00) 00000-0000.');
      return false;
    }

    if (!crmValido(crm)) {
      abrirAviso('CRM inválido', 'Informe o CRM no formato 123456-SC.');
      return false;
    }

    if (!especialidade.trim()) {
      abrirAviso('Campo obrigatório', 'Informe a especialidade do médico.');
      return false;
    }

    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validarFormulario()) return;

    const medico = {
      nome: nome.trim(),
      crm: crm.trim().toUpperCase(),
      especialidade: especialidade.trim(),
      telefone: formatarTelefone(telefone),
      email: email.trim().toLowerCase(),
      clinica: clinica.trim(),
      turnoAtendimento,
    };

    if (medicoEditando) {
      medico.id = medicoEditando.id;
      medico.ativo = medicoEditando.ativo ?? true;
    }

    onSalvar(medico);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-sky-600 px-4 py-2.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <Stethoscope className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold">
                {medicoEditando ? 'Editar médico' : 'Cadastro de médico'}
              </h2>
              <p className="text-[10px] text-sky-100">
                {medicoEditando
                  ? 'Atualize os dados do médico no sistema.'
                  : 'Preencha os dados para cadastrar um novo médico.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-3">
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_220px]">
              <section className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm lg:col-span-2">
                <div className="mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-sky-600" />
                  <h3 className="text-xs font-bold text-gray-900">
                    Dados pessoais
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Campo
                    label="Nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    icon={User}
                    placeholder="Ex: Dr. João Silva"
                    maxLength={150}
                  />

                  <Campo
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    icon={Mail}
                    placeholder="medico@email.com"
                    maxLength={150}
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
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-sky-600" />
                  <h3 className="text-xs font-bold text-gray-900">
                    Jornada
                  </h3>
                </div>

                <Select
                  label="Turno de atendimento"
                  value={turnoAtendimento}
                  onChange={setTurnoAtendimento}
                  options={['Manhã', 'Tarde', 'Noite', 'Integral']}
                />
              </section>
            </div>

            <section className="mt-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-sky-600" />
                <h3 className="text-xs font-bold text-gray-900">
                  Informações profissionais
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Campo
                  label="CRM"
                  value={crm}
                  onChange={handleCrmChange}
                  required
                  icon={Briefcase}
                  placeholder="Ex: 123456-SC"
                  maxLength={9}
                  inputMode="text"
                />

                <Campo
                  label="Especialidade"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  required
                  icon={Stethoscope}
                  placeholder="Ex: Cardiologia"
                  maxLength={100}
                />
              </div>
            </section>

            <section className="mt-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-600" />
                <h3 className="text-xs font-bold text-gray-900">
                  Local de atendimento
                </h3>
              </div>

              <Campo
                label="Nome da clínica / local"
                value={clinica}
                onChange={(e) => setClinica(e.target.value)}
                icon={MapPin}
                placeholder="Ex: Clínica Vida Centro"
                maxLength={150}
              />
            </section>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 py-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-xs font-bold text-white transition hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              {medicoEditando ? 'Salvar alterações' : 'Cadastrar médico'}
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
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
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
          className={`h-8 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
            Icon ? 'pl-9' : ''
          }`}
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
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

function formatarCRM(valor) {
  const texto = String(valor || '').toUpperCase().replace(/[^0-9A-Z]/g, '');

  const numeros = texto.replace(/\D/g, '').slice(0, 6);
  const letras = texto.replace(/[^A-Z]/g, '').slice(0, 2);

  if (letras.length > 0) {
    return `${numeros}-${letras}`;
  }

  return numeros;
}

function crmValido(valor) {
  return /^\d{1,6}-[A-Z]{2}$/.test(String(valor || '').trim().toUpperCase());
}

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor || '').trim());
}

export default MedicoFormModal;