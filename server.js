

const express = require("express");
const http = require("http");
const { execPath } = require("process");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const maxX = 1280;
const maxY = 720;
const size = 100;

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
  console.log("New player connected:", socket.id);
  
  
  const newPlayer = generateNewplayer([socket.id]);
  
  
  players = {
    ...players,
    [socket.id]: newPlayer
  }

  
  
  socket.emit("init", { player: newPlayer, players });

  socket.broadcast.emit("newPlayer", newPlayer);
  
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id]
    
    socket.broadcast.emit("playerDisconnected", players);
  });

  socket.on("movementEvent", (player) => {
    temp = players
    temp[player.id] = player
    players = temp
    
    socket.broadcast.emit("updateMovement", players)
    socket.emit("updateMovement", players)
  // socket.on("")

  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


function getRandomColor(){
  const colors = Object.entries(players).map(([_, player])=>player.color)
  let newColor =  generateColor();

  while (colors.some((color)=> color === newColor)){
    newColor = generateColor();
  }

  return newColor;
}

function generateColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}



function generateNewplayer(socketId) {
  const coord = Object.entries(players).map(([_, player])=> {return {x: player.x, y: player.y}})
  x = Math.max(Math.min(Math.floor(Math.random() * maxX), 1280 - 50), 50)
  y = Math.max(Math.min(Math.floor(Math.random() * maxY), 720 - 50), 50)

  while (coord.some((pos)=> collision(x, y, pos))){
    x = Math.max(Math.min(Math.floor(Math.random() * maxX), 1280 - 50), 50)
    y = Math.max(Math.min(Math.floor(Math.random() * maxY), 720 - 50), 50)
  }

  area = Math.floor(Math.random() * 8)
  color = getRandomColor()

  return {
    id: socketId,
    color: color,
    x: x,
    y: y,
    area: area
  }
}

function collision(newX, newY, otherPlayer) {
  const size = 100;
  const dist = Math.sqrt(((newX - otherPlayer.x) * (newX - otherPlayer.x)) + ((newY - otherPlayer.y)*(newY - otherPlayer.y)))
  
  return dist < size;
}
