import { useEffect, useState } from "react";
import api from "../lib/api";
import { encryptText, decryptText } from "../lib/crypto";

export default function ChatWindow({ toUsername, inbox, onSent, onSeen, socket }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!toUsername || !text) return;
    setBusy(true);
    try {
      const { cipherText, nonce } = await encryptText(text);
      await api.post("/api/messages", { toUsername, cipherText, nonce, ttlSeconds: 5 });
      setText("");
      onSent?.();
    } finally { setBusy(false); }
  }

  async function markSeen(id) {
    await api.post("/api/messages/seen", { id });
    onSeen?.();
  }

  useEffect(() => {
    if (text && toUsername) socket.emit("typing", { toUser: toUsername });
  }, [text]);

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <input className="input" placeholder={toUsername ? "Type a message..." : "Select a chat first"}
          value={text} onChange={(e)=>setText(e.target.value)} disabled={!toUsername}/>
        <button className="btn" disabled={busy || !toUsername} onClick={send}>Send</button>
      </div>
      <ul className="list" style={{ display:"grid", gap:10 }}>
        {inbox.map((m) => (
          <MessageItem key={m._id} msg={m} onSeen={() => markSeen(m._id)} />
        ))}
      </ul>
    </div>
  );
}

function MessageItem({ msg, onSeen }) {
  const [plain, setPlain] = useState("");
  const [state, setState] = useState("hidden");

  useEffect(() => { setPlain(""); setState("hidden"); }, [msg._id]);

  async function reveal() {
    const p = await decryptText(msg.cipherText, msg.nonce);
    setPlain(p);
    setState("shown");
  }
  async function vanish() { await onSeen(); setState("vanished"); }

  return (
    <li className="card" style={{ display:"grid", gap:8 }}>
      <div className="row" style={{ justifyContent:"space-between" }}>
        <span className="badge">from: {msg.from}</span>
        <span className="badge">{new Date(msg.createdAt).toLocaleTimeString()}</span>
      </div>
      {state==="hidden" && <button className="btn" onClick={reveal}>Tap to view</button>}
      {state==="shown" && <>
        <div style={{ padding:"8px 0" }}>{plain}</div>
        <button className="btn" onClick={vanish}>Mark seen (vanish)</button>
      </>}
      {state==="vanished" && <div className="badge">Message vanished</div>}
    </li>
  );
}
