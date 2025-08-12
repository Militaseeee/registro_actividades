import { initApp, isAuth, setupLoginForm } from "./script";
import { registrarUsuario, createActividades, updateActividad, getActividadesPorUsuario,getUsuarios, countUsuarios, createUsuario, updateUsuario, deleteUsuario } from "./services";
import { setupSearch, renderActividades, updateCompletedActivitiesCount } from './activitiesTable';
import { setDateInputValidation, llenarSelectActividades, formatDateToSave } from './form';
import { initAdminActivities } from './adminActivities';
import { setupUsersPage } from './users';
import { uploadUsuariosCSV } from './services.js';


const routes = {
  "/": "./index.html",
  "/home": './views/home.html',
  "/login": './views/login.html',
  "/register": './views/register.html',
  "/activities": './views/activities.html',
  "/add_activity": '/views/add_activity.html',
  "/about": '/views/about.html',
  "/explore": '/views/explore.html',
  "/upload_user": '/views/upload_user.html',
  "/admin_activities": '/views/admin_activities.html',
  "/users": '/views/users.html',
  "/add_user": '/views/add_user.html',
};

// Main function to load views
export async function navigate(pathname) {

  // Block to replace the values of HTML elements with their respective user role
  const userData = await JSON.parse(localStorage.getItem("UserData"));
  let valRol = false;
  if (userData) {
    document.getElementById("nameUser").textContent = userData.nombre;
    document.getElementById("role").textContent = userData.rol;

    // Ocultar enlace solo si no es admin
    const uploadUserLink = document.querySelector('a[href="/upload_user"]');
    if (userData.rol !== 'admin' && uploadUserLink) {
      uploadUserLink.style.display = 'none';
    }
  }

  
  // Ocultar enlace de Activities para admin
  const activitiesLink = document.querySelector('a[href="/activities"]');
  if (userData && userData.rol === 'admin' && activitiesLink) {
    activitiesLink.style.display = 'none';
  } else if (activitiesLink) {
    // Mostrar para otros roles (por si cambian de rol sin recargar)
    activitiesLink.style.display = 'block';
  }

  // Ocultar enlace de Add Activity para admin
  const addActivityLink = document.querySelector('a[href="/add_activity"]');
  if (userData && userData.rol === 'admin' && addActivityLink) {
    addActivityLink.style.display = 'none';
  } else if (addActivityLink) {
    addActivityLink.style.display = 'block';
  }

  // Bloquear ruta activities para admin
  if (pathname === "/activities" && userData && userData.rol === "admin") {
    // Por ejemplo, redirigir al home o donde quieras
    return navigate("/home");
  }

  // Bloquear ruta add_activity para admin
  if (pathname === "/add_activity" && userData && userData.rol === "admin") {
    return navigate("/home");
  }


  const adminLinks = document.querySelectorAll('.admin-only');
  if (userData && userData.rol === 'admin') {
    // Si es admin, mostramos
    adminLinks.forEach(link => link.style.display = 'flex'); // o block, según tu diseño
  } else {
    // Si no es admin, ocultamos
    adminLinks.forEach(link => link.style.display = 'none');
  }

  // Bloqueo de ruta solo para admins
  const adminOnlyRoutes = ["/admin_activities", "/users", "/add_user", "/upload_user"];
  if (adminOnlyRoutes.includes(pathname)) {
    if (!userData || userData.rol !== "admin") {
      return navigate("/home");
    }
  }

  // If the user is not authenticated, we redirect to login
  if( !isAuth()&& location.pathname === '/register'){
  pathname = '/register'
  } else if(!isAuth) {
      pathname='/login'
  }

  const route = routes[pathname];
  if (!route) return console.error("Invalid route");

  // We load the corresponding HTML view
  const html = await fetch(route).then((res) => res.text());
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // We replace the content dynamically
  const newContent = doc.getElementById("content");
  const content = document.getElementById("content");

  content.innerHTML = newContent ? newContent.innerHTML : doc.body.innerHTML;
  history.pushState({}, "", pathname);

  // We changed avatar and items according to the role in overviews
  if (pathname === "/home" || pathname === "/activities" || pathname === "/add_activity" || pathname === "/about" || pathname === "/upload_user" || pathname === "/admin_activities" || pathname === "/users") {
    
    const changeImg = document.getElementById('changePicture');

    if (userData.rol === "user") {
      changeImg.src = './assets/img/user.png';
    } else if (userData.rol === "admin") {
      changeImg.src = './assets/img/admin2.png';
    }

    // const userBooksLink = document.getElementById("userBooksLink");
    // userBooksLink.style.display = userData.role === "User" ? "flex" : "none";
        
  }

  if (pathname === "/home") {
    // Mostramos nombre y rol
    document.getElementById("userNameHome").textContent = userData.nombre;
    document.getElementById("userRoleHome").innerHTML = `Tu rol: <strong>${userData.rol}</strong>`;
    document.getElementById("userType").textContent = userData.rol;
    
    // Traer actividades solo de este usuario
    const actividades = await getActividadesPorUsuario(userData.id_usuario);
    
    updateCompletedActivitiesCount(actividades);
  }

   // Special settings for login view
  if (pathname === "/login") {
      const main = document.getElementById('content');
      const sidebar = document.getElementById("sidebar");
      sidebar.style.display = "none";
      main.classList.add("login-centered");
      setupLoginForm();
  } else {
      const main = document.getElementById('content');
      const sidebar = document.getElementById("sidebar");
      sidebar.style.display = "flex";
      main.classList.remove("login-centered");
  }

  // We handle the highlighting of the active option of the sidebar
  // Update the .active class in the sidebar
  document.querySelectorAll(".sidebar nav a[data-link]").forEach(link => {
  if (link.getAttribute("href") === pathname) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
    }
  });


  if (pathname === "/register") {
    const main = document.getElementById('content');
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = "none";
    main.classList.add("login-centered");
  }

  // register.js
    if (pathname === "/register") {

    const roles = document.getElementById("registerForm");

    const psw = document.getElementById("password");
    const pswCon = document.getElementById("confirm_password");
    
    roles.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newUser  = {
        "nombre": roles.name.value,
        "correo": roles.email.value,
        "rol": "user",
        "password": roles.password.value,
        // "confirm_password": roles.confirm_password.value,
      };

    //   if (newUser.password !== newUser.confirm_password) {
    //     alert("The password and password confirmation must be the same.");
    //     return;
    //   }
      
      alert("User created successfully! You will be redirected to the login page.");
      await registrarUsuario(newUser);
      navigate("/login");
    });
  }

  // Special logic for book viewing
  if (pathname === "/activities") {

    // renderActividades();

    const changeImg = document.getElementById('changePicture');

    if (userData.rol === "user") {
      changeImg.src = './assets/img/user.png';
    } else if (userData.rol === "admin") {
      changeImg.src = './assets/img/admin2.png';
    }

    await initApp()

    setupSearch();

    switch(userData.rol){
      case 'Admin':

        const deleteWrapper = document.getElementById('addEventsBtn')
        deleteWrapper.style.display = 'block'

        // Hide the "Borrow" buttons for the admin
        document.querySelectorAll(".borrow-btn").forEach((btn) => {
          btn.style.display = "none";
        });

        break;
      case 'User':

        hideActionColumn();

        // Hide edit and delete buttons
        const editButton = document.querySelectorAll('.edit-btn').forEach(btnEdit => {
          btnEdit.style.display = 'none';
        })
        const deleteButton = document.querySelectorAll('.delete-btn').forEach(deleteBtn => {
          deleteBtn.style.display = 'none';
        })

        const addBtn = document.getElementById('addEventsBtn');
        if (addBtn) addBtn.style.display = 'none';

        const actionDelete = document.getElementById('actionDeleteEvent');
        if (actionDelete) actionDelete.style.display = 'none';
  
        break;
        
      default:
        break
    }
  }

  // Logic for the add book view
  if (pathname === "/add_activity") {
    setDateInputValidation(); 

    llenarSelectActividades();

    // Aquí pon esta línea:
    const userData = JSON.parse(localStorage.getItem("UserData"));
    if(userData && userData.id_usuario){
      const inputUser = document.getElementById("id_usuario");
      if(inputUser) inputUser.value = userData.id_usuario;
    }

    const form = document.getElementById("addEventForm");
    
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // We created a new book
      const newActivity  = {
        id_usuario: form.id_usuario.value,
        nombre_actividad: form.nombre_actividad.value,
        fecha: formatDateToSave(form.fecha.value),
        duracion_min: form.duracion_min.value,
        descripcion: form.descripcion.value
        // "borrowedBy": []
      };
      
      await createActividades(newActivity);
      navigate("/activities");
    });

    const goBackBtn = document.getElementById("goBackBtn");
    if (goBackBtn) {
      goBackBtn.addEventListener("click", () => {
        navigate("/activities");
      });
    }
  }

  if (pathname === "/admin_activities") {
    await initAdminActivities();
  }

  if (pathname === "/users") {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = "flex";
    
    const usuarios = await getUsuarios();
    const contador = await countUsuarios();
    
    const totalUsersCount = document.getElementById("totalUsersCount");
    if (totalUsersCount) totalUsersCount.textContent = contador.count || usuarios.length;
    
    await setupUsersPage();

    // 🔹 Aquí manejamos el botón Add New User para SPA
    const addUserBtn = document.getElementById("addUserBtn");
    if (addUserBtn) {
        addUserBtn.addEventListener("click", () => {
            navigate("/add_user");
        });
    }
  }

  if (pathname === "/add_user") {
    // Botón para volver a Users
    const goBackBtn = document.getElementById("goBackBtn");
    if (goBackBtn) {
        goBackBtn.addEventListener("click", () => {
            navigate("/users");
        });
    }

    // Manejar envío de formulario
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newUser = {
                nombre: document.getElementById('userName').value.trim(),
                correo: document.getElementById('userEmail').value.trim(),
                rol: document.getElementById('userRole').value
            };

            try {
                await createUsuario(newUser);
                alert('Usuario agregado con éxito');
                navigate('/users'); // SPA, no recarga
            } catch (err) {
                console.error('Error creando usuario:', err);
                alert('No se pudo agregar el usuario');
            }
        });
    }
  }


  if (pathname === "/upload_user") {
    // Aquí asegúrate que el DOM ya tiene el formulario
    const csvForm = document.getElementById('csvForm');
    if (csvForm) {
      // Escuchamos el evento de envío del formulario
      csvForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenimos el envío tradicional para manejarlo por JavaScript

        // Obtenemos el archivo CSV que el usuario seleccionó
        const fileInput = document.getElementById('csvFile');
        const file = fileInput.files[0];

        // Validamos que realmente haya un archivo seleccionado
        if (!file) {
          const uploadStatus = document.getElementById('uploadStatus');
          if (uploadStatus) uploadStatus.textContent = 'Por favor selecciona un archivo CSV.';
          return; // Detenemos la ejecución si no hay archivo
        }

        // Preparamos los datos para enviarlos al servidor
        const formData = new FormData();
        formData.append('csvFile', file);

        try {
          // Enviamos el archivo al backend usando la función uploadUsuariosCSV
          const data = await uploadUsuariosCSV(formData);
          
          // Mostramos el mensaje devuelto por el servidor
          const uploadStatus = document.getElementById('uploadStatus');
          if (data.message) {
            uploadStatus.textContent = data.message;
          } else {
            uploadStatus.textContent = 'Error: no se recibió respuesta correcta';
          }
        } catch (err) {
          // Mostramos un mensaje de error si hubo problema de red o servidor
          const uploadStatus = document.getElementById('uploadStatus');
          uploadStatus.textContent = 'Error de red o servidor.';
          console.error(err);
        }
      });
    }
  }


}