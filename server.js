const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Inicia o aplicativo express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Lista de jogadores
let players = [];
let currentTurn = 1; // 1 para Jogador 1, 2 para Jogador 2
let lettersChosen = []; // Para armazenar as letras escolhidas

// Servir os arquivos estáticos (como o index.html)
app.use(express.static('public'));

// Quando um jogador se conecta
io.on('connection', (socket) => {
  console.log('Novo jogador conectado');

  // Adiciona o jogador à lista
  players.push(socket);

  // Envia a vez atual para o jogador
  socket.emit('updateTurn', currentTurn);

  // Envia as letras disponíveis
  socket.emit('updateLetters', ['A', 'E', 'R', 'T', 'B', 'D', 'C', 'U', 'I', 'Z', 'Y', 'N']);

  // Quando o jogador envia uma escolha de letra
  socket.on('chooseLetter', (letter) => {
    if (currentTurn === players.indexOf(socket) + 1) {
      // Salva a letra escolhida
      lettersChosen.push(letter);
      // Alterna para o outro jogador
      currentTurn = currentTurn === 1 ? 2 : 1;

      // Envia a vez do jogador para todos
      io.emit('updateTurn', currentTurn);
      io.emit('updateLetters', lettersChosen); // Atualiza as letras escolhidas
    }
  });

  // Quando o jogador envia uma mensagem
  socket.on('sendWord', (word) => {
    if (currentTurn === players.indexOf(socket) + 1) {
      io.emit('receiveMessage', word); // Envia a mensagem para todos
    }
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
