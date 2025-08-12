import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from './services.js';

// Array local para almacenar usuarios y estado para saber si se está editando
let usuarios = [];
let isEditing = false;

export function renderUsers(data) {
    const usersTableBody = document.getElementById('usersTableBody');
    const totalUsersCount = document.getElementById('totalUsersCount');

    usersTableBody.innerHTML = '';

    // Recorre cada usuario y genera la fila en HTML
    data.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id_usuario}</td>
        <td>${user.nombre}</td>
        <td>${user.correo}</td>
        <td>${user.rol}</td>
        <td>
          <button class="edit-btn" data-id="${user.id_usuario}">
              <img src="./assets/icons/pencil.png" alt="Edit" class="edit-icon"/>
          </button>
          <button class="delete-btn" data-id="${user.id_usuario}">
              <img src="./assets/icons/trash.png" alt="Delete" class="delete-icon"/>
          </button>
        </td>
      `;
      usersTableBody.appendChild(row);
    });

    // Muestra el número total de usuarios
    totalUsersCount.textContent = data.length;

}

// Función para inicializar la página de usuarios
export async function setupUsersPage() {

  // Referencias a elementos del DOM
  const searchInput = document.getElementById('searchInput');
  // const addUserBtn = document.getElementById('addUserBtn');
  const userModal = document.getElementById('userModal');
  const closeModal = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const userForm = document.getElementById('userForm');
  const userIdInput = document.getElementById('userId');
  const userNameInput = document.getElementById('userName');
  const userEmailInput = document.getElementById('userEmail');
  const userRoleInput = document.getElementById('userRole');

  // Si algún elemento clave no existe, se detiene la inicialización
  if (!searchInput || !addUserBtn || !userModal || !closeModal || !userForm) {
    console.warn("Elementos de usuario no encontrados en DOM");
    return;
  }

  // Carga usuarios desde la API y renderiza tabla
  async function loadUsers() {
    try {
      usuarios = await getUsuarios();
      renderUsers(usuarios);
      addButtonsListeners();
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  // Filtra usuarios según búsqueda
  function filterUsers() {
    const query = searchInput.value.toLowerCase();
    const filtered = usuarios.filter(user =>
      user.nombre.toLowerCase().includes(query) ||
      user.correo.toLowerCase().includes(query)
    );
    renderUsers(filtered);
    addButtonsListeners();
  }

  function openAddModal() {
    isEditing = false;
    modalTitle.textContent = 'Add User';
    userIdInput.value = '';
    userNameInput.value = '';
    userEmailInput.value = '';
    userRoleInput.value = 'user';
    userModal.style.display = 'block';
  }

  // Abre modal para editar un usuario existente
  async function openEditModal(id) {
    isEditing = true;
    modalTitle.textContent = 'Edit User';
    const user = usuarios.find(u => u.id_usuario == id);
    if (!user) return alert('User not found');

    userIdInput.value = user.id_usuario;
    userNameInput.value = user.nombre;
    userEmailInput.value = user.correo;
    userRoleInput.value = user.rol;
    userModal.style.display = 'flex';
  }

  // Elimina un usuario por ID
  async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const ok = await deleteUsuario(id);
      if (ok) {
        usuarios = usuarios.filter(u => u.id_usuario != id);
        renderUsers(usuarios);
        addButtonsListeners();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  // Añade eventos a botones de edición y eliminación
  function addButtonsListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
  }

  // Evento para guardar usuario (crear o actualizar)
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
      nombre: userNameInput.value.trim(),
      correo: userEmailInput.value.trim(),
      rol: userRoleInput.value,
    };
    try {
      if (isEditing) {
        const id = userIdInput.value;
        await updateUsuario(id, userData);
        const idx = usuarios.findIndex(u => u.id_usuario == id);
        if (idx !== -1) usuarios[idx] = { ...usuarios[idx], ...userData };
      } else {
        await createUsuario(userData);
      }
      await loadUsers();
      userModal.style.display = 'none';
    } catch (error) {
      console.error('Error saving user:', error);
    }
  });

  // Eventos para abrir/cerrar modal
  addUserBtn.addEventListener('click', openAddModal);
  closeModal.addEventListener('click', () => {
    userModal.style.display = 'none';
  });
  window.addEventListener('click', e => {
    if (e.target == userModal) userModal.style.display = 'none';
  });

  // Evento de búsqueda
  searchInput.addEventListener('input', filterUsers);

  // Carga inicial de usuarios
  await loadUsers();
}