import { useEffect, useState } from 'react';
import { X, ClipboardList, Save, DollarSign, Hash, ToggleRight } from 'lucide-react';

function ProcedimentoFormModal({
  isOpen,
  onClose,
  procedimentoEditando,
  onSalvar,
  procedimentos = [],
}) {
  const [formData, setFormData] = useState({
    id: 0,
    nome: '',
    codigo: '',
    valor: '',
    ativo: true,
  });

  const [erros, setErros] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (procedimentoEditando) {
      setFormData({
        id: procedimentoEditando.id || 0,
        nome: procedimentoEditando.nome || '',
        codigo: procedimentoEditando.codigo || '',
        valor: procedimentoEditando.valor ?? '',
        ativo: procedimentoEditando.ativo ?? true,
      });
    } else {
      setFormData({
        id: 0,
        nome: '',
        codigo: '',
        valor: '',
        ativo: true,
      });
    }

    setErros({});
  }, [procedimentoEditando, isOpen]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErros((prev) => ({
      ...prev,
      [name]: '',
    }));
  }

  function validarFormulario() {
    const novosErros = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Informe o nome do procedimento.';
    }

    if (!formData.codigo.trim()) {
      novosErros.codigo = 'Informe o código do procedimento.';
    }

    if (formData.valor === '' || Number(formData.valor) < 0) {
      novosErros.valor = 'Informe um valor válido.';
    }

    const codigoJaExiste = procedimentos.some(
      (procedimento) =>
        procedimento.codigo?.toLowerCase().trim() ===
          formData.codigo.toLowerCase().trim() &&
        Number(procedimento.id) !== Number(formData.id)
    );

    if (codigoJaExiste) {
      novosErros.codigo = 'Já existe um procedimento com este código.';
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validarFormulario()) return;

    const procedimento = {
      id: Number(formData.id || 0),
      nome: formData.nome.trim(),
      codigo: formData.codigo.trim(),
      valor: Number(formData.valor),
      ativo: formData.ativo,
    };

    onSalvar(procedimento);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-sky-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black">
                {procedimentoEditando ? 'Editar procedimento' : 'Novo procedimento'}
              </h2>
              <p className="text-xs text-sky-100">
                Preencha os dados do procedimento
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
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-sky-600" />
                <h3 className="text-sm font-black text-gray-900">
                  Informações do procedimento
                </h3>
              </div>

              <div className="space-y-4">
                <CampoTexto
                  label="Nome do procedimento"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Consulta médica"
                  erro={erros.nome}
                  icon={ClipboardList}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CampoTexto
                    label="Código"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    placeholder="Ex: CONS001"
                    erro={erros.codigo}
                    icon={Hash}
                  />

                  <CampoTexto
                    label="Valor"
                    type="number"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    placeholder="0,00"
                    erro={erros.valor}
                    icon={DollarSign}
                    min="0"
                    step="0.01"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">
                  <span className="flex items-center gap-2">
                    <ToggleRight className="h-5 w-5 text-sky-600" />
                    Procedimento ativo
                  </span>

                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                </label>
              </div>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-gray-300 px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white transition hover:bg-sky-700"
            >
              <Save className="h-4 w-4" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampoTexto({
  label,
  name,
  value,
  onChange,
  placeholder,
  erro,
  icon: Icon,
  type = 'text',
  min,
  step,
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          step={step}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${
            Icon ? 'pl-10' : ''
          } ${erro ? 'border-red-300' : 'border-gray-300'}`}
        />
      </div>

      {erro && <p className="mt-1 text-xs font-bold text-red-600">{erro}</p>}
    </div>
  );
}

export default ProcedimentoFormModal;