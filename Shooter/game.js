const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Jugador
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: '#3498db',
    speed: 5,
    angle: 0,
    health: 100,
    maxHealth: 100
};

// Sistema de oleadas
const waves = {
    currentWave: 0,
    enemiesToSpawn: 0,
    enemiesAlive: 0,
    waveInProgress: false,
    timeBetweenWaves: 3000, // 3 segundos
    lastWaveTime: 0,
    spawnInterval: 800, // 0.8 segundos entre enemigos
    lastSpawnTime: 0
};

// Balas
const bullets = [];
const bulletSpeed = 10;
const bulletRadius = 5;

// Enemigos
const enemies = [];
const enemyBaseStats = {
    radius: 25,
    speed: 1.5,
    health: 30,
    damage: 0.5,
    color: '#e74c3c'
};

// Teclas
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// Eventos
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.angle = Math.atan2(e.clientY - rect.top - player.y, e.clientX - rect.left - player.x);
});

canvas.addEventListener('click', shoot);

// Iniciar nueva oleada
function startWave() {
    waves.currentWave++;
    waves.enemiesToSpawn = 3 + waves.currentWave * 2;
    waves.enemiesAlive = 0;
    waves.waveInProgress = true;
    waves.lastSpawnTime = 0;
    
    // Aumentar dificultad
    enemyBaseStats.speed += 0.1;
    enemyBaseStats.health += 5;
    
    console.log(`Oleada ${waves.currentWave} iniciada. Enemigos: ${waves.enemiesToSpawn}`);
}

// Generar enemigos
function spawnEnemy(timestamp) {
    if (!waves.waveInProgress || waves.enemiesToSpawn <= 0) return;
    
    if (!waves.lastSpawnTime || timestamp - waves.lastSpawnTime > waves.spawnInterval) {
        // Posición aleatoria en los bordes
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 : canvas.width;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 : canvas.height;
        }

        enemies.push({
            x: x,
            y: y,
            radius: enemyBaseStats.radius,
            color: enemyBaseStats.color,
            speed: enemyBaseStats.speed,
            health: enemyBaseStats.health,
            maxHealth: enemyBaseStats.health,
            damage: enemyBaseStats.damage
        });
        
        waves.enemiesToSpawn--;
        waves.enemiesAlive++;
        waves.lastSpawnTime = timestamp;
        
        console.log(`Enemigo generado. Restantes: ${waves.enemiesToSpawn}`);
    }
}

// Disparar
function shoot() {
    bullets.push({
        x: player.x,
        y: player.y,
        radius: bulletRadius,
        color: '#f1c40f',
        velocity: {
            x: Math.cos(player.angle) * bulletSpeed,
            y: Math.sin(player.angle) * bulletSpeed
        },
        damage: 10
    });
}

// Actualizar jugador
function updatePlayer() {
    if (keys.w) player.y -= player.speed;
    if (keys.s) player.y += player.speed;
    if (keys.a) player.x -= player.speed;
    if (keys.d) player.x += player.speed;

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

// Actualizar enemigos
function updateEnemies() {
    enemies.forEach(enemy => {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;
    });

    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].health <= 0) {
            enemies.splice(i, 1);
            waves.enemiesAlive--;
        }
    }
}

// Actualizar balas
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.velocity.x;
        bullet.y += bullet.velocity.y;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            
            if (dist < enemy.radius + bullet.radius) {
                enemy.health -= bullet.damage;
                bullets.splice(i, 1);
                break;
            }
        }

        if (bullet.x < 0 || bullet.x > canvas.width || 
            bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
}

// Verificar fin de oleada
function checkWaveCompletion() {
    if (waves.waveInProgress && waves.enemiesToSpawn === 0 && waves.enemiesAlive === 0) {
        waves.waveInProgress = false;
        waves.lastWaveTime = Date.now();
        console.log(`Oleada ${waves.currentWave} completada!`);
        
        setTimeout(() => {
            if (player.health > 0) {
                startWave();
            }
        }, waves.timeBetweenWaves);
    }
}

// Game over
function gameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('¡GAME OVER!', canvas.width/2, canvas.height/2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(`Oleada alcanzada: ${waves.currentWave}`, canvas.width/2, canvas.height/2 + 20);
    
    ctx.fillStyle = '#e74c3c';
    ctx.font = '20px Arial';
    ctx.fillText('Haz clic para reiniciar', canvas.width/2, canvas.height/2 + 60);
    
    canvas.addEventListener('click', () => {
        document.location.reload();
    }, { once: true });
}

// Dibujar HUD
function drawHUD() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 20, 200, 30);
    ctx.fillStyle = player.health > 30 ? '#2ecc71' : '#e74c3c';
    ctx.fillRect(20, 20, 200 * (player.health / player.maxHealth), 30);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(20, 20, 200, 30);
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Salud: ${Math.floor(player.health)}/${player.maxHealth}`, 30, 40);
    ctx.fillText(`Oleada: ${waves.currentWave}`, 20, 70);
    ctx.fillText(`Enemigos: ${waves.enemiesAlive}`, 20, 90);
}

// Dibujar mensaje entre oleadas
function drawWaveMessage() {
    if (!waves.waveInProgress && waves.currentWave > 0) {
        const timeLeft = Math.ceil((waves.timeBetweenWaves - (Date.now() - waves.lastWaveTime)) / 1000);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width/2 - 150, 50, 300, 60);
        ctx.fillStyle = '#f1c40f';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Siguiente oleada en ${timeLeft}...`, canvas.width/2, 90);
    }
}

// Dibujar elementos
function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar balas
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = bullet.color;
        ctx.fill();
    });
    
    // Dibujar enemigos
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        
        // Barra de salud
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, 
                    enemy.radius * 2, 5);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, 
                    enemy.radius * 2 * (enemy.health / enemy.maxHealth), 5);
    });
    
    // Dibujar jugador
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    
    // Dirección
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(
        player.x + Math.cos(player.angle) * player.radius * 2,
        player.y + Math.sin(player.angle) * player.radius * 2
    );
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    drawHUD();
    drawWaveMessage();
}

// Bucle del juego
function gameLoop(timestamp) {
    updatePlayer();
    
    if (!waves.waveInProgress && waves.currentWave === 0) {
        startWave();
    }
    
    if (waves.waveInProgress) {
        spawnEnemy(timestamp);
    }
    
    updateEnemies();
    updateBullets();
    
    // Verificar colisiones jugador-enemigo
    enemies.forEach(enemy => {
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist < player.radius + enemy.radius) {
            player.health -= enemy.damage;
        }
    });
    
    if (player.health <= 0) {
        gameOver();
        return;
    }
    
    checkWaveCompletion();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Iniciar juego
gameLoop(0);

// Redimensionar
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});