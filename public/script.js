const socket = io();
let currentPlayer = '';
let isMyTurn = false;
let board = Array(9).fill(null);
let roomId = '';
let scoreX = 0, scoreO = 0, tieScore = 0;

function createRoom() {
  const id = document.getElementById('roomIdInput').value.trim();
  if (!id) return alert("Enter room ID");
  socket.emit('create-room', id);
  roomId = id;
}

function joinRoom() {
  const id = document.getElementById('roomIdInput').value.trim();
  if (!id) return alert("Enter room ID");
  socket.emit('join-room', id);
  roomId = id;
}

function handleClick(element) {
  const index = Number(element.id);
  if (!isMyTurn || board[index]) return;

  board[index] = currentPlayer;
  element.innerText = currentPlayer;
  socket.emit('make-move', { roomId, index, player: currentPlayer });
  isMyTurn = false;
  checkWinner();
}

function resetGame() {
  board = Array(9).fill(null);
  document.querySelectorAll('.col').forEach(cell => cell.innerText = '');
  document.getElementById('status').innerText = `You are ${currentPlayer} — ${isMyTurn ? "Your Turn" : "Opponent's Turn"}`;
  socket.emit('reset-board', roomId);
}

function getName(playerSymbol) {
  return document.getElementById(playerSymbol === 'X' ? 'playerXName' : 'playerOName').value || `Player ${playerSymbol}`;
}

function checkWinner() {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a, b, c] of combos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      const winner = board[a];
      const winnerName = getName(winner);

      if (winner === 'X') {
        scoreX++;
        document.getElementById('scoreX').innerText = `${winnerName}: ${scoreX}`;
      } else {
        scoreO++;
        document.getElementById('scoreO').innerText = `${winnerName}: ${scoreO}`;
      }

      document.getElementById('status').innerText = `${winnerName} Wins!`;
      isMyTurn = false;
      return;
    }
  }

  if (!board.includes(null)) {
    tieScore++;
    document.getElementById('scoreDraw').innerText = `TIE: ${tieScore}`;
    document.getElementById('status').innerText = `It's a TIE!`;
  }
}

// Socket Events
socket.on('room-created', id => {
  document.getElementById('status').innerText = `Room created. Waiting for opponent...`;
  currentPlayer = 'X';
  isMyTurn = true;
});

socket.on('start-game', (players) => {
  if (currentPlayer !== 'X') {
    currentPlayer = 'O';
    isMyTurn = false;
  }
  document.getElementById('status').innerText = `You are ${currentPlayer} — ${isMyTurn ? "Your Turn" : "Opponent's Turn"}`;
});

socket.on('opponent-move', ({ index, player }) => {
  board[index] = player;
  document.getElementById(index).innerText = player;
  isMyTurn = true;
  checkWinner();
});

socket.on('reset-game', () => {
  board = Array(9).fill(null);
  document.querySelectorAll('.col').forEach(cell => cell.innerText = '');
  document.getElementById('status').innerText = `You are ${currentPlayer} — ${isMyTurn ? "Your Turn" : "Opponent's Turn"}`;
});

socket.on('room-full', () => {
  alert('Room is full!');
});
