import { useEffect, useMemo, useState } from 'react';
import {
  UserCog,
  Plus,
  Pencil,
  Trash2,
  Power,
  Search,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Users,
  UserCheck,
} from 'lucide-react';

import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  alterarStatusUsuario,
  excluirUsuario,
} from '../../services/usuariosService';

import { getMedicos } from '../../services/medicoService';

const perfis = [
  { valor: 1, label: 'Admin' },
  { valor: 2, label: 'Recepcionista' },
  { valor: 3, label: 'Medico' },
];

const usuarioInicial = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  perfil: 2,
  ativo: true,
  medicoId: '',
};

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(usuarioInicial);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [aviso, setAviso] = useState({
    aberto: false,
    titulo: '',
    mensagem: '',
    tipo: 'aviso',
  });

  const [confirmacao, setConfirmacao] = useState({
    aberto: false,
    titulo: '',
    mensagem: '',
    textoConfirmar: 'Confirmar',
    tipo: 'perigo',
    onConfirm: null,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  function abrirAviso(titulo, mensagem, tipo = 'aviso') {
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
      tipo: 'aviso',
    });
  }

  function abrirConfirmacao({
    titulo = 'Confirmação',
    mensagem,
    textoConfirmar = 'Confirmar',
    tipo = 'perigo',
    onConfirm,
  }) {
    setConfirmacao({
      aberto: true,
      titulo,
      mensagem,
      textoConfirmar,
      tipo,
      onConfirm,
    });
  }

  function fecharConfirmacao() {
    setConfirmacao({
      aberto: false,
      titulo: '',
      mensagem: '',
      textoConfirmar: 'Confirmar',
      tipo: 'perigo',
      onConfirm: null,
    });
  }

  async function confirmarAcao() {
    if (!confirmacao.onConfirm) return;

    try {
      await confirmacao.onConfirm();
    } finally {
      fecharConfirmacao();
    }
  }

  async function carregarDados() {
    try {
      setCarregando(true);

      const [dadosUsuarios, dadosMedicos] = await Promise.all([
        listarUsuarios(),
        getMedicos(),
      ]);

      setUsuarios(dadosUsuarios || []);
      setMedicos(dadosMedicos || []);
    } catch (error) {
      abrirAviso(
        'Erro ao carregar usuários',
        error?.response?.data?.mensagem || 'Não foi possível carregar os usuários.',
        'erro'
      );
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  function abrirNovo() {
    setEditando(null);
    setForm(usuarioInicial);
    setModalAberto(true);
  }

  function abrirEdicao(usuario) {
    setEditando(usuario);

    setForm({
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '',
      confirmarSenha: '',
      perfil: converterPerfilParaNumero(usuario.perfil),
      ativo: usuario.ativo,
      medicoId: usuario.medicoId || '',
    });

    setModalAberto(true);
  }

  function converterPerfilParaNumero(perfil) {
    if (perfil === 'Admin' || perfil === 1) return 1;
    if (perfil === 'Recepcionista' || perfil === 2) return 2;
    if (perfil === 'Medico' || perfil === 3) return 3;
    if (perfil === 'Paciente' || perfil === 4) return 4;
    return 2;
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setEditando(null);
    setForm(usuarioInicial);
  }

  function alterarPerfil(valor) {
    const perfil = Number(valor);

    setForm((dados) => ({
      ...dados,
      perfil,
      medicoId: perfil === 3 ? dados.medicoId : '',
    }));
  }

  async function salvarUsuario(e) {
    e.preventDefault();

    if (!form.nome.trim()) {
      abrirAviso('Campo obrigatório', 'Informe o nome do usuário.');
      return;
    }

    if (!form.email.trim()) {
      abrirAviso('Campo obrigatório', 'Informe o e-mail do usuário.');
      return;
    }

    if (!form.senha) {
      abrirAviso('Campo obrigatório', 'Informe a senha do usuário.');
      return;
    }

    if (!form.confirmarSenha) {
      abrirAviso('Campo obrigatório', 'Confirme a senha do usuário.');
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      abrirAviso('Senhas diferentes', 'As senhas não conferem.', 'erro');
      return;
    }

    if (form.senha.length < 6) {
      abrirAviso(
        'Senha inválida',
        'A senha precisa ter pelo menos 6 caracteres.',
        'erro'
      );
      return;
    }

    if (Number(form.perfil) === 3 && !form.medicoId) {
      abrirAviso(
        'Vínculo obrigatório',
        'Selecione o médico que será vinculado a este usuário.'
      );
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      senha: form.senha,
      perfil: Number(form.perfil),
      ativo: form.ativo,
      medicoId: form.medicoId ? Number(form.medicoId) : null,
    };

    try {
      setSalvando(true);

      if (editando) {
        await atualizarUsuario(editando.id, payload);
      } else {
        await criarUsuario(payload);
      }

      fecharModal();
      await carregarDados();

      abrirAviso(
        editando ? 'Usuário atualizado' : 'Usuário cadastrado',
        editando
          ? 'As informações do usuário foram atualizadas com sucesso.'
          : 'O usuário foi cadastrado com sucesso.',
        'sucesso'
      );
    } catch (error) {
      abrirAviso(
        'Erro ao salvar usuário',
        error?.response?.data?.mensagem || 'Erro ao salvar usuário.',
        'erro'
      );
      console.error(error);
    } finally {
      setSalvando(false);
    }
  }

  function alternarStatus(id) {
    abrirConfirmacao({
      titulo: 'Alterar status',
      mensagem: 'Deseja alterar o status deste usuário?',
      textoConfirmar: 'Alterar status',
      tipo: 'aviso',
      onConfirm: async () => {
        try {
          await alterarStatusUsuario(id);
          await carregarDados();

          abrirAviso(
            'Status atualizado',
            'O status do usuário foi alterado com sucesso.',
            'sucesso'
          );
        } catch (error) {
          abrirAviso(
            'Erro ao alterar status',
            error?.response?.data?.mensagem || 'Erro ao alterar status.',
            'erro'
          );
          console.error(error);
        }
      },
    });
  }

  function removerUsuario(id) {
    abrirConfirmacao({
      titulo: 'Excluir usuário',
      mensagem:
        'Deseja realmente excluir este usuário? Essa ação não poderá ser desfeita.',
      textoConfirmar: 'Excluir',
      tipo: 'perigo',
      onConfirm: async () => {
        try {
          await excluirUsuario(id);
          await carregarDados();

          abrirAviso(
            'Usuário excluído',
            'O usuário foi excluído com sucesso.',
            'sucesso'
          );
        } catch (error) {
          abrirAviso(
            'Erro ao excluir usuário',
            error?.response?.data?.mensagem || 'Erro ao excluir usuário.',
            'erro'
          );
          console.error(error);
        }
      },
    });
  }

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const texto = `${usuario.nome} ${usuario.email} ${usuario.perfil}`.toLowerCase();
      return texto.includes(busca.toLowerCase());
    });
  }, [usuarios, busca]);

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-3 lg:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100">
              <UserCog className="h-5 w-5 text-sky-600" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Usuários</h1>
              <p className="text-[11px] text-gray-500">
                Gerencie acessos, permissões e vínculos do ControlMed
              </p>
            </div>
          </div>

          <button
            onClick={abrirNovo}
            className="flex h-9 items-center gap-2 rounded-lg bg-sky-600 px-3 text-xs font-semibold text-white transition hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            Novo usuário
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <ResumoCard titulo="Usuários" valor={usuarios.length} descricao="Cadastrados" tipo="blue" />
          <ResumoCard titulo="Filtrados" valor={usuariosFiltrados.length} descricao="Resultado atual" tipo="amber" />
          <ResumoCard titulo="Ativos" valor={usuarios.filter((u) => u.ativo).length} descricao="Acesso liberado" tipo="green" />
          <ResumoCard titulo="Inativos" valor={usuarios.filter((u) => !u.ativo).length} descricao="Acesso bloqueado" tipo="red" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm lg:px-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <div className="flex h-11 items-center gap-2 rounded-lg border border-gray-300 px-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, e-mail ou perfil..."
              className="h-full w-full border-none bg-transparent text-xs outline-none sm:text-sm"
            />
          </div>

            <div className="flex min-h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-xs text-gray-600">
              <UserCog className="mr-2 h-4 w-4 text-sky-600" />
              {usuariosFiltrados.length}{' '}
              {usuariosFiltrados.length === 1
                ? 'usuário encontrado'
                : 'usuários encontrados'}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {carregando ? (
            <div className="p-4 text-sm text-gray-500">
              Carregando usuários...
            </div>
          ) : (
            <>
              <div className="grid gap-3 p-3 lg:hidden">
                {usuariosFiltrados.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    Nenhum usuário encontrado.
                  </div>
                ) : (
                  usuariosFiltrados.map((usuario) => (
                    <UsuarioCardMobile
                      key={usuario.id}
                      usuario={usuario}
                      onEditar={() => abrirEdicao(usuario)}
                      onAlternarStatus={() => alternarStatus(usuario.id)}
                      onRemover={() => removerUsuario(usuario.id)}
                    />
                  ))
                )}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="w-[90px] px-4 py-3 text-left">ID</th>
                      <th className="min-w-[260px] px-4 py-3 text-left">Usuário</th>
                      <th className="min-w-[300px] px-4 py-3 text-left">E-mail</th>
                      <th className="min-w-[150px] px-4 py-3 text-left">Perfil</th>
                      <th className="min-w-[130px] px-4 py-3 text-left">Status</th>
                      <th className="min-w-[150px] px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">
                            # {usuario.id}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold uppercase text-gray-900">
                              {usuario.nome || '-'}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              Usuário do sistema
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="truncate text-xs text-gray-600">
                            {usuario.email || '-'}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">
                            {usuario.perfil}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <StatusUsuario ativo={usuario.ativo} />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <BotaoAcao onClick={() => abrirEdicao(usuario)} titulo="Editar" cor="blue">
                              <Pencil className="h-4 w-4" />
                            </BotaoAcao>
                            <BotaoAcao onClick={() => alternarStatus(usuario.id)} titulo="Ativar/Inativar" cor="amber">
                              <Power className="h-4 w-4" />
                            </BotaoAcao>
                            <BotaoAcao onClick={() => removerUsuario(usuario.id)} titulo="Excluir" cor="red">
                              <Trash2 className="h-4 w-4" />
                            </BotaoAcao>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {usuariosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">
                          Nenhum usuário encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-sky-600 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <UserCog className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-bold">
                    {editando ? 'Editar usuário' : 'Novo usuário'}
                  </h2>
                  <p className="text-xs text-sky-100">
                    Configure dados de acesso, perfil e vínculo médico.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={salvarUsuario} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 p-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Nome
                </label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  E-mail
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Senha *
                  </label>

                  <input
                    type="password"
                    value={form.senha}
                    onChange={(e) =>
                      setForm({ ...form, senha: e.target.value })
                    }
                    className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Confirmar senha *
                  </label>

                  <input
                    type="password"
                    value={form.confirmarSenha}
                    onChange={(e) =>
                      setForm({ ...form, confirmarSenha: e.target.value })
                    }
                    className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Perfil
                </label>
                <select
                  value={form.perfil}
                  onChange={(e) => alterarPerfil(e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-sky-500"
                >
                  {perfis.map((perfil) => (
                    <option key={perfil.valor} value={perfil.valor}>
                      {perfil.label}
                    </option>
                  ))}
                </select>
              </div>

              {Number(form.perfil) === 3 && (
                <div
                  className={`rounded-lg border p-3 ${
                    editando && form.medicoId
                      ? 'border-slate-300 bg-slate-100'
                      : 'border-sky-100 bg-sky-50'
                  }`}
                >
                  <label
                    className={`mb-1 block text-xs font-bold ${
                      editando && form.medicoId
                        ? 'text-slate-700'
                        : 'text-sky-800'
                    }`}
                  >
                    Vincular ao médico *
                  </label>

                  <select
                    value={form.medicoId}
                    onChange={(e) =>
                      setForm({ ...form, medicoId: e.target.value })
                    }
                    disabled={editando && Boolean(form.medicoId)}
                    className={`h-9 w-full rounded-lg border px-3 text-sm outline-none focus:border-sky-500 ${
                      editando && form.medicoId
                        ? 'cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500'
                        : 'border-sky-200 bg-white'
                    }`}
                    required
                  >
                    <option value="">Selecione o médico (obrigatório)</option>

                    {medicos.map((medico) => (
                      <option key={medico.id} value={medico.id}>
                        {medico.nome}{' '}
                        {medico.email ? `- ${medico.email}` : ''}
                      </option>
                    ))}
                  </select>

                  <p
                    className={`mt-2 text-[11px] ${
                      editando && form.medicoId
                        ? 'font-semibold text-slate-600'
                        : 'text-sky-700'
                    }`}
                  >
                    {editando && form.medicoId
                      ? 'Este vínculo já foi definido e não pode ser alterado.'
                      : 'Esse vínculo é obrigatório para que o médico veja somente os próprios agendamentos.'}
                  </p>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) =>
                    setForm({ ...form, ativo: e.target.checked })
                  }
                />
                Usuário ativo
              </label>

              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="flex h-9 items-center gap-2 rounded-lg bg-sky-600 px-4 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AvisoModal aviso={aviso} onClose={fecharAviso} />
      <ConfirmacaoModal
        confirmacao={confirmacao}
        onClose={fecharConfirmacao}
        onConfirm={confirmarAcao}
      />
    </div>
  );
}



function ResumoCard({ titulo, valor, descricao, tipo }) {
  const estilos = {
    blue: {
      box: 'border-blue-200 bg-blue-50',
      icon: 'bg-blue-100 text-blue-700',
      value: 'text-blue-900',
      Icone: Users,
    },
    amber: {
      box: 'border-amber-200 bg-amber-50',
      icon: 'bg-amber-100 text-amber-700',
      value: 'text-amber-900',
      Icone: Search,
    },
    green: {
      box: 'border-green-200 bg-green-50',
      icon: 'bg-green-100 text-green-700',
      value: 'text-green-900',
      Icone: UserCheck,
    },
    red: {
      box: 'border-red-200 bg-red-50',
      icon: 'bg-red-100 text-red-700',
      value: 'text-red-900',
      Icone: Power,
    },
  };

  const estilo = estilos[tipo] || estilos.blue;
  const Icone = estilo.Icone;

  return (
    <div className={`rounded-xl border px-3 py-2 shadow-sm ${estilo.box}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className={`truncate text-lg font-black ${estilo.value}`}>
            {valor}
          </p>

          <p className="text-xs font-semibold text-gray-700">
            {titulo}
          </p>

          <p className="text-[11px] text-gray-500">
            {descricao}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${estilo.icon}`}
        >
          <Icone className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function UsuarioCardMobile({ usuario, onEditar, onAlternarStatus, onRemover }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
              # {usuario.id}
            </span>
            <p className="truncate text-sm font-bold uppercase text-gray-900">
              {usuario.nome || '-'}
            </p>
          </div>
          <p className="mt-1 truncate text-xs text-gray-500">
            {usuario.email || '-'}
          </p>
        </div>

        <StatusUsuario ativo={usuario.ativo} />
      </div>

      <div className="grid gap-2 text-xs">
        <LinhaMobile label="Perfil" valor={usuario.perfil || '-'} />
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
        <BotaoAcao onClick={onEditar} titulo="Editar" cor="blue">
          <Pencil className="h-4 w-4" />
        </BotaoAcao>
        <BotaoAcao onClick={onAlternarStatus} titulo="Ativar/Inativar" cor="amber">
          <Power className="h-4 w-4" />
        </BotaoAcao>
        <BotaoAcao onClick={onRemover} titulo="Excluir" cor="red">
          <Trash2 className="h-4 w-4" />
        </BotaoAcao>
      </div>
    </div>
  );
}

function LinhaMobile({ label, valor }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-800">{valor}</p>
    </div>
  );
}

function StatusUsuario({ ativo }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${
        ativo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function BotaoAcao({ children, onClick, titulo, cor = 'slate' }) {
  const estilos = {
    slate: 'text-slate-600 hover:bg-slate-100',
    blue: 'text-blue-600 hover:bg-blue-50',
    amber: 'text-amber-600 hover:bg-amber-50',
    red: 'text-red-600 hover:bg-red-50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition ${
        estilos[cor] || estilos.slate
      }`}
    >
      {children}
    </button>
  );
}

function AvisoModal({ aviso, onClose }) {
  if (!aviso.aberto) return null;

  const ehErro = aviso.tipo === 'erro';
  const ehSucesso = aviso.tipo === 'sucesso';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                ehErro
                  ? 'bg-red-50 text-red-600'
                  : ehSucesso
                    ? 'bg-green-50 text-green-600'
                    : 'bg-sky-50 text-sky-600'
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

function ConfirmacaoModal({ confirmacao, onClose, onConfirm }) {
  if (!confirmacao.aberto) return null;

  const ehPerigo = confirmacao.tipo === 'perigo';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              ehPerigo ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900">
              {confirmacao.titulo}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {confirmacao.mensagem}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`h-9 rounded-lg px-4 text-xs font-bold text-white transition ${
              ehPerigo
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {confirmacao.textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UsuariosPage;