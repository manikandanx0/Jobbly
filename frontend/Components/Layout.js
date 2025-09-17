import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

export default function Layout({ children }){
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      {/* Desktop layout */}
      <div className="hidden md:flex">
        <Sidebar />
        <div className="ml-[320px] flex-1 min-h-screen">
          <Navbar onMenuClick={()=>setMobileOpen(true)} />
          <main id="main" className="px-6 md:px-10 lg:px-14 py-6">
            {children}
          </main>
        </div>
      </div>
      {/* Mobile layout */}
      <div className="md:hidden">
        <Navbar onMenuClick={()=>setMobileOpen(true)} />
        <main id="main" className="px-4 py-4">
          {children}
        </main>
      </div>
      {mobileOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/40 z-40" onClick={()=>setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-white border-r border-border z-50 p-4">
            <button className="mb-3 btn-secondary" onClick={()=>setMobileOpen(false)}>Close</button>
            <Sidebar />
          </aside>
        </div>
      )}
    </div>
  );
}


