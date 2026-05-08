import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SemAcessoPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-500 to-red-800 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-center">

        {/* ÍCONE */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
        </div>

        {/* TÍTULO */}
        <h1 className="text-lg font-bold text-gray-900 mb-2">
          Acesso negado
        </h1>

        {/* TEXTO */}
        <p className="text-sm text-gray-600 mb-6">
          Você não tem permissão para acessar esta página.
        </p>

        {/* BOTÃO */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o sistema
        </button>
      </div>
    </div>
  );
}

export default SemAcessoPage;