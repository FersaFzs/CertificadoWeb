// Variables globales
let scene, camera, renderer;

// Inicialización
function init() {
    // Crear la escena
    scene = new THREE.Scene();

    // Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Crear el renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Crear un cubo
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Posicionar la cámara
    camera.position.z = 5;

    // Función de animación
    function animate() {
        requestAnimationFrame(animate);

        // Rotar el cubo
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        // Renderizar la escena
        renderer.render(scene, camera);
    }

    animate();
}

// Llamar a la función de inicialización
init();
