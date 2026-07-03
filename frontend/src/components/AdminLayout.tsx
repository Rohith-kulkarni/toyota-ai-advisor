import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCurrentAdmin, logoutAdmin, type AdminUser } from "../api/client";

function AdminLayout() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadAdmin() {
      try {
        const response = await getCurrentAdmin();
        if (!cancelled) {
          setUser(response.user);
        }
      } catch {
        if (!cancelled) {
          setShouldRedirect(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAdmin();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await logoutAdmin();
    } finally {
      navigate("/admin/login", { replace: true });
    }
  }

  if (isLoading) {
    return <div className="page-shell">Loading admin...</div>;
  }

  if (shouldRedirect) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="page-shell">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <strong>{user?.email}</strong>
          </div>
          <nav className="admin-nav">
            <Link to="/admin/leads">Leads</Link>
            <button type="button" className="secondary-button" onClick={() => void handleLogout()}>
              Logout
            </button>
          </nav>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
