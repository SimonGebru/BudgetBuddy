import { Navbar } from './Navbar';
import { DesktopSidebar } from './DesktopSidebar';

export function AppLayout({ children, showNav = true }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {showNav && <DesktopSidebar />}
        <main className="flex-1 min-h-screen">
          <div className="page-container-desktop">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <main className="page-container">
          {children}
        </main>
        {showNav && <Navbar />}
      </div>
    </div>
  );
}