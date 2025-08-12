// URL base de la API
const BASE_URL = 'http://localhost:3000';

// ===================== USUARIOS =====================


// Obtenemos todos los usuarios
export async function getUsuarios() {
    const res = await fetch(`${BASE_URL}/usuarios`);
    return res.json();
}

// Obtenemos el conteo total de usuarios
export async function countUsuarios() {
    const res = await fetch(`${BASE_URL}/usuarios/count`);
    return res.json();
}

// Creamos un nuevo usuario
export async function createUsuario(usuario) {
    const res = await fetch(`${BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    return res.json();
}

// Actualizamos un usuario existente por su ID
export async function updateUsuario(id, usuario) {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    return res.json();
}

// Eliminamos un usuario por su ID
export async function deleteUsuario(id) {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
        method: 'DELETE' });
    return res.ok;
}

// Registramos un nuevo usuario (ruta pública de registro)
export async function registrarUsuario(data) {
    const res = await fetch(`${BASE_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Iniciamos sesión (login)
export async function loginUsuario(data) {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}


// ===================== ACTIVIDADES =====================

// Obtenemos todas las actividades (para la vista de administrador)
export async function getActividades() {
    const res = await fetch(`${BASE_URL}/actividades`);
    return res.json();
}

// Obtenemos las actividades de un usuario específico
export async function getActividadesPorUsuario(id_usuario) {
    const res = await fetch(`${BASE_URL}/actividades/usuario/${id_usuario}`);
    return res.json();
}

// Obtenemos actividades disponibles para registrar
export async function getActividadesDisponibles() {
    const res = await fetch(`${BASE_URL}/actividades-disponibles`);
    return res.json();
}

// Registramos una nueva actividad para un usuario
export async function createActividades(data) {
    const res = await fetch(`${BASE_URL}/registro-actividad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Actualizamos el registro de una actividad por su ID
export async function updateActividad(id_registro, data) {
    const res = await fetch(`${BASE_URL}/registro-actividad/${id_registro}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Eliminamos una actividad por su ID de registro
export async function deleteActividad(id_registro) {
    const res = await fetch(`${BASE_URL}/eliminar-actividad/${id_registro}`, {
        method: 'DELETE',
    });
    return res.ok;
}

// ===================== IMPORTACIÓN MASIVA =====================

// Subimos un archivo CSV con usuarios para importación masiva
export async function uploadUsuariosCSV(formData) {
    const res = await fetch(`${BASE_URL}/upload-usuarios-csv`, {
        method: 'POST',
        body: formData
    });
    return res.json();
}