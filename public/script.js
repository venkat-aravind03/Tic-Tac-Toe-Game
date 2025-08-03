const socket = io();
let currentPlayer = '';
let isMyTurn = false;
let board = Array(9).fill(null);
let roomId = '';

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
  socket.emit('reset-board', roomId);
  document.getElementById('status').innerText = `You are ${currentPlayer} — ${isMyTurn ? "Your Turn" : "Opponent's Turn"}`;
}

function checkWinner() {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a, b, c] of combos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      document.getElementById('status').innerText = `${board[a]} Wins!`;
      isMyTurn = false;
      return;
    }
  }
  if (!board.includes(null)) {
    document.getElementById('status').innerText = `Draw!`;
  }
}

// Socket Events
socket.on('room-created', id => {
  document.getElementById('status').innerText = `Room created. Waiting for player...`;
  currentPlayer = 'X';
  isMyTurn = true;
});

socket.on('start-game', (players) => {
  document.getElementById('status').innerText = `Game Started!`;
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
