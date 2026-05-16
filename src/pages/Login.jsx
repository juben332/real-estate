import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onNavigate }) {
  const { signIn } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn({ email, password });
      onNavigate("dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hh-auth-page">
      <div className="hh-auth-card">
        <p className="hh-kicker">Welcome back</p>
        <h1 className="hh-auth-title">Sign in</h1>
        <form onSubmit={submit} className="hh-auth-form">
          <div className="hh-form-group">
            <label>Email</label>
            <input
              type="email"
              className="hh-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="hh-form-group">
            <label>Password</label>
            <input
              type="password"
              className="hh-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="hh-pay-error">{error}</p>}
          <button type="submit" className="hh-btn hh-btn-solid hh-btn-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="hh-auth-switch">
          Don&apos;t have an account?{" "}
          <button className="hh-auth-link" onClick={() => onNavigate("register")}>
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
