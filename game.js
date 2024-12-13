// Conexão WebSocket com o servidor
const socket = io();

// Variáveis para o jogo
let rollButton = document.getElementById('rollButton');
let scene, camera, renderer, die, rolling = false;
let rollValue = 1; // Valor do dado
let currentRotation = { x: 0, y: 0 }; // Rotações do dado

// Texturas para as faces do dado (números de 1 a 6)
let textures = [];
let loader = new THREE.TextureLoader();

// Carregar as texturas das faces do dado
function loadTextures() {
  for (let i = 1; i <= 6; i++) {
    textures.push(loader.load(`textures/${i}.png`));
  }
}

// Função para inicializar a cena WebGL com Three.js
function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
  camera.position.z = 5;

  // Criando o renderer e configurando o fundo transparente
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true para fundo transparente
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  // Configurar o fundo do canvas para transparente
  renderer.setClearColor(0x000000, 0); // O fundo é transparente (0 opacidade)

  // Criando o dado (um cubo 3D)
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // Verificar se as texturas foram carregadas com sucesso
  if (textures.length === 6) {
    const materials = textures.map(texture => new THREE.MeshBasicMaterial({ map: texture }));
    die = new THREE.Mesh(geometry, materials);
    scene.add(die);
  } else {
    console.error('As texturas não foram carregadas corretamente!');
  }

  // Animação do dado
  animate();

  // Quando o botão "Rolar Dado" for pressionado
  rollButton.addEventListener('click', () => {
    if (!rolling) {
      rolling = true;
      socket.emit('rollDice'); // Enviar ao servidor que o dado foi rolado
    }
  });
}

// Função para animação do dado
function animate() {
  requestAnimationFrame(animate);

  // Atualizar a rotação e enviar ao servidor se o dado estiver rolando
  if (rolling) {
    // Atualiza a rotação local do dado
    die.rotation.x += 0.1;
    die.rotation.y += 0.1;

    // Enviar a rotação para o servidor a cada frame
    socket.emit('updateRotation', {
      x: die.rotation.x,
      y: die.rotation.y
    });
  }

  renderer.render(scene, camera);
}

// Quando o dado for rolado, o servidor envia a face do dado
socket.on('diceRolled', () => {
  rolling = true;
});

// Função para parar a rotação do dado e exibir o número
socket.on('stopRolling', (roll) => {
  rolling = false;
  rollValue = roll;

  // Ajustar a rotação do dado para exibir o número correto
  let angle = Math.random() * Math.PI * 2;
  let x = Math.random() * Math.PI * 2;
  let y = Math.random() * Math.PI * 2;

  die.rotation.set(x, y, angle);

  // Exibir o valor final do dado
  alert(`O dado parou em: ${roll}`);
});

// Atualizar a rotação do dado em todos os jogadores
socket.on('updateRotation', (rotationData) => {
  // Sincroniza a rotação do dado para todos os jogadores
  die.rotation.x = rotationData.x;
  die.rotation.y = rotationData.y;
});

// Inicializar o jogo
loadTextures();
init();
