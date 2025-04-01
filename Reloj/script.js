console.log("script cargado correctamente");

function updateTime(){
    const now = new Date();
    let hora = now.getHours().toString().padStart(2, '0');
    let min = now.getMinutes().toString().padStart(2, '0');
    let sec = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('tiempo').textContent = `${hora}:${min}:${sec}`;
}

setInterval(updateTime, 1000);

updateTime();

const cambiarTema = document.getElementById('tema');
const body = document.body;

cambiarTema.addEventListener('click', () => {
    body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')){
        cambiarTema.textContent = "Cambiar tema 🌒"
    } else {
        cambiarTema.textContent = "Cambiar tema ☀️"
    }
});