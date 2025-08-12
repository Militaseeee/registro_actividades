import { uploadUsuariosCSV } from './services.js';

// Obtenemos el formulario de carga de CSV
const csvForm = document.getElementById('csvForm');

// Elemento donde mostraremos el estado del envío
const uploadStatus = document.getElementById('uploadStatus');

// Escuchamos el evento de envío del formulario
csvForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('csvFile'); // Input de tipo file
  // Obtenemos el archivo seleccionado
  const file = fileInput.files[0];

  // Validamos que el usuario haya seleccionado un archivo
  if (!file) {
    uploadStatus.textContent = 'Por favor selecciona un archivo CSV.';
    return;
  }

  // Creamos un objeto FormData para enviar el archivo al backend
  const formData = new FormData();
  formData.append('csvFile', file); // Asociamos el archivo con el nombre esperado por el servidor

  try {
    // Llamamos a la API para subir el CSV
    const data = await uploadUsuariosCSV(formData);

    // Mostramos el mensaje que devuelve el servidor
    if (data.message) {
      uploadStatus.textContent = data.message;
    } else {
      uploadStatus.textContent = 'Error: no se recibió respuesta correcta';
    }
  } catch (err) {
    // Capturamos errores de conexión o servidor
    uploadStatus.textContent = 'Error de red o servidor.';
    console.error(err);
  }
});
