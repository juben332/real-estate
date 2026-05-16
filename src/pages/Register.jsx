import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register({ onNavigate }) {
  const { signUp } = useAuth();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp({ name, email, password });
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
        <p className="hh-kicker">Join Hearth &amp; Hollow</p>
        <h1 className="hh-auth-title">Create account</h1>
        <form onSubmit={submit} className="hh-auth-form">
          <div className="hh-form-group">
            <label>Full name</label>
            <input
              type="text"
              className="hh-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="hh-form-group">
            <label>Email</label>
            <input
              type="email"
              className="hh-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              minLength={6}
            />
          </div>
          {error && <p className="hh-pay-error">{error}</p>}
          <button type="submit" className="hh-btn hh-btn-solid hh-btn-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="hh-auth-switch">
          Already have an account?{" "}
          <button className="hh-auth-link" onClick={() => onNavigate("login")}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
