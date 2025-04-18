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

// Elementos del DOM
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
let textoCompleto = []; // Array para almacenar todas las palabras generadas
let palabrasVisibles = 20; // Número inicial de palabras visibles (ajustable)

function generarPalabrasAleatorias(numPalabras) {
  const resultado = [];
  for (let i = 0; i < numPalabras; i++) {
    const palabraAleatoria = palabras[Math.floor(Math.random() * palabras.length)];
    resultado.push(palabraAleatoria);
  }
  return resultado;
}

function renderizarTexto() {
  textToType.innerHTML = "";
  const textoVisible = textoCompleto.slice(0, palabrasVisibles).join(" ");
  textoVisible.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    // Aplicar clases según el estado del carácter
    if (index < currentCharIndex && userInput.value[index] === char) {
      span.classList.add("correct");
    } else if (index < currentCharIndex) {
      span.classList.add("incorrect");
    } else if (index === currentCharIndex) {
      span.classList.add("current");
    }
    textToType.appendChild(span);
  });
  ajustarScroll();
}

function actualizarTexto() {
  textoCompleto = generarPalabrasAleatorias(30); // Genera 30 palabras iniciales
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
  renderizarTexto();
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

  const currentChar = chars[currentCharIndex]?.textContent;
  const userChar = userText[currentCharIndex];

  if (!currentChar) return; // Evitar errores si no hay más caracteres visibles

  // Limpiar la clase 'current' del carácter actual
  chars[currentCharIndex].classList.remove("current");

  // Procesar el carácter actual antes de cualquier regeneración
  if (userChar === currentChar) {
    chars[currentCharIndex].classList.add("correct");
    chars[currentCharIndex].classList.remove("incorrect");
    currentCharIndex++;
  } else if (userChar !== undefined) {
    chars[currentCharIndex].classList.add("incorrect");
    chars[currentCharIndex].classList.remove("correct");
    chars[currentCharIndex].classList.add("current"); // Mantener el seguidor si hay error
    mistakes++;
  }

  // Verificar si necesitamos regenerar texto
  const palabrasEscritas = userText.split(" ").filter(Boolean).length;
  if (palabrasEscritas >= palabrasVisibles - 5) {
    textoCompleto.push(...generarPalabrasAleatorias(5)); // Añadir 5 palabras nuevas
    palabrasVisibles += 5;
    renderizarTexto(); // Re-renderiza con el nuevo texto
    // Actualizar el seguidor después de renderizar
    const nuevosChars = textToType.querySelectorAll("span");
    if (nuevosChars[currentCharIndex]) {
      nuevosChars[currentCharIndex].classList.add("current");
    }
  } else {
    // Si no se regenera, avanzar el seguidor normalmente (solo si fue correcto)
    if (userChar === currentChar && chars[currentCharIndex]) {
      chars[currentCharIndex].classList.add("current");
    }
  }

  updateProgressBar(currentCharIndex, textoCompleto.join(" ").length);
  updateStats(userText);
  ajustarScroll();
}

function renderizarTexto() {
  textToType.innerHTML = ""; // Limpiar el DOM
  const textoVisible = textoCompleto.slice(0, palabrasVisibles).join(" ");
  textoVisible.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    if (index < currentCharIndex && userInput.value[index] === char) {
      span.classList.add("correct");
    } else if (index < currentCharIndex) {
      span.classList.add("incorrect");
    } else if (index === currentCharIndex) {
      span.classList.add("current");
    }
    textToType.appendChild(span);
  });
  ajustarScroll();
}
function ajustarScroll() {
  const chars = textToType.querySelectorAll("span");
  if (chars[currentCharIndex]) {
    chars[currentCharIndex].scrollIntoView({
      behavior: "smooth",
      block: "center", // Centrar la palabra actual
    });
  }
}

function handleBackspace() {
  const chars = textToType.querySelectorAll("span");
  if (currentCharIndex > 0) {
    chars[currentCharIndex].classList.remove("current"); // Quitar 'current' del actual
    currentCharIndex--;
    chars[currentCharIndex].classList.remove("correct", "incorrect");
    chars[currentCharIndex].classList.add("current"); // Marcar el anterior como actual
    updateProgressBar(currentCharIndex, textoCompleto.join(" ").length);
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

// Event Listeners
startBtn.addEventListener("click", startTest);
nuevoTextoBtn.addEventListener("click", actualizarTexto);
userInput.addEventListener("input", handleInput);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Backspace") handleBackspace();
});

window.addEventListener("DOMContentLoaded", actualizarTexto);