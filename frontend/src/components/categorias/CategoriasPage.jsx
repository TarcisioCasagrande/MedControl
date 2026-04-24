// src/components/categorias/CategoriasPage.jsx

// Este é o componente "orquestrador" da página de Categorias.
// Ele coordena todos os outros componentes:
//   - CategoriaTable (tabela com busca)
//   - CategoriaFormModal (criar/editar)
//   - ConfirmDialog (confirmação de deleção)
//
// Responsabilidades:
//   1. Carregar dados da API (categorias + produtos)
//   2. Gerenciar estados de UI (modal aberto, editando, deletando)
//   3. Chamar os services para CRUD
//   4. Disparar toasts de feedback

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Tag } from 'lucide-react';
import {
  getCategorias,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria,
} from '../../services/categoriaService';
import { getProdutos } from '../../services/produtoService';
import { useToast } from '../../hooks/useToast';
import CategoriaTable from './CategoriaTable';
import CategoriaFormModal from './CategoriaFormModal';
import ConfirmDialog from '../ui/ConfirmDialog';

function CategoriasPage() {
  // --- Estados de dados ---
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // --- Estados de UI (controle de modais) ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [categoriaDeletando, setCategoriaDeletando] = useState(null);

  // Hook de toast para exibir notificações
  const toast = useToast();

  // Carrega dados quando o componente é montado
  useEffect(() => {
    carregarDados();
  }, []);

  // =====================================================================
  // Carrega categorias E produtos simultaneamente com Promise.all
  //
  // Por que carregar produtos na página de categorias?
  // Porque precisamos contar quantos produtos pertencem a cada categoria
  // (a coluna "Produtos" na tabela). Sem os dados de produtos,
  // não conseguimos calcular essa contagem.
  // =====================================================================
  const carregarDados = async () => {
    try {
      setLoading(true);
      // Promise.all executa ambas as chamadas em PARALELO.
      // Os resultados são retornados na mesma ordem do array.
      const [dadosCategorias, dadosProdutos] = await Promise.all([
        getCategorias(),
        getProdutos(),
      ]);
      setCategorias(dadosCategorias);
      setProdutos(dadosProdutos);
    } catch (error) {
      toast.error('Não foi possível carregar os dados. Verifique se a API está rodando.');
      console.error('Erro ao carregar:', error);
    } finally {
      // finally é executado SEMPRE, independente de sucesso ou erro.
      // Garante que o loading é desligado mesmo se a API falhar.
      setLoading(false);
    }
  };

  // =====================================================================
  // Conta quantos produtos pertencem a uma categoria
  //
  // Esta função é passada como PROP para a CategoriaTable.
  // A tabela chama produtosPorCategoria(categoria.id) para cada linha.
  //
  // Por que uma função e não um número pré-calculado?
  // Porque é mais simples e a lista de produtos já está em memória.
  // Para centenas de milhares de produtos, pré-calcular seria melhor.
  // =====================================================================
  const produtosPorCategoria = (categoriaId) => {
    return produtos.filter((p) => p.categoriaId === categoriaId).length;
  };

  // --- Handlers de UI (abrir/fechar modais) ---

  const handleNovo = () => {
    setCategoriaEditando(null); // null = modo "criar"
    setIsFormModalOpen(true);
  };

  const handleEditar = (categoria) => {
    setCategoriaEditando(categoria); // objeto = modo "editar"
    setIsFormModalOpen(true);
  };

  // --- Handler de salvar (criar ou atualizar) ---

  const handleSalvar = async (categoria) => {
    try {
      if (categoriaEditando) {
        // PUT /api/categorias/{id}
        await atualizarCategoria(categoria.id, categoria);
        toast.success(`Categoria "${categoria.nome}" atualizada com sucesso!`);
      } else {
        // POST /api/categorias
        await criarCategoria(categoria);
        toast.success(`Categoria "${categoria.nome}" cadastrada com sucesso!`);
      }
      // Fecha o modal e recarrega os dados
      setIsFormModalOpen(false);
      setCategoriaEditando(null);
      await carregarDados();
    } catch (error) {
      toast.error('Erro ao salvar a categoria.');
      console.error('Erro ao salvar:', error);
    }
  };

  // --- Handlers de deleção ---

  const handleConfirmarDelete = (categoria) => {
    setCategoriaDeletando(categoria);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletar = async () => {
    try {
      // DELETE /api/categorias/{id}
      await deletarCategoria(categoriaDeletando.id);
      toast.success(`Categoria "${categoriaDeletando.nome}" removida com sucesso!`);
      setIsDeleteDialogOpen(false);
      setCategoriaDeletando(null);
      await carregarDados();
    } catch (error) {
      // =========================================================
      // TRATAMENTO DE ERRO ESPECÍFICO DO BACKEND
      //
      // Quando tentamos deletar uma categoria que tem produtos,
      // o backend retorna HTTP 400 com:
      // { "mensagem": "Não é possível deletar esta categoria..." }
      //
      // Capturamos essa mensagem e mostramos no toast.
      // Se não fosse possível extrair a mensagem, usamos uma genérica.
      //
      // error.response?.data?.mensagem usa optional chaining (?.)
      // para evitar erros se response ou data forem undefined
      // (ex: se a API estiver fora do ar, não tem response).
      // =========================================================
      const mensagem =
        error.response?.data?.mensagem || 'Erro ao deletar a categoria.';
      toast.error(mensagem);
      setIsDeleteDialogOpen(false);
      console.error('Erro ao deletar:', error);
    }
  };

  // --- Render ---

  return (
    <div className="p-6">
      {/* Header da página — título, contagem e botões */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Ícone da página */}
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Categorias</h1>
            <p className="text-sm text-gray-500">
              {/* Texto dinâmico: "1 categoria cadastrada" ou "3 categorias cadastradas" */}
              {categorias.length}{' '}
              {categorias.length === 1 ? 'categoria cadastrada' : 'categorias cadastradas'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão recarregar — ícone gira enquanto carrega */}
          <button
            onClick={carregarDados}
            title="Recarregar lista"
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {/* Botão Nova Categoria */}
          <button
            onClick={handleNovo}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Conteúdo principal — loading ou tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
          <span className="ml-3 text-gray-500">Carregando categorias...</span>
        </div>
      ) : (
        <CategoriaTable
          categorias={categorias}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditar={handleEditar}
          onDeletar={handleConfirmarDelete}
          produtosPorCategoria={produtosPorCategoria}
        />
      )}

      {/* Modal de formulário (criar/editar) */}
      <CategoriaFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCategoriaEditando(null);
        }}
        categoriaEditando={categoriaEditando}
        onSalvar={handleSalvar}
      />

      {/* Diálogo de confirmação de deleção */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoriaDeletando(null);
        }}
        onConfirm={handleDeletar}
        title="Deletar Categoria"
        message={
          categoriaDeletando
            ? `Tem certeza que deseja excluir a categoria "${categoriaDeletando.nome}"? Categorias com produtos associados não podem ser deletadas.`
            : ''
        }
      />
    </div>
  );
}

export default CategoriasPage;