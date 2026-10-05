import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicSidebar from './PublicSidebar';
import PublicFooter from './PublicFooter';
import CitizenAlertBanner from './CitizenAlertBanner';
import { useAuth } from '../../hooks/useAuth';
import { useMyAlerts } from '../../hooks/useMyAlerts';

export default function PublicLayout() {
  const { isAuthenticated, isCitizen } = useAuth();
  const { alerts } = useMyAlerts();

  const showBanner = isAuthenticated && isCitizen && alerts?.length > 0;
  const showSidebar = isAuthenticated && isCitizen;

  return (
    <div className="vn-public flex flex-col min-h-screen bg-slate-50/50 text-slate-800 antialiased">
      <PublicHeader />

      {/* Body row — sidebar (sticky) on the left, content on the right */}
      <div className="flex-1 w-full">
        <div className="w-full max-w-[1600px] mx-auto flex items-start">
          {showSidebar && <PublicSidebar />}

          <main
            id="main-content"
            role="main"
            aria-label="Main Content"
            className="flex-1 min-w-0"
          >
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              {showBanner && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <CitizenAlertBanner alerts={alerts} />
                </div>
              )}
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}