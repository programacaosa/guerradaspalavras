const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Inicia o aplicativo express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Lista de jogadores
let players = [];
let rolling = false;
let currentRoll = 1;

// Servir os arquivos estáticos (como o index.html)
app.use(express.static(__dirname));  // Serve arquivos da raiz

// Quando um jogador se conecta
io.on('connection', (socket) => {
  console.log('Novo jogador conectado');
  
  // Adiciona o jogador à lista
  players.push(socket);

  // Quando o jogador envia uma rolagem
  socket.on('rollDice', () => {
    if (!rolling) {
      rolling = true;

      // Simula a rotação do dado
      let roll = Math.floor(Math.random() * 6) + 1; // Valor aleatório entre 1 e 6
      currentRoll = roll;

      // Enviar aos jogadores que o dado foi rolado
      io.emit('diceRolled');

      // Sincronizar a rotação do dado
      setTimeout(() => {
        io.emit('stopRolling', roll); // Enviar que o dado parou e mostrar o número final
        rolling = false;
      }, 1500); // A rotação dura 1.5 segundos
    }
  });

  // Quando o jogador envia a rotação
  socket.on('updateRotation', (rotationData) => {
    // Envia a rotação para todos os outros jogadores
    socket.broadcast.emit('updateRotation', rotationData);
  });

  // Quando o jogador desconecta
  socket.on('disconnect', () => {
    console.log('Jogador desconectado');
    players = players.filter(player => player !== socket); // Remove o jogador da lista
  });
});

// Inicia o servidor na porta 3000
server.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});
