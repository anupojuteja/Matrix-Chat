import jwt from "jsonwebtoken";

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

    socket.on("typing", ({ toUser }) => {
      if (!socket.data.uid) return;
      io.to(toUser).emit("typing", { fromUser: socket.data.uid });
    });
  });
}
