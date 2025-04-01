const apiKey = "30cfec248db247e3af383631250104";

document.getElementById("getClima").addEventListener("click", () => {
    const ciudad = document.getElementById("ciudad").value;

    if(ciudad){
        getClima(ciudad);
    } else {
        alert("Por favor, introduce una ciudad");
    }
});

async function getClima(city){
    try {
        const respuesta = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`
        );

        const datos = await respuesta.json();

        if (respuesta.ok) {
            document.getElementById("nombreCiudad").textContent = datos.name;
            document.getElementById("temperatura").textContent = `🌡️ ${datos.main.temp} ºC`;
            document.getElementById("descripcion").textContent = datos.weather[0].description;
            document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        } else {
            alert("Ciudad no encontrada.");
        }
    } catch (error){
        console.error("Error obteniendo el clima", error);
        alert("Hubo un problema al obtener los datos del clima");
    }
}