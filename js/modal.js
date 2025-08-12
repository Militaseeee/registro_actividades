import { getActividades } from "./services";
import { formatDateInput, llenarSelectActividades } from "./form";

// Function that opens the edit modal and loads the book data
export async function openModalEdit(id) {
    const events = await getActividades();
    const event = events.find((u) => u.id_registro == id);// Buscamos el libro con el ID especificado
    if (!event) return;

     // Cargar actividades en el select (esto rellena las opciones)
    await llenarSelectActividades();

    // We load the book values into the form
    document.getElementById("categoryId").value = event.id_registro;
    document.getElementById("nombre_actividad").value = event.nombre_actividad;
    document.getElementById("date").value = formatDateInput(event.fecha);
    document.getElementById("duration").value = event.duracion_min || '';
    document.getElementById("description").value = event.descripcion || '';

    // We changed the title of the modal to "Edit event"
    document.getElementById("modalTitle").textContent = "Edit event";
    document.getElementById("bookModal").style.display = "flex";
}

// Function that closes the modal and clears the form
export function closeModal() {
    const modal = document.getElementById("bookModal");
    modal.style.display = "none";

    // Clears the form when it is closed
    const form = document.getElementById("eventForm");
    if (form) {
        form.reset();

        const categoryIdInput = document.getElementById("categoryId");
        if (categoryIdInput) categoryIdInput.value = "";

        const capacityInput = document.getElementById("capacity");
        if (capacityInput) capacityInput.value = "";
    }
}