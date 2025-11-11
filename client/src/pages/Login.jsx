import { useState } from "react";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const { data } = await api.post(url, { username, password });
      setAuth({ token: data.token, user: data.user });
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: "8vh auto" }}>
        <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gap: 10 }}>
            <input className="input" placeholder="Username"
              value={username} onChange={(e)=>setUsername(e.target.value)} />
            <input className="input" type="password" placeholder="Password"
              value={password} onChange={(e)=>setPassword(e.target.value)} />
            {err && <div className="badge" style={{background:"#5c2430"}}>{err}</div>}
            <button className="btn" disabled={busy}>
              {busy ? "Please wait..." : (mode === "login" ? "Login" : "Register")}
            </button>
          </div>
        </form>
        <div style={{ marginTop: 12 }}>
          <button className="btn secondary" onClick={() => setMode(mode==="login"?"register":"login")}>
            Switch to {mode === "login" ? "Register" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
