import { getActividadesDisponibles, createActividades, getActividades, updateActividad, getActividadesPorUsuario } from "./services";
import { closeModal } from "./modal";
import { renderActividades } from "./activitiesTable";
import { navigate } from "./navigate";
// import { counterId } from "./script";

// FORM LOGIC
// Main logic of the form
export function setListeners() {
    // We get the necessary DOM elements
    const addBtn = document.getElementById("addEventsBtn");
    const closeBtn = document.querySelector(".close-btn");
    const modal = document.getElementById("bookModal");
    const form = document.getElementById("eventForm");

     // If the add activity button exists, we add an event to navigate to the form
    if (addBtn) {
        addBtn.addEventListener("click", () => navigate("/add_activity"));
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (modal) {
        window.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Listener to submit the form (create or edit book)
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id_registro = document.getElementById("categoryId").value;

            const userData = JSON.parse(localStorage.getItem("UserData"));
            if (!userData) {
                alert("Usuario no autenticado");
                return;
            }

            // If the book already exists (edit mode), we recover its loan status
            if (id_registro) {
                const events = await getActividades();
                const existingActivity = events.find((b) => b.id_registro == id_registro);
                // borrowedBy = existingBook?.borrowedBy || []; // We maintain the original state
            }
            
            // We create the book object with the form data
            const data = {
                id_usuario: userData.id_usuario,
                nombre_actividad: document.getElementById("nombre_actividad").value,
                fecha: document.getElementById("date").value,
                duracion_min: parseInt(document.getElementById("duration").value),
                descripcion: document.getElementById("description").value
            };

            
            if (id_registro) {
                // Modo EDICIÓN
                await updateActividad(id_registro, data);
                alert("Actividad actualizada correctamente");
            } else {
                // Modo CREACIÓN
                await createActividades(data);
                alert("Actividad creada correctamente");
            }

            const eventos = await getActividadesPorUsuario(userData.id_usuario);
            renderActividades(eventos);
            closeModal();

        });
    }
}


export async function llenarSelectActividades() {
  const selectActividad = document.getElementById("nombre_actividad");

  selectActividad.innerHTML = '<option value="" disabled selected>Seleccione una actividad</option>';
  try {
    const actividades = await getActividadesDisponibles();

    actividades.forEach(act => {
      // Suponiendo que 'nombre_actividad' o 'nombre' es el nombre que quieres mostrar
      const option = document.createElement("option");
      option.value = act.nombre_actividad || act.nombre; // ajusta según la estructura de tu respuesta
      option.textContent = act.nombre_actividad || act.nombre;
      selectActividad.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar actividades", error);
  }
}


// Function that formats the date to save it in the format: day-month abbreviated-year
export const formatDateToSave = (inputDate) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const [year, month, day] = inputDate.split("-"); // We split the date string
    const monthAbbr = months[parseInt(month, 10) - 1]; // We get the shortened name

    return `${day}-${monthAbbr}-${year}`;
}

// Function that validates that a future date cannot be selected
export function setDateInputValidation() {
    const dateInput = document.getElementById("fecha");
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0]; // Today's date in "yyyy-mm-dd" format
        dateInput.max = today; // We set the maximum allowed value (today)

        // We listen if a future date is entered
        dateInput.addEventListener("input", () => {
            if (dateInput.value > today) {
                alert("You cannot select a future date");
                dateInput.value = today;
            }
        });
    }
}   

// Función que convierte una fecha estilo "dd-Mmm-yyyy" a formato válido para input type="date"
export function formatDateInput(dateStr) {
    setDateInputValidation();
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0]; // para que funcione en inputs type="date"
}
