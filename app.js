// Estabelecendo a conexão WebSocket com o servidor
const socket = new WebSocket('ws://localhost:8080');  // Usar 'ws://' ao invés de 'wss://'

// Função para desenhar a roleta
function drawRoulette() {
    const roleta = document.getElementById("roleta");
    const sections = 6;  // Número de seções da roleta (ajuste conforme necessário)
    const colors = ['#f00', '#00f', '#0f0', '#ff0', '#f0f', '#0ff'];
    
    for (let i = 0; i < sections; i++) {
        const section = document.createElement('div');
        section.classList.add('section');
        section.style.transform = `rotate(${i * (360 / sections)}deg)`;
        section.style.backgroundColor = colors[i % colors.length];
        roleta.appendChild(section);
    }
}

// Quando o WebSocket se conecta
socket.onopen = () => {
    console.log('Conectado ao servidor WebSocket');
};

// Quando o WebSocket receber uma mensagem do servidor
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.action === 'spin') {
        // Exibir o resultado do desafio
        document.getElementById("result").textContent = `Desafio: ${data.challenge}`;
    }
};

// Quando o WebSocket tiver erro
socket.onerror = (error) => {
    console.error('Erro WebSocket:', error);
};

// Quando o WebSocket for fechado
socket.onclose = () => {
    console.log('Conexão WebSocket fechada');
};

// Função para girar a roleta
function spinRoulette() {
    const roleta = document.getElementById("roleta");
    const randomDegree = Math.floor(Math.random() * 360);  // Aleatoriamente escolher um grau de rotação

    roleta.style.transition = "transform 4s ease-out";
    roleta.style.transform = `rotate(${randomDegree + 3600}deg)`;  // Gira várias voltas para parecer mais interessante

    // Enviar para o servidor que o botão "girar" foi pressionado
    socket.send(JSON.stringify({ action: 'spin' }));
}

// Quando o botão "Girar Roleta" for pressionado
document.getElementById("spinBtn").addEventListener("click", spinRoulette);

// Desenhar a roleta ao carregar a página
drawRoulette();
