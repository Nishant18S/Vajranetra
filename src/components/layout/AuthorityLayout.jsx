import { Outlet } from 'react-router-dom';
import AuthoritySidebar from './AuthoritySidebar';
import AuthorityTopBar from './AuthorityTopBar';

export default function AuthorityLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr] bg-base-900">
      <AuthoritySidebar />
      <div className="flex flex-col min-w-0">
        <AuthorityTopBar />
        <main className="flex-1 p-5 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}