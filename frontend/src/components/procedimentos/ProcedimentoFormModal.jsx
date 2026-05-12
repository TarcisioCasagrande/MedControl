import { useEffect, useState } from 'react';
import { X, ClipboardList, Save } from 'lucide-react';

function ProcedimentoFormModal({
  isOpen,
  onClose,
  procedimentoEditando,
  onSalvar,
  procedimentos,
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
    if (procedimentoEditando) {
      setFormData({
        id: procedimentoEditando.id,
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
        procedimento.id !== formData.id
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
      id: formData.id,
      nome: formData.nome.trim(),
      codigo: formData.codigo.trim(),
      valor: Number(formData.valor),
      ativo: formData.ativo,
    };

    onSalvar(procedimento);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                {procedimentoEditando
                  ? 'Editar procedimento'
                  : 'Novo procedimento'}
              </h2>
              <p className="text-xs text-gray-500">
                Preencha os dados do procedimento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-700">
              Nome do procedimento
            </label>

            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Consulta médica"
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

            {erros.nome && (
              <p className="mt-1 text-xs font-medium text-red-600">{erros.nome}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">
                Código
              </label>

              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="Ex: CONS001"
                className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />

              {erros.codigo && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {erros.codigo}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">
                Valor
              </label>

              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0,00"
                className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />

              {erros.valor && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {erros.valor}
                </p>
              )}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Procedimento ativo
          </label>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700"
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

export default ProcedimentoFormModal;