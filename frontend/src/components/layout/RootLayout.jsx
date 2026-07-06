// frontend/src/components/layout/RootLayout.jsx
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AssistenteIA from '../assistente/AssistenteIA';

export default function RootLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onToggleSidebar={() => setCollapsed((v) => !v)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
      <AssistenteIA />
    </div>
  );
}
