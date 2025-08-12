// /js/adminActivities.js
import { getActividades } from './services.js';

export async function initAdminActivities() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const actividadesTableBody = document.getElementById('actividadesTableBody');
    const totalRegistros = document.getElementById('totalRegistros');

    // Aquí almacenaremos todas las actividades traídas del servidor
    let actividades = [];

    try {
        // Obtenemos las actividades desde el backend
        actividades = await getActividades();
        renderTable(actividades);
        llenarCategorias(actividades);
    } catch (error) {
        console.error('Error cargando actividades:', error);
    }

    // Escuchamos cambios en el filtro de categoría
    categoryFilter.addEventListener('change', filtrar);
    searchInput.addEventListener('input', filtrar);

    // Función para filtrar los datos
    function filtrar() {
        const categoriaSeleccionada = categoryFilter.value.toLowerCase();
        const textoBusqueda = searchInput.value.toLowerCase();

        // Filtramos las actividades según categoría y búsqueda por usuario
        const filtradas = actividades.filter(act => {
            const coincideCategoria = categoriaSeleccionada ? act.categoria.toLowerCase() === categoriaSeleccionada : true;
            const coincideBusqueda = act.nombre_usuario.toLowerCase().includes(textoBusqueda);
            return coincideCategoria && coincideBusqueda;
        });

        // Mostramos solo las actividades filtradas
        renderTable(filtradas);
    }

    // Función para renderizar la tabla con los datos
    function renderTable(data) {
        // Limpiamos la tabla antes de volver a llenarla
        actividadesTableBody.innerHTML = '';

        // Por cada actividad creamos una fila <tr> con sus datos
        data.forEach(act => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${act.nombre_usuario}</td>
                <td>${act.categoria}</td>
                <td>${act.nombre_actividad}</td>
                <td>${new Date(act.fecha).toLocaleDateString()}</td>
                <td>${act.duracion_min} min</td>
                <td>${act.descripcion}</td>
            `;
            actividadesTableBody.appendChild(row);
        });

        // Actualizamos el contador de registros visibles
        totalRegistros.textContent = data.length;
    }

    // Función para llenar el select de categorías
    function llenarCategorias(data) {

        // Creamos un array con categorías únicas
        const categoriasUnicas = [...new Set(data.map(act => act.categoria))];
        
        // Agregamos cada categoría como opción en el select
        categoriasUnicas.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categoryFilter.appendChild(option);
        });
    }
}
