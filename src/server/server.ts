import { Server } from "socket.io"
import { createServer } from "http"
import SERVER_PORT from "./env.js"

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    io.emit("playerCountUpdate", {
        count: io.engine.clientsCount
    });

    rollSides();

    socket.on("castle", (data) => {
        socket.broadcast.emit("castle", data);
    })

    socket.on("movePiece", (data) => {
        socket.broadcast.emit("movePiece", data);
    })

    socket.on("enPassant", (data) => {
        socket.broadcast.emit("enPassant", data);
    })

    socket.on("drawEndscreen", (data) => {
        socket.broadcast.emit("drawEndscreen", data);
    })

    socket.on("drawRequest", () => {
        socket.broadcast.emit("drawRequest")
    })

    socket.on("rematchRequest", () => {
        if (io.engine.clientsCount > 1) socket.broadcast.emit("rematchRequest")
    })

    socket.on("rematchReply", (data) => {
        if (io.engine.clientsCount > 1) socket.broadcast.emit("rematchReply", data)
    })

    socket.on("rollSides", () => {
        rollSides();
    })

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`); 

        io.emit("playerCountUpdate", {
            count: io.engine.clientsCount
        });
    });
});

async function rollSides() {
    console.log("STOP BULLYING ME")

    const sockets = await io.fetchSockets();
    if (sockets.length < 2) return;

    const isP1Black = Math.random() < 0.5;

    sockets[0].emit("setColor", { color: isP1Black ? "black" : "white" });
    sockets[1].emit("setColor", { color: isP1Black ? "white" : "black" });
}

httpServer.listen(SERVER_PORT, () => {
    console.log(`Server running on Port: ${SERVER_PORT}`);
});