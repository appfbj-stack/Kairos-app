import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './app/providers/ThemeProvider';
import QueryProvider from './app/providers/QueryProvider';
import RootLayout from './components/layout/RootLayout';
import Login from './pages/auth/Login';
import Callback from './pages/auth/Callback';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardPlaceholder from './pages/DashboardPlaceholder';
import DashboardMembros from './pages/dashboards/DashboardMembros';
import DashboardCongregacoes from './pages/dashboards/DashboardCongregacoes';
import DashboardEventos from './pages/dashboards/DashboardEventos';
import DashboardAniversariantes from './pages/dashboards/DashboardAniversariantes';
import DashboardFinanceiro from './pages/dashboards/DashboardFinanceiro';
import DashboardPastores from './pages/dashboards/DashboardPastores';
import DashboardObreiros from './pages/dashboards/DashboardObreiros';
import DashboardDepartamentos from './pages/dashboards/DashboardDepartamentos';
import DashboardCelulas from './pages/dashboards/DashboardCelulas';
import DashboardCultos from './pages/dashboards/DashboardCultos';
import DashboardEscalas from './pages/dashboards/DashboardEscalas';
import DashboardPatrimonio from './pages/dashboards/DashboardPatrimonio';
import DashboardVeiculos from './pages/dashboards/DashboardVeiculos';
import DashboardProjetos from './pages/dashboards/DashboardProjetos';
import DashboardDocumentos from './pages/dashboards/DashboardDocumentos';
import DashboardBiblioteca from './pages/dashboards/DashboardBiblioteca';
import DashboardComunicacao from './pages/dashboards/DashboardComunicacao';
import DashboardRelatorios from './pages/dashboards/DashboardRelatorios';
import MapaMinisterial from './pages/MapaMinisterial';
import Perfil from './pages/perfil/Perfil';
import Usuarios from './pages/admin/Usuarios';
import Configuracoes from './pages/admin/Configuracoes';
import AssistenteConfig from './pages/admin/AssistenteConfig';
import Logs from './pages/admin/Logs';
import Licenca from './pages/master/Licenca';
import Sistema from './pages/master/Sistema';
import Congregacoes from './pages/congregacoes/Congregacoes';
import CongregacaoDetalhes from './pages/congregacoes/CongregacaoDetalhes';
import Membros from './pages/membros/Membros';
import Obreiros from './pages/obreiros/Obreiros';
import Patrimonio from './pages/patrimonio/Patrimonio';
import Carteirinhas from './pages/carteirinhas/Carteirinhas';
import Batismos from './pages/batismos/Batismos';
import Agenda from './pages/agenda/Agenda';
import Privacidade from './pages/privacidade/Privacidade';
import Importacao from './pages/importacao/Importacao';

function RotaLivre({ children }) {
  return <RootLayout>{children}</RootLayout>;
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<Callback />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/acesso-negado" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-2xl p-8 text-center shadow max-w-md">
                  <div className="text-5xl mb-4">🚫</div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Acesso não permitido</h1>
                  <p className="text-gray-500 text-sm mb-4">Seu e-mail não está cadastrado no sistema. Entre em contato com o administrador.</p>
                  <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium inline-block hover:bg-blue-700">Voltar ao Login</a>
                </div>
              </div>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<RotaLivre><DashboardPlaceholder /></RotaLivre>} />
            <Route path="/dashboard/membros" element={<RotaLivre><DashboardMembros /></RotaLivre>} />
            <Route path="/dashboard/congregacoes" element={<RotaLivre><DashboardCongregacoes /></RotaLivre>} />
            <Route path="/dashboard/eventos" element={<RotaLivre><DashboardEventos /></RotaLivre>} />
            <Route path="/dashboard/aniversariantes" element={<RotaLivre><DashboardAniversariantes /></RotaLivre>} />
            <Route path="/dashboard/financeiro" element={<RotaLivre><DashboardFinanceiro /></RotaLivre>} />
            <Route path="/dashboard/pastores" element={<RotaLivre><DashboardPastores /></RotaLivre>} />
            <Route path="/dashboard/obreiros" element={<RotaLivre><DashboardObreiros /></RotaLivre>} />
            <Route path="/dashboard/departamentos" element={<RotaLivre><DashboardDepartamentos /></RotaLivre>} />
            <Route path="/dashboard/celulas" element={<RotaLivre><DashboardCelulas /></RotaLivre>} />
            <Route path="/dashboard/cultos" element={<RotaLivre><DashboardCultos /></RotaLivre>} />
            <Route path="/dashboard/escalas" element={<RotaLivre><DashboardEscalas /></RotaLivre>} />
            <Route path="/dashboard/patrimonio" element={<RotaLivre><DashboardPatrimonio /></RotaLivre>} />
            <Route path="/dashboard/veiculos" element={<RotaLivre><DashboardVeiculos /></RotaLivre>} />
            <Route path="/dashboard/projetos" element={<RotaLivre><DashboardProjetos /></RotaLivre>} />
            <Route path="/dashboard/documentos" element={<RotaLivre><DashboardDocumentos /></RotaLivre>} />
            <Route path="/dashboard/biblioteca" element={<RotaLivre><DashboardBiblioteca /></RotaLivre>} />
            <Route path="/dashboard/comunicacao" element={<RotaLivre><DashboardComunicacao /></RotaLivre>} />
            <Route path="/dashboard/relatorios" element={<RotaLivre><DashboardRelatorios /></RotaLivre>} />
            <Route path="/mapa-ministerial" element={<RotaLivre><MapaMinisterial /></RotaLivre>} />
            <Route path="/congregacoes" element={<RotaLivre><Congregacoes /></RotaLivre>} />
            <Route path="/congregacoes/:id" element={<RotaLivre><CongregacaoDetalhes /></RotaLivre>} />
            <Route path="/membros" element={<RotaLivre><Membros /></RotaLivre>} />
            <Route path="/obreiros" element={<RotaLivre><Obreiros /></RotaLivre>} />
            <Route path="/patrimonio" element={<RotaLivre><Patrimonio /></RotaLivre>} />
            <Route path="/carteirinhas" element={<RotaLivre><Carteirinhas /></RotaLivre>} />
            <Route path="/batismos" element={<RotaLivre><Batismos /></RotaLivre>} />
            <Route path="/agenda" element={<RotaLivre><Agenda /></RotaLivre>} />
            <Route path="/importacao" element={<RotaLivre><Importacao /></RotaLivre>} />
            <Route path="/perfil" element={<RotaLivre><Perfil /></RotaLivre>} />
            <Route path="/admin/usuarios" element={<RotaLivre><Usuarios /></RotaLivre>} />
            <Route path="/admin/configuracoes" element={<RotaLivre><Configuracoes /></RotaLivre>} />
            <Route path="/admin/assistente" element={<RotaLivre><AssistenteConfig /></RotaLivre>} />
            <Route path="/admin/logs" element={<RotaLivre><Logs /></RotaLivre>} />
            <Route path="/master/licenca" element={<RotaLivre><Licenca /></RotaLivre>} />
            <Route path="/master/sistema" element={<RotaLivre><Sistema /></RotaLivre>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryProvider>
    </ThemeProvider>
  );
}
