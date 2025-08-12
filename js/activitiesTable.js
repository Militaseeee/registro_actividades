import { getActividadesPorUsuario, updateActividad, deleteActividad } from "./services";
import { openModalEdit } from "./modal";

// Function to render the books table
// Render actividades
export function renderActividades(actividades) {
    const tbody = document.getElementById("eventTableBody");
    if (!tbody) return; // Si no existe el tbody, salimos de la función

    tbody.innerHTML = "";

    // We get the current role
    const userData = JSON.parse(localStorage.getItem("UserData"));
    const isAdmin = userData && userData.role === "admin";


    // console.log("📦 Actividades desde backend:", actividades);
    // console.log("👤 Usuario logueado:", userData);

    // We go through the list of books
    actividades.forEach((act) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="./assets/img/concert.jpeg" alt="Avatar" /></td>
            <td>${act.categoria}</td>
            <td>${act.nombre_actividad}</td>
            <td>${act.fecha.split('T')[0]}</td>
            <td>${act.duracion_min || ''}</td>
            <td>${act.descripcion || ''}</td>

            ${userData ? `
                <td>
                    <button class="edit-btn" data-id="${act.id_registro}">
                        <img src="./assets/icons/pencil.png" alt="Edit" class="edit-icon"/>
                    </button>
                    <button class="delete-btn" data-id="${act.id_registro}">
                        <img src="./assets/icons/trash.png" alt="Delete" class="delete-icon"/>
                    </button>
                </td>
            ` : ""}
            `;
        tbody.appendChild(row); // We add the row to the body of the table
    });
    addRowListeners(); // We activate the listeners for the buttons

}

// Function that adds listeners to the buttons in each row
export function addRowListeners() {
    // Listener for edit button
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            openModalEdit(id);
        });
    });

    // Listener for delete button
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (confirm("¿Estás seguro de eliminar esta actividad?")) {
                const success = await deleteActividad(id);
                if (success) {
                    const userData = JSON.parse(localStorage.getItem("UserData"));
                    const actividades = await getActividadesPorUsuario(userData.id_usuario);
                    renderActividades(actividades);
                    updateCompletedActivitiesCount(actividades);
                } else {
                    alert("Error eliminando la actividad");
                }
            }
        });
    });

    // Listener for the book loan button
    document.querySelectorAll(".borrow-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {

            const id = btn.dataset.id;
            const userData = JSON.parse(localStorage.getItem("UserData")); // Obtenemos los datos del usuario

            if (!userData) return alert("You must be logged in");
            // const events = await getActividades();
            const events = await getEvents();
            const event = events.find((b) => b.id == id);
            if (!event) return;

            if (event.borrowedBy && event.borrowedBy.length > 0) {
                alert("Event already borrowed!");
                return;
            }

            // We create a new book object updated with the user's name
            const updatedEvent = {
                ...event,
              borrowedBy: [userData.name], // We leave it as an array so that it is compatible with your db.json
            };

            await updateEvent(event.id, updatedEvent); // This must do a PUT or PATCH

            // const updatedEvents = await getActividades();
            const updatedEvents = await getEvents();
            renderEvents(updatedEvents);
            updateCompletedActivitiesCount(updatedEvents);
        });
    });
}

// Function that updates the available books counter

// updateAvailableBooksCount

export function updateCompletedActivitiesCount(events) {
    const countSpan = document.getElementById("availableCount");
    if (countSpan) countSpan.textContent = events.length;
}

// Function to configure the search bar
// Search bar logic
export function setupSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", async () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        const userData = JSON.parse(localStorage.getItem("UserData"));
        const userActivities = await getActividadesPorUsuario(userData.id_usuario); // ✅ solo actividades del usuario

        const filtered = userActivities.filter((act) =>
            act.nombre_actividad.toLowerCase().includes(searchTerm) ||
            act.categoria.toLowerCase().includes(searchTerm)
        );

        renderActividades(filtered);
    });
}