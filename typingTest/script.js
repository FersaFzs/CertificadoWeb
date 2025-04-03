const palabras = [
    "hola", "mundo", "código", "programación", "teclado", "ratón", 
    "pantalla", "desarrollador", "javascript", "html", "css", "web", 
    "función", "variable", "bucle", "condicional", "array", "objeto", 
    "clase", "método", "estilo", "documento", "consola", "evento", 
    "escucha", "botón", "texto", "random", "número", "string", "boolean", 
    "verdadero", "falso", "nulo", "tiempo", "fecha", "error", "correcto", 
    "incorrecto", "ejemplo", "prueba", "resultado", "valor", "tipo", 
    "operador", "comparación", "lógico", "aritmética", "concatenación", 
    "matriz", "elemento", "carácter", "registro", "tabla", "fila", "columna", 
    "contenido", "mensaje", "alerta", "usuario", "contraseña", "seguridad", 
    "enlace", "navegador", "cookie", "sesión", "petición", "respuesta", 
    "servidor", "cliente", "api", "red", "conexión", "página", "enlace", 
    "formulario", "botón", "panel", "navegación", "controlador", "visualización", 
    "interfaz", "diseño", "estilo", "propiedad", "valor", "tema", "opción", 
    "selección", "arrastrar", "soltar", "reporte", "grupo", "menú", "barra", 
    "filtro", "buscador", "categoría", "fecha", "hora", "cargar", "guardar", 
    "borrar", "editar", "actualizar", "reemplazar", "código", "comentario", 
    "funcionalidad", "desplazar", "hover", "foco", "móvil", "responsive", 
    "tamaño", "pantalla", "componente", "posición", "alineación", "márgenes", 
    "bordes", "sombra", "transición", "animación", "declaración", "inicialización", 
    "asignación", "valor", "referencia", "índice", "clave", "valor", "banco", 
    "base", "origen", "destino", "configuración", "ajuste", "respaldo", 
    "sincronización", "método", "constructor", "herencia", "polimorfismo", 
    "interfaz", "clase", "objeto", "instancia", "acceso", "privado", 
    "público", "protegido", "final", "transparente", "parámetro", "argumento", 
    "valor", "referencia", "construir", "fácil", "dificultad", "algoritmo",
    "el", "la", "los", "las", "un", "una", "unos", "unas", "este", "esta", 
    "estos", "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", 
    "aquellos", "aquellas", "yo", "tú", "él", "ella", "nosotros", "nosotras", 
    "vosotros", "vosotras", "ellos", "ellas", "me", "te", "lo", "la", 
    "nos", "os", "los", "las", "le", "les", "su", "mis", "tus", "sus", 
    "nuestro", "nuestra", "nuestros", "nuestras", "vuestro", "vuestra", 
    "vuestros", "vuestras", "mío", "mía", "tuyo", "tuya", "suyo", "suya", 
    "nuestro", "nuestra", "vuestro", "vuestra", "quien", "cual", "que", 
    "como", "cuando", "donde", "por qué", "porque", "aunque", "pero", "sin embargo", 
    "también", "además", "al", "del", "en", "para", "por", "sobre", "entre", 
    "tras", "con", "sin", "según", "hasta", "desde", "durante", "antes", 
    "después", "luego", "si", "ni", "o", "y", "pero", "aunque", "como", 
    "mientras", "cuando", "donde", "dondequiera"
  ];
  
  

  const textToType = document.getElementById("text-to-type");
  const userInput = document.getElementById("user-input");
  const progressBar = document.getElementById("progress-bar");
  const timeDisplay = document.getElementById("time");
  const wpmDisplay = document.getElementById("wpm");
  const accuracyDisplay = document.getElementById("accuracy");
  const startBtn = document.getElementById("start-btn");
  const nuevoTextoBtn = document.getElementById("nuevo-texto-btn");
  
 
  let currentCharIndex = 0;
  let mistakes = 0;
  let isTyping = false;
  let timer;
  let timeLeft = 60;
  

  function generarTextoAleatorio(numPalabras = 30) {
    let texto = "";
    for (let i = 0; i < numPalabras; i++) {
      const palabraAleatoria = palabras[Math.floor(Math.random() * palabras.length)];
      texto += palabraAleatoria + " ";
    }
    return texto.trim();
  }
  

  function actualizarTexto() {
    const textoAleatorio = generarTextoAleatorio();
    textToType.innerHTML = "";
  

    textoAleatorio.split("").forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      textToType.appendChild(span);
    });
  

    currentCharIndex = 0;
    mistakes = 0;
    progressBar.style.width = "0%";
    userInput.value = "";
    userInput.disabled = true;
    isTyping = false;
    clearInterval(timer);
    timeLeft = 60;
    timeDisplay.textContent = timeLeft;
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "0";
  }
  

  function startTest() {
    if (isTyping) return;
    isTyping = true;
    userInput.disabled = false;
    userInput.focus();
    timeLeft = 60;
    timeDisplay.textContent = timeLeft;
  

    timer = setInterval(() => {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
  
      if (timeLeft <= 0) {
        clearInterval(timer);
        userInput.disabled = true;
        isTyping = false;
      }
    }, 1000);
  }
  

  function handleInput(e) {
    const chars = textToType.querySelectorAll("span");
    const userText = userInput.value;
  

    if (currentCharIndex === 0) {
      chars[0].classList.add("current");
    }
  
 
    if (currentCharIndex >= chars.length) {
      const textoActual = textToType.textContent;
      const nuevoTexto = generarTextoAleatorio(15);
      textToType.innerHTML = "";
  
      (textoActual + " " + nuevoTexto).split("").forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;
        textToType.appendChild(span);
      });
  
      currentCharIndex = userText.length;
      const newChars = textToType.querySelectorAll("span");
      newChars[currentCharIndex]?.classList.add("current");
      

      ajustarScroll();
      return;
    }
  
    //Verifico caracter actual
    const currentChar = chars[currentCharIndex].textContent;
    const userChar = userText[currentCharIndex];
  
    if (userChar === currentChar) {
      chars[currentCharIndex].classList.add("correct");
      chars[currentCharIndex].classList.remove("incorrect", "current");
      currentCharIndex++;
    } else {
      chars[currentCharIndex].classList.add("incorrect", "current");
      mistakes++;
    }
  
    updateProgressBar(currentCharIndex, chars.length);
    updateStats(userText);
  

    if (currentCharIndex < textToType.querySelectorAll("span").length) {
      textToType.querySelectorAll("span")[currentCharIndex]?.classList.add("current");
      ajustarScroll(); 
    }
  }
  
  function ajustarScroll() {
    const chars = textToType.querySelectorAll("span");
    if (chars[currentCharIndex]) {
      chars[currentCharIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }
  

  function handleBackspace() {
    const chars = textToType.querySelectorAll("span");
    if (currentCharIndex > 0) {
      currentCharIndex--;
      chars[currentCharIndex].classList.remove("correct", "incorrect");
      chars[currentCharIndex].classList.add("current");
      updateProgressBar(currentCharIndex, chars.length);
    }
  }
  

  function updateProgressBar(current, total) {
    const progress = (current / total) * 100;
    progressBar.style.width = `${progress}%`;
  }
  

  function updateStats(userText) {
    const correctChars = userText.length - mistakes;
    const accuracy = (correctChars / userText.length) * 100 || 0;
    accuracyDisplay.textContent = accuracy.toFixed(2);
  
    const minutes = (60 - timeLeft) / 60;
    const wpm = Math.round((correctChars / 5) / minutes) || 0;
    wpmDisplay.textContent = wpm;
  }
  

  startBtn.addEventListener("click", startTest);
  nuevoTextoBtn.addEventListener("click", actualizarTexto);
  userInput.addEventListener("input", handleInput);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      handleBackspace();
    }
  });
  

  window.addEventListener("DOMContentLoaded", actualizarTexto);