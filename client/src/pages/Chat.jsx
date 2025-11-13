import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import ChatWindow from "../components/ChatWindow.jsx";
import ChatList from "../components/ChatList.jsx";

export default function Chat() {
  const { token, user, logout } = useAuthStore();
  const [toUsername, setToUsername] = useState("");
  const [inbox, setInbox] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const socket = useMemo(
    () => io(import.meta.env.VITE_WS_BASE || "http://localhost:5000", { autoConnect: false }),
    []
  );

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => socket.emit("auth", token));
    socket.on("auth:ok", () => console.log("Socket authorized"));
    socket.on("message:new", fetchInbox);
    socket.on("message:sent", fetchInbox);
    socket.on("message:seen", fetchInbox);
    socket.on("typing", ({ fromUser }) => {
      setTypingUser(fromUser);
      setTimeout(() => setTypingUser(""), 2000);
    });
    return () => socket.disconnect();
  }, [socket, token]);

  async function fetchInbox() {
    try {
      const { data } = await api.get("/api/messages/inbox");
      setInbox(data.messages || []);
    } catch (e) {
      console.error("Inbox fetch failed:", e.message);
    }
  }
  useEffect(() => { fetchInbox(); }, []);

  useEffect(() => {
    const saved = localStorage.getItem("lastUser");
    if (saved) setToUsername(saved);
  }, []);
  useEffect(() => {
    if (toUsername) localStorage.setItem("lastUser", toUsername);
  }, [toUsername]);

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2>Hi, {user?.username}</h2>
        <div className="row">
          <input className="input" placeholder="Send to username..."
            value={toUsername} onChange={(e)=>setToUsername(e.target.value)} style={{width:240}}/>
          <button className="btn secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      {typingUser && <div className="badge">?? {typingUser} is typing...</div>}

      <div className="row" style={{ marginTop: 16 }}>
        <div className="card" style={{ flex: 1 }}>
          <h3>Inbox (encrypted)</h3>
          <ChatList inbox={inbox} selectUser={setToUsername} />
          <ChatWindow toUsername={toUsername} inbox={inbox} onSent={fetchInbox} onSeen={fetchInbox} socket={socket} />
        </div>
      </div>
    </div>
  );
}
