export default function ChatList({ inbox, selectUser }) {
  return (
    <ul className="list" style={{ marginBottom: 20 }}>
      {inbox.length === 0 && <li className="badge">No new messages</li>}
      {inbox.map((msg) => (
        <li key={msg._id} className="card" onClick={() => selectUser(msg.from)} style={{ cursor: "pointer" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>From: {msg.from}</span>
            <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
