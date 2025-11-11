import { useEffect, useState } from "react";
import api from "../lib/api";
import { encryptText, decryptText } from "../lib/crypto";

export default function ChatWindow({ toUsername, inbox, onSent, onSeen }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!toUsername || !text) return;
    setBusy(true);
    try {
      const { cipherText, nonce } = await encryptText(text);
      await api.post("/api/messages", {
        toUsername, cipherText, nonce, ttlSeconds: 0
      });
      setText("");
      onSent?.();
    } finally { setBusy(false); }
  }

  async function markSeen(id) {
    await api.post("/api/messages/seen", { id });
    onSeen?.();
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <input className="input" placeholder="Type a message..."
          value={text} onChange={(e)=>setText(e.target.value)} />
        <button className="btn" disabled={busy} onClick={send}>Send</button>
      </div>

      <ul className="list" style={{ display:"grid", gap:10 }}>
        {inbox.map((m) => (
          <MessageItem key={m._id} msg={m} onSeen={() => markSeen(m._id)} />
        ))}
        {inbox.length === 0 && <li className="badge">No new messages</li>}
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

  async function vanish() {
    await onSeen();
    setState("vanished");
  }

  return (
    <li className="card" style={{ display:"grid", gap:8 }}>
      <div className="row" style={{ justifyContent:"space-between" }}>
        <span className="badge">from: {msg.from}</span>
        <span className="badge">{new Date(msg.createdAt).toLocaleTimeString()}</span>
      </div>
      {state === "hidden" && (
        <div className="row">
          <button className="btn" onClick={reveal}>Tap to view</button>
        </div>
      )}
      {state === "shown" && (
        <>
          <div style={{ padding:"8px 0" }}>{plain}</div>
          <div className="row">
            <button className="btn" onClick={vanish}>Mark seen (vanish)</button>
          </div>
        </>
      )}
      {state === "vanished" && <div className="badge">Message vanished</div>}
    </li>
  );
}
