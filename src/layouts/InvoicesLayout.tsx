import { Outlet, Link, useLocation } from 'react-router-dom';
import '../App.css';

export function InvoicesLayout() {
  const location = useLocation();
  const isList = location.pathname === '/';
  const isCreate = location.pathname === '/invoices/create';

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            Invoice App
          </Link>
          <div className="nav-actions">
            {!isCreate && (
              <Link to="/invoices/create" className="btn-primary">
                + New Invoice
              </Link>
            )}
            {!isList && (
              <Link to="/" className="btn-secondary">
                ← Back to List
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
