let correctAnswer = 'A'; // Respuesta correcta
let video = document.getElementById('brainrot-video');
let resultMessage = document.getElementById('result-message');
let nextButton = document.getElementById('next-btn');

function checkAnswer(answer) {
  // Si la respuesta es correcta, reproduce el video
  if (answer === correctAnswer) {
    resultMessage.textContent = "¡Has acertado!";
    video.play();
  } else {
    resultMessage.textContent = "¡Incorrecto! Intenta de nuevo.";
  }
  
  // Deshabilitar los botones después de la respuesta
  disableOptions();
}

function disableOptions() {
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(button => button.disabled = true);
  
  nextButton.style.display = 'inline-block'; // Mostrar el botón de siguiente pregunta
}

function nextQuestion() {
  // Reseteamos el estado para la siguiente pregunta
  video.currentTime = 0; // Vuelve al primer frame
  video.pause(); // Pausa el video
  
  // Reiniciar el mensaje
  resultMessage.textContent = '';
  
  // Volver a habilitar las opciones
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(button => button.disabled = false);
  
  // Reseteamos la respuesta correcta (puedes agregar lógica para cambiarla)
  correctAnswer = 'A'; // Cambiar la respuesta para la siguiente pregunta
  
  nextButton.style.display = 'none'; // Ocultar el botón de siguiente pregunta
}
