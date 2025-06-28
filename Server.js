const http = require("http");
const express = require("express");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const port = 3901;
const io = require("socket.io")(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    fs.readFile(__dirname + "/index.html", (error, data) => {
        if (error) {
            console.log(error);
            
            return res.sendStatus(500);
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    });
});

app.post("/", (req, res) => {
    const msg = `Console Bot : ${req.body.msg}`;

    console.log(msg);

    require("./index.js").SendMessage(msg);

    fs.readFile(__dirname + "/index.html", (error, data) => {
        if (error) {
            console.log(error);
            
            return res.sendStatus(500);
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    });
});

io.sockets.on("connection", socket => {
    socket.on("message", msg => {
        io.sockets.emit("message", msg);
    });
});

function KeepAlive() {
    server.listen(port, () => {
        console.log(`Server started on ${port} port!`);
    });
}

function SendMsgToClients(msg) {
    io.sockets.emit("message", msg);

    io.sockets.on("connection", socket => {
        socket.on("message", msg => {
            io.sockets.emit("message", msg);
        });
    });
}

module.exports = { KeepAlive, SendMsgToClients };