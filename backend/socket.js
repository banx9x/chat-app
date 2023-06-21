const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: ["http://localhost:5173"],
    },
});

io.on("connection", (socket) => {
    console.log("Client connection");

    socket.on("setup", (user) => {
        console.log("Setup connection");

        socket.join(user.id);

        socket.emit("connected");
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

module.exports = io;
