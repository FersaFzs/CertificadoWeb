// game.js - Shooter 2D Avanzado

// ========== CONFIGURACIÓN INICIAL ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');
const menu = document.getElementById('menu');
const startBtn = document.getElementById('startBtn');
const scoresBtn = document.getElementById('scoresBtn');
const scoresDiv = document.getElementById('scores')

// Tamaño del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ========== ESTADO DEL JUEGO ==========
let gameState = {
    running: false,
    currentTime: 0,
    lastTime: 0,
    deltaTime: 0
};

// ========== JUGADOR ==========
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: '#3498db',
    speed: 5,
    angle: 0,
    health: 100,
    maxHealth: 100,
    score: 0,
    weapons: {
        primary: {
            damage: 10,
            cooldown: 300,
            lastShot: 0,
            color: '#f1c40f'
        },
        special: {
            charges: 3,
            maxCharges: 3,
            cooldown: 1000,
            lastUsed: 0
        }
    },
    effects: {
        speedBoost: {
            active: false,
            value: 0,
            endTime: 0
        },
        damageBoost: {
            active: false,
            value: 0,
            endTime: 0
        }
    }
};

// ========== SISTEMA DE OLEADAS ==========
const waves = {
    currentWave: 0,
    enemiesToSpawn: 0,
    enemiesAlive: 0,
    waveInProgress: false,
    timeBetweenWaves: 3000,
    lastWaveTime: 0,
    spawnInterval: 1000,
    lastSpawnTime: 0
};

// ========== OBJETOS DEL JUEGO ==========
const bullets = [];
const enemies = [];
const particles = [];
const powerups = [];
let obstacles = [];

// Tipos de enemigos
const enemyTypes = [
    { color: '#e74c3c', speed: 1.8, health: 30, radius: 25, score: 10 }, // Básico
    { color: '#9b59b6', speed: 1.2, health: 60, radius: 35, score: 20 },  // Tanque
    { color: '#2ecc71', speed: 2.5, health: 20, radius: 20, score: 15 }   // Rápido
];

// Tipos de powerups
const powerupTypes = [
    { color: '#2ecc71', type: 'health', value: 20, text: 'SALUD +20' },
    { color: '#f1c40f', type: 'speed', value: 2, duration: 10000, text: 'VELOCIDAD +2' },
    { color: '#e74c3c', type: 'damage', value: 5, duration: 8000, text: 'DAÑO +5' },
    { color: '#3498db', type: 'charge', value: 1, text: 'CARGA ESPECIAL' }
];

// ========== FUNCIONES DE INICIALIZACIÓN ==========
function initGame() {
    // Resetear estado
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = player.maxHealth;
    player.score = 0;
    player.weapons.special.charges = player.weapons.special.maxCharges;
    player.effects.speedBoost.active = false;
    player.effects.damageBoost.active = false;
    player.color = '#3498db';
    
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    powerups.length = 0;
    obstacles = generateObstacles();
    
    waves.currentWave = 0;
    waves.waveInProgress = false;
    
    gameState.running = true;
    menu.style.display = 'none';
    
    // Iniciar primera oleada
    startWave();
    
    // Iniciar bucle del juego
    gameState.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function generateObstacles() {
    const obstacles = [];
    const obstacleCount = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < obstacleCount; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - 100),
            y: Math.random() * (canvas.height - 100),
            width: 30 + Math.random() * 70,
            height: 30 + Math.random() * 70,
            color: '#34495e'
        });
    }
    
    return obstacles;
}

// ========== FUNCIONES DE COLISIÓN ==========
function canMove(x, y, radius) {
    // Limites del canvas
    if (x < radius || x > canvas.width - radius || 
        y < radius || y > canvas.height - radius) {
        return false;
    }
    
    // Colisión con obstáculos
    for (const obs of obstacles) {
        if (x + radius > obs.x && 
            x - radius < obs.x + obs.width &&
            y + radius > obs.y && 
            y - radius < obs.y + obs.height) {
            return false;
        }
    }
    return true;
}

function canMoveEnemy(x, y, radius) {
    if (x < radius || x > canvas.width - radius || 
        y < radius || y > canvas.height - radius) {
        return false;
    }
    return true;
}

// ========== FUNCIONES DEL JUEGO ==========
function startWave() {
    waves.currentWave++;
    waves.enemiesToSpawn = 3 + waves.currentWave * 2;
    waves.enemiesAlive = 0;
    waves.waveInProgress = true;
    waves.lastSpawnTime = 0;
    
    if (waves.currentWave % 5 === 0) {
        let bossX = canvas.width / 2;
        let bossY = -100;
        const bossRadius = 60;

        while (!canMove(bossX, bossY, bossRadius)) {
            bossY += 10;
        }

        enemies.push({
            x: bossX,
            y: bossY,
            radius: bossRadius,
            color: '#c0392b',
            speed: 1.5,
            health: 200 + waves.currentWave * 20,
            maxHealth: 200 + waves.currentWave * 20,
            damage: 2,
            score: 100 * waves.currentWave,
            isBoss: true
        });
        waves.enemiesAlive++;
        console.log(`Boss generado en oleada ${waves.currentWave} en x: ${bossX}, y: ${bossY}`);
    }
}

function spawnEnemy() {
    if (!waves.waveInProgress || waves.enemiesToSpawn <= 0) return;

    let x, y;
    // Elegir un tipo de enemigo para obtener su radius
    const type = Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 1 : 2;
    const radius = enemyTypes[type].radius;

    // Generar posición cerca de los bordes pero dentro del canvas
    const edge = Math.floor(Math.random() * 4); // 0: izquierda, 1: derecha, 2: arriba, 3: abajo
    switch (edge) {
        case 0: // Izquierda
            x = radius + 10; // Margen adicional para evitar el borde exacto
            y = Math.random() * (canvas.height - 2 * radius) + radius;
            break;
        case 1: // Derecha
            x = canvas.width - radius - 10;
            y = Math.random() * (canvas.height - 2 * radius) + radius;
            break;
        case 2: // Arriba
            x = Math.random() * (canvas.width - 2 * radius) + radius;
            y = radius + 10;
            break;
        case 3: // Abajo
            x = Math.random() * (canvas.width - 2 * radius) + radius;
            y = canvas.height - radius - 10;
            break;
    }

    // Verificar que la posición sea válida (por si hay obstáculos)
    if (!canMove(x, y, radius)) {
        console.log(`Posición inicial inválida para enemigo en ${x}, ${y}, intentando otra...`);
        return spawnEnemy(); // Reintentar si está bloqueado por un obstáculo
    }

    enemies.push({
        ...enemyTypes[type],
        x, y,
        maxHealth: enemyTypes[type].health * (1 + waves.currentWave * 0.05),
        health: enemyTypes[type].health * (1 + waves.currentWave * 0.05),
        damage: enemyTypes[type].radius / 10,
        damageTaken: null
    });

    waves.enemiesToSpawn--;
    waves.enemiesAlive++;
}

function shoot() {
    const now = performance.now();
    const weapon = player.weapons.primary;
    
    if (now - weapon.lastShot < weapon.cooldown) return;
    
    weapon.lastShot = now;
    
    // Crear bala
    bullets.push({
        x: player.x,
        y: player.y,
        radius: 5,
        color: weapon.color,
        velocity: {
            x: Math.cos(player.angle) * 10,
            y: Math.sin(player.angle) * 10
        },
        damage: weapon.damage + (player.effects.damageBoost?.active ? player.effects.damageBoost.value : 0)
    });
    
    // Retroceso
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: player.x,
            y: player.y,
            size: Math.random() * 3 + 2,
            color: '#f39c12',
            speed: Math.random() * 3 + 1,
            angle: player.angle + Math.PI + (Math.random() * 0.4 - 0.2),
            life: 20 + Math.random() * 10
        });
    }
    
    playSound('shootSound');
}

function specialAttack() {
    const now = performance.now();
    const weapon = player.weapons.special;
    
    if (weapon.charges <= 0 || now - weapon.lastUsed < weapon.cooldown) return;
    
    weapon.charges--;
    weapon.lastUsed = now;
    
    // Disparo en círculo (8 direcciones)
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2) * (i / 8);
        bullets.push({
            x: player.x,
            y: player.y,
            radius: 8,
            color: '#e74c3c',
            velocity: {
                x: Math.cos(angle) * 12,
                y: Math.sin(angle) * 12
            },
            damage: 25
        });
    }
    
    // Efecto visual
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: player.x,
            y: player.y,
            size: Math.random() * 4 + 2,
            color: ['#e74c3c', '#f1c40f', '#3498db'][Math.floor(Math.random() * 3)],
            speed: Math.random() * 5 + 2,
            angle: Math.random() * Math.PI * 2,
            life: 30 + Math.random() * 20
        });
    }
    
    playSound('hitSound');
}

function spawnPowerup(x, y) {
    if (Math.random() < 0.3) { // 30% de chance
        const type = Math.floor(Math.random() * powerupTypes.length);
        powerups.push({
            x: x,
            y: y,
            radius: 15,
            ...powerupTypes[type],
            life: 300 // 5 segundos a 60fps
        });
    }
}

function applyPowerup(powerup) {
    let message = '';
    
    switch(powerup.type) {
        case 'health':
            player.health = Math.min(player.maxHealth, player.health + powerup.value);
            message = `+${powerup.value} SALUD`;
            break;
            
        case 'speed':
            player.effects.speedBoost = {
                active: true,
                value: powerup.value,
                endTime: performance.now() + powerup.duration
            };
            message = `VELOCIDAD +${powerup.value}`;
            break;
            
        case 'damage':
            player.effects.damageBoost = {
                active: true,
                value: powerup.value,
                endTime: performance.now() + powerup.duration
            };
            message = `DAÑO +${powerup.value}`;
            break;
            
        case 'charge':
            player.weapons.special.charges = Math.min(
                player.weapons.special.maxCharges,
                player.weapons.special.charges + powerup.value
            );
            message = `CARGA ESPECIAL`;
            break;
    }
    
    // Mostrar mensaje flotante
    particles.push({
        x: player.x,
        y: player.y - 50,
        size: 18,
        color: powerup.color,
        text: message,
        speed: -0.5,
        angle: -Math.PI/2,
        life: 60
    });
    
    playSound('hitSound');
}

function checkCollisions() {
    // Balas con enemigos
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            
            if (dist < enemy.radius + bullet.radius) {
                enemy.health -= bullet.damage;
                enemy.damageTaken = bullet.damage;
                
                // Efecto de impacto
                for (let k = 0; k < 5; k++) {
                    particles.push({
                        x: bullet.x,
                        y: bullet.y,
                        size: Math.random() * 3 + 1,
                        color: enemy.color,
                        speed: Math.random() * 3,
                        angle: Math.random() * Math.PI * 2,
                        life: 20 + Math.random() * 10
                    });
                }
                
                bullets.splice(i, 1);
                playSound('hitSound');
                break;
            }
        }
    }
    
    // Enemigos con jugador
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        
        if (dist < player.radius + enemy.radius) {
            player.health -= enemy.damage * 0.2; // Daño reducido por frame
            
            // Efecto visual
            if (performance.now() % 10 < 5) {
                player.color = '#e74c3c';
                setTimeout(() => player.color = '#3498db', 100);
            }
        }
    }
    
    // Powerups con jugador
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        const dist = Math.hypot(player.x - powerup.x, player.y - powerup.y);
        
        if (dist < player.radius + powerup.radius) {
            applyPowerup(powerup);
            powerups.splice(i, 1);
        }
    }
}

function updateEntities() {
    // Actualizar jugador
    const speed = player.speed + (player.effects.speedBoost?.active ? player.effects.speedBoost.value : 0);
    let newX = player.x;
    let newY = player.y;

    if (keys.KeyW) newY -= speed;
    if (keys.KeyS) newY += speed;
    if (keys.KeyA) newX -= speed;
    if (keys.KeyD) newX += speed;

    if (canMove(newX, newY, player.radius)) {
        player.x = newX;
        player.y = newY;
    }
    
    // Actualizar balas
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.velocity.x;
        bullet.y += bullet.velocity.y;
        
        // Eliminar si está fuera de pantalla
        if (bullet.x < -50 || bullet.x > canvas.width + 50 || 
            bullet.y < -50 || bullet.y > canvas.height + 50) {
            bullets.splice(i, 1);
        }
    }
    
    // Actualizar enemigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Movimiento hacia el jugador
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        let enemyNewX = enemy.x + Math.cos(angle) * enemy.speed;
        let enemyNewY = enemy.y + Math.sin(angle) * enemy.speed;

        if (canMoveEnemy(enemyNewX, enemyNewY, enemy.radius)) {
            enemy.x = enemyNewX;
            enemy.y = enemyNewY;
        }
        
        // Resetear daño mostrado después de 0.5 segundos
        if (enemy.damageTaken && performance.now() % 30 === 0) {
            enemy.damageTaken = null;
        }
        
        // Eliminar si está muerto
        if (enemy.health <= 0) {
            player.score += enemy.score;
            spawnPowerup(enemy.x, enemy.y);
            enemies.splice(i, 1);
            waves.enemiesAlive--;
        }
    }
    
    // Actualizar partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Actualizar powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].life--;
        if (powerups[i].life <= 0) {
            powerups.splice(i, 1);
        }
    }
    
    // Verificar efectos temporales
    const now = performance.now();
    if (player.effects.speedBoost?.active && now > player.effects.speedBoost.endTime) {
        player.effects.speedBoost.active = false;
    }
    if (player.effects.damageBoost?.active && now > player.effects.damageBoost.endTime) {
        player.effects.damageBoost.active = false;
    }
}

function checkWaveStatus() {
    if (waves.waveInProgress && waves.enemiesToSpawn === 0 && waves.enemiesAlive === 0) {
        waves.waveInProgress = false;
        waves.lastWaveTime = performance.now();
        
        // Preparar siguiente oleada después del tiempo de espera
        setTimeout(() => {
            if (gameState.running) startWave();
        }, waves.timeBetweenWaves);
    }
}

function gameOver() {
    gameState.running = false;
    
    // Guardar puntuación
    const scores = JSON.parse(localStorage.getItem('scores') || []);
    scores.push({
        wave: waves.currentWave,
        score: player.score,
        date: new Date().toISOString()
    });
    localStorage.setItem('scores', JSON.stringify(scores));
    
    // Mostrar menú
    menu.style.display = 'flex';
    document.getElementById('scores').style.display = 'none';
    startBtn.textContent = 'REINTENTAR';
    
    // Limpiar eventos de teclado
    Object.keys(keys).forEach(key => keys[key] = false);
}

function showHighscores() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.sort((a, b) => b.wave - a.wave || b.score - a.score);
    
    scoresDiv.innerHTML = '<h2>MEJORES PUNTUACIONES</h2>';
    scores.slice(0, 10).forEach((score, i) => {
        const date = new Date(score.date);
        scoresDiv.innerHTML += `
            <p>${i+1}. Oleada ${score.wave} - ${score.score} pts (${date.toLocaleDateString()})</p>
        `;
    });
    
    scoresDiv.style.display = 'block';
}

function playSound(id) {
    const sound = document.getElementById(id);
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio bloqueado por el navegador:", e));
}

// ========== RENDERIZADO ==========
function render() {
    // Limpiar canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar obstáculos
    obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
    
    // Dibujar powerups
    powerups.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Efecto de parpadeo cuando está por desaparecer
        if (p.life < 60 && Math.floor(performance.now() / 100) % 2 === 0) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
    
    // Dibujar enemigos
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        
        // Barra de salud
        const healthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, 
                    enemy.radius * 2, 5);
        ctx.fillStyle = healthPercent > 0.6 ? '#2ecc71' : 
                       healthPercent > 0.3 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, 
                    enemy.radius * 2 * healthPercent, 5);
        
        // Indicador de daño reciente
        if (enemy.damageTaken) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`-${enemy.damageTaken}`, enemy.x, enemy.y - enemy.radius - 15);
        }
        
        // Corona para jefes
        if (enemy.isBoss) {
            ctx.strokeStyle = 'gold';
            ctx.lineWidth = 3;
            ctx.strokeRect(enemy.x - enemy.radius - 2, enemy.y - enemy.radius - 2, 
                          enemy.radius * 2 + 4, enemy.radius * 2 + 4);
        }
    });
    
    // Dibujar balas
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = bullet.color;
        ctx.fill();
        
        // Estela
        ctx.strokeStyle = `${bullet.color}80`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x - bullet.velocity.x * 0.3, bullet.y - bullet.velocity.y * 0.3);
        ctx.stroke();
    });
    
    // Dibujar partículas
    particles.forEach(p => {
        if (p.text) {
            ctx.fillStyle = p.color;
            ctx.font = `${p.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(p.text, p.x, p.y);
        } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
    });
    
    // Dibujar jugador
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    
    // Indicador de dirección
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(
        player.x + Math.cos(player.angle) * player.radius * 1.5,
        player.y + Math.sin(player.angle) * player.radius * 1.5
    );
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Dibujar UI
    updateUI();
}

function updateUI() {
    // Barra de salud
    const healthPercent = player.health / player.maxHealth;
    let uiHTML = `
        <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
            <div style="width: 200px; height: 20px; background: #333; border-radius: 3px; margin-bottom: 5px;">
                <div style="width: ${healthPercent * 100}%; height: 100%; 
                    background: ${healthPercent > 0.6 ? '#2ecc71' : healthPercent > 0.3 ? '#f1c40f' : '#e74c3c'}; 
                    border-radius: 3px;"></div>
            </div>
            <div>Oleada: ${waves.currentWave}</div>
            <div>Puntuación: ${player.score}</div>
            <div>Enemigos: ${waves.enemiesAlive}</div>
    `;
    
    // Cargas de arma especial
    uiHTML += `<div>Cargas Especiales: `;
    for (let i = 0; i < player.weapons.special.maxCharges; i++) {
        uiHTML += i < player.weapons.special.charges ? '◉ ' : '○ ';
    }
    uiHTML += `</div>`;
    
    // Efectos activos
    const now = performance.now();
    if (player.effects.speedBoost?.active) {
        const timeLeft = Math.ceil((player.effects.speedBoost.endTime - now) / 1000);
        uiHTML += `<div style="color: #f1c40f;">Velocidad +${player.effects.speedBoost.value} (${timeLeft}s)</div>`;
    }
    if (player.effects.damageBoost?.active) {
        const timeLeft = Math.ceil((player.effects.damageBoost.endTime - now) / 1000);
        uiHTML += `<div style="color: #e74c3c;">Daño +${player.effects.damageBoost.value} (${timeLeft}s)</div>`;
    }
    
    uiHTML += `</div>`;
    
    // Mensaje entre oleadas
    if (!waves.waveInProgress && waves.currentWave > 0) {
        const timeLeft = Math.ceil((waves.timeBetweenWaves - (now - waves.lastWaveTime)) / 1000);
        uiHTML += `
            <div style="background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; margin-top: 10px; text-align: center;">
                <div style="color: #f1c40f;">Siguiente oleada en ${timeLeft}...</div>
            </div>
        `;
    }
    
    ui.innerHTML = uiHTML;
}

// ========== BUCLE PRINCIPAL ==========
function gameLoop(currentTime) {
    gameState.currentTime = currentTime;
    gameState.deltaTime = currentTime - gameState.lastTime;
    gameState.lastTime = currentTime;
    
    if (!gameState.running) return;
    
    // Spawn de enemigos
    if (waves.waveInProgress && currentTime - waves.lastSpawnTime > waves.spawnInterval) {
        spawnEnemy();
        waves.lastSpawnTime = currentTime;
    }
    
    if (isMouseDown){
        shoot();
    }

    updateEntities();
    checkCollisions();
    checkWaveStatus();
    render();
    
    // Verificar game over
    if (player.health <= 0) {
        gameOver();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// ========== EVENT LISTENERS ==========
const keys = {};
let isMouseDown = false;

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    // Arma especial con E
    if (e.code === 'KeyE' && gameState.running) {
        specialAttack();
    }
    
    // Pausa con ESC
    if (e.code === 'Escape' && gameState.running) {
        gameState.running = false;
        menu.style.display = 'flex';
        startBtn.textContent = 'CONTINUAR';
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.angle = Math.atan2(e.clientY - rect.top - player.y, e.clientX - rect.left - player.x);
});

canvas.addEventListener('mousedown', () => {
    if (gameState.running){
        isMouseDown = true;
        shoot();
    } 
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
})

startBtn.addEventListener('click', initGame);
scoresBtn.addEventListener('click', showHighscores);

// Redimensionamiento
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Cargar sonidos (para desbloquear audio en móviles)
document.addEventListener('click', () => {
    playSound('shootSound');
    playSound('hitSound');
}, { once: true });