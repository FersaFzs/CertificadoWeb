const apiKey = "525940e33dffd67de64baae00c237657";

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

        const data = await respuesta.json();

        if (respuesta.ok) {
            document.getElementById("nombreCiudad").textContent = data.name;
            document.getElementById("temperatura").textContent = `🌡️ ${data.main.temp} ºC`;
            document.getElementById("descripcion").textContent = data.weather[0].description;
            document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        } else {
            alert("Ciudad no encontrada.");
        }
    } catch (error){
        console.error("Error obteniendo el clima", error);
        alert("Hubo un problema al obtener los datos del clima");
    }
}