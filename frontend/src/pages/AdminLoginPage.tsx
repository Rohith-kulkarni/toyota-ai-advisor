import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/client";

function AdminLoginPage() {
  const [email, setEmail] = useState("admin@toyota-ai.local");
  const [password, setPassword] = useState("Admin@12345");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin/leads";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await loginAdmin(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-shell admin-shell">
      <main className="admin-card auth-card">
        <p className="eyebrow">Admin access</p>
        <h1>Sign in</h1>
        <p className="subcopy">Use your admin credentials to manage leads.</p>

        <form className="lead-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
            <small className="field-hint">email: admin@toyota-ai.local</small>
          </label>
          <label>
            <span>Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
            <small className="field-hint">password: Admin@12345</small>
          </label>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AdminLoginPage;
