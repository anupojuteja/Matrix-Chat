import jwt from "jsonwebtoken";

/**
 * Socket.IO signaling:
 * - Client emits "auth" with JWT → we join the userId room
 * - WebRTC signaling relayed via rooms: offer/answer/ice
 */
export function attachSignaling(io) {
  io.on("connection", (socket) => {
    socket.on("auth", (token) => {
      try {
        const { uid } = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.uid = uid;
        socket.join(uid);
        socket.emit("auth:ok");
      } catch {
        socket.emit("auth:error");
      }
    });

    socket.on("webrtc:offer", ({ toUserId, offer }) => {
      if (!socket.data.uid) return;
      io.to(toUserId).emit("webrtc:offer", { fromUserId: socket.data.uid, offer });
    });

    socket.on("webrtc:answer", ({ toUserId, answer }) => {
      if (!socket.data.uid) return;
      io.to(toUserId).emit("webrtc:answer", { fromUserId: socket.data.uid, answer });
    });

    socket.on("webrtc:ice", ({ toUserId, candidate }) => {
      if (!socket.data.uid) return;
      io.to(toUserId).emit("webrtc:ice", { fromUserId: socket.data.uid, candidate });
    });
  });
}
