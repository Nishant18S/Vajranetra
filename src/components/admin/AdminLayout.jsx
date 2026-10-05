import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="vn-admin">
      <div className="vn-admin__body">
        {/* Desktop sidebar — fixed height, own scroll for nav */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <>
            <div
              className="vn-admin__drawer-bg"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="vn-admin__drawer lg:hidden">
              <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </>
        )}

        {/* Main — top bar sticky, content scrolls independently */}
        <div className="vn-admin__main">
          <AdminHeader />
          <AdminTopBar onOpenDrawer={() => setDrawerOpen(true)} />
          <main className="vn-admin__content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}