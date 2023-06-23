const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: ["http://localhost:5173"],
    },
});

io.on("connection", (socket) => {
    console.log("client connection");

    socket.on("socket:setup", (user) => {
        console.log("setup connection");

        socket.join(user.id);

        console.log(`user ${user.id} connected`);

        socket.emit("socket:connected");
    });

    socket.on("disconnect", () => {
        console.log("client disconnected");
    });
});

module.exports = io;
