import { createUsuario } from './services.js';

// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {

    // Obtiene la referencia al formulario de usuario (agregar/crear usuario)
    const userForm = document.getElementById('userForm');
    // Obtiene la referencia al botón de "Volver"
    const goBackBtn = document.getElementById('goBackBtn');

    goBackBtn.addEventListener('click', () => {
        window.location.href = 'users.html';
    });

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Crea un objeto con los datos del nuevo usuario
        const newUser = {
            nombre: document.getElementById('userName').value.trim(),
            correo: document.getElementById('userEmail').value.trim(),
            rol: document.getElementById('userRole').value
        };

        try {
            // Llama a la función que hace la petición para guardar el usuario en el backend
            await createUsuario(newUser);
            alert('Usuario agregado con éxito');
            // Redirige de nuevo a la página de listado de usuarios
            window.location.href = 'users.html';
        } catch (err) {
            console.error('Error creando usuario:', err);
            alert('No se pudo agregar el usuario');
        }
    });
});
