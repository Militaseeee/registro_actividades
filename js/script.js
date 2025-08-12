import { renderActividades, updateCompletedActivitiesCount } from "./activitiesTable";
import { navigate } from "./navigate";
import { getActividadesPorUsuario, getUsuarios, loginUsuario } from './services';
import { setListeners } from './form';

// INIT APP
export async function initApp() {
  console.log("🚀 initApp executed from script.js");

  // Obtenemos los datos del usuario desde el almacenamiento local
  const userData = JSON.parse(localStorage.getItem("UserData"));

  // Cargamos las actividades del usuario autenticado
  const actividades = await getActividadesPorUsuario(userData.id_usuario);

  renderActividades(actividades); // Renderizamos las actividades en la tabla
  updateCompletedActivitiesCount(actividades); // Actualizamos el conteo de actividades completadas
  setListeners(); // Configuramos los listeners de formularios u otros elementos
}

// Function to check if the user is authenticated
export function isAuth() {
  const result = localStorage.getItem("Auth") || null;
  const resultBool = result === 'true'
  return resultBool;
}

// Setup the login form
export function setupLoginForm() {
  const form = document.getElementById("login");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtenemos los valores ingresados en los campos
    const correo = document.getElementById("user").value;
    const contrasena = document.getElementById("password").value;

    try {
      // Enviamos la solicitud de inicio de sesión al backend
      const res = await loginUsuario({ correo, contrasena });

      if (res.mensaje === "Login exitoso") {
        
        const usuarios = await getUsuarios(); // buscar el usuario completo
        const usuarioEncontrado = usuarios.find(u => u.correo === correo);
      
        if (usuarioEncontrado) {

          // Guardamos la sesión en el almacenamiento local
          localStorage.setItem("Auth", "true");
          localStorage.setItem("UserData", JSON.stringify(usuarioEncontrado));
          
          navigate("/home"); // Redirigimos a la página principal
        } else {
          alert("No se pudo encontrar el usuario en la base de datos");
        }
      } else {
        alert("Correo o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error al intentar loguearse:", error);
    }
  });
}

// Sign out
const buttonCloseSession = document.getElementById("logout");
buttonCloseSession.addEventListener("click", () => {
  localStorage.setItem("Auth", "false");
  localStorage.removeItem("UserData");
  navigate("/login");
});

// Hide the entire action column (header + cells)
export function hideActionColumn() {
  const th = document.getElementById("actionHide");
  if (th) th.style.display = "none";

  // Find the index of the stock column
  const columnIndex = [...th.parentElement.children].indexOf(th);

  // Hide each <td> at that same position in the <tbody>
  const rows = document.querySelectorAll("#eventTableBody tr");
  rows.forEach((row) => {
    const cells = row.children;
    if (cells[columnIndex]) {
      cells[columnIndex].style.display = "none";
    }
  });
}

// SPA Navigation
document.body.addEventListener("click", (e) => {
  if (e.target.closest("[data-link]")) {
    e.preventDefault();
    const path = e.target.closest("[data-link]").getAttribute("href");
    navigate(path);
  }
});

window.addEventListener("popstate", () => {
  navigate(location.pathname);
});

// navigate(location.pathname);
const initialPath = isAuth() ? location.pathname : "/login";
navigate(initialPath);