// URL base de la API de Rick and Morty
const API_URL = "https://rickandmortyapi.com/api/";

// Variables para almacenar filtros y estado de la aplicación
let busqueda = "";
let tipo = "character";
let status = "";
let gender = "";
let paginaActual = 1;
let totalResultados = 0;

// Función principal para obtener datos desde la API
async function obtenerResultados(busqueda, tipo, pagina) {
    let endpoint = `${API_URL}${tipo}/?`;
    if (busqueda) endpoint += `name=${busqueda}&`;
    if (status) endpoint += `status=${status}&`;
    if (gender) endpoint += `gender=${gender}&`;
    endpoint += `page=${pagina}`;

    try {
        const respuesta = await fetch(endpoint);
        if (!respuesta.ok) throw new Error("Error en la solicitud");

        const datos = await respuesta.json();

        if (datos.results && datos.results.length > 0) {
            totalResultados = datos.info.count;
            mostrarResultados(datos.results, tipo);
            actualizarPaginado(datos.info.pages, pagina);
            actualizarTotalResultados(totalResultados);
        } else {
            mostrarMensaje("No se encontraron resultados para tu búsqueda.");
        }
    } catch (error) {
        mostrarMensaje("Hubo un problema al cargar los datos.");
    }
}

// Función para mostrar resultados en la cuadrícula principal
function mostrarResultados(resultados, tipo) {
    const contenedor = document.getElementById("resultados");
    limpiarResultados(); // Vaciar el contenedor antes de agregar nuevos resultados

    resultados.forEach((item) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow";

        tarjeta.innerHTML = tipo === "character"
            ? `
                <img src="${item.image}" alt="${item.name}" class="imagen-tarjeta">
                <div class="p-4">
                    <h3 class="text-md font-bold text-gray-900 mb-2">${item.name}</h3>
                    <p class="text-sm text-gray-500">Status: ${item.status}</p>
                    <p class="text-sm text-gray-500">Gender: ${item.gender}</p>
                </div>
            `
            : `
                <div class="p-4">
                    <h3 class="text-md font-bold text-gray-900 mb-2">${item.name}</h3>
                    <p class="text-sm text-gray-500">Fecha: ${item.air_date}</p>
                    <p class="text-sm text-gray-500">Código: ${item.episode}</p>
                </div>
            `;
        // Asignar el evento de clic para mostrar más detalles
        tarjeta.addEventListener("click", () => mostrarDetalles(item.id, tipo));
        contenedor.appendChild(tarjeta);
    });
}

// Función para mostrar detalles de un personaje o episodio
async function mostrarDetalles(id, tipo) {
    const endpoint = `${API_URL}${tipo}/${id}`;

    try {
        const respuesta = await fetch(endpoint);
        if (!respuesta.ok) throw new Error("Error en la solicitud");

        const datos = await respuesta.json();
        const detalle = document.getElementById("resultados-seccion");

        detalle.innerHTML = `
            <div class="detalle">
                <img src="${datos.image}" alt="${datos.name}" class="detalle-imagen" />
                <h2 class="text-2xl font-bold">${datos.name}</h2>
                ${
                    tipo === "character"
                        ? `
                            <p><strong>Status:</strong> ${datos.status}</p>
                            <p><strong>Gender:</strong> ${datos.gender}</p>
                            <p><strong>Origin:</strong> ${datos.origin.name}</p>
                            <p><strong>Location:</strong> ${datos.location.name}</p>
                            <p><strong>Episodes:</strong> ${
                                datos.episode
                                    .map(
                                        (ep) =>
                                            `<a href="${ep}" target="_blank">${ep.split('/').pop()}</a>`
                                    )
                                    .join(", ")
                            }</p>
                        `
                        : `
                            <p><strong>Fecha de lanzamiento:</strong> ${datos.air_date}</p>
                            <p><strong>Código:</strong> ${datos.episode}</p>
                            <p><strong>Personajes:</strong> ${
                                datos.characters
                                    .map(
                                        (char) =>
                                            `<a href="${char}" target="_blank">${char.split('/').pop()}</a>`
                                    )
                                    .join(", ")
                            }</p>
                        `
                }
            </div>
        `;
    } catch {
        mostrarMensaje("Hubo un problema al cargar los detalles.");
    }
}

// Función para mostrar/ocultar filtros según el tipo seleccionado
function actualizarVisibilidadFiltros() {
    const tipoSeleccionado = document.getElementById("filtro-tipo").value;
    const contenedorStatus = document.getElementById("contenedor-status");
    const contenedorGender = document.getElementById("contenedor-gender");

    if (tipoSeleccionado === "episode") {
        contenedorStatus.style.display = "none";
        contenedorGender.style.display = "none";
    } else {
        contenedorStatus.style.display = "block";
        contenedorGender.style.display = "block";
    }
}


// Función para actualizar los controles de paginación
function actualizarPaginado(totalPaginas, paginaActual) {
    const infoPagina = document.getElementById("info-pagina");
    if (!infoPagina) return;
    infoPagina.innerText = `Página ${paginaActual} de ${totalPaginas}`;

    document.getElementById("boton-anterior").disabled = paginaActual <= 1;
    document.getElementById("boton-siguiente").disabled = paginaActual >= totalPaginas;
    document.getElementById("boton-primera").disabled = paginaActual <= 1;
    document.getElementById("boton-ultima").disabled = paginaActual >= totalPaginas;
}

// Función para limpiar el contenedor de resultados
function limpiarResultados() {
    document.getElementById("resultados").innerHTML = "";
}

// Función para mostrar el total de resultados
function actualizarTotalResultados(total) {
    document.getElementById("total-resultados").innerText = `${total} RESULTADOS`;
}

// Función para mostrar mensajes de error o información
function mostrarMensaje(mensaje) {
    limpiarResultados();
    const contenedor = document.getElementById("resultados");
    const mensajeElemento = document.createElement("p");
    mensajeElemento.className = "text-center text-red-500 font-bold";
    mensajeElemento.textContent = mensaje;
    contenedor.appendChild(mensajeElemento);
}

// Control de modo claro/oscuro
const iconoOscuro = document.getElementById("icono-modo-oscuro");
const iconoClaro = document.getElementById("icono-modo-claro");

// Activar modo oscuro
iconoOscuro.addEventListener("click", () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("modo", "oscuro");
    iconoOscuro.classList.add("hidden");
    iconoClaro.classList.remove("hidden");
});

// Activar modo claro
iconoClaro.addEventListener("click", () => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("modo", "claro");
    iconoClaro.classList.add("hidden");
    iconoOscuro.classList.remove("hidden");
});




// Evento para cambiar visibilidad de filtros al cambiar tipo
document.getElementById("filtro-tipo").addEventListener("change", actualizarVisibilidadFiltros);



// Evento para el formulario de búsqueda
document.getElementById("barra-busqueda").addEventListener("submit", (evento) => {
    evento.preventDefault();
    busqueda = document.getElementById("campo-busqueda").value.trim();
    tipo = document.getElementById("filtro-tipo").value;
    status = document.getElementById("filtro-status").value || "";
    gender = document.getElementById("filtro-gender").value || "";
    paginaActual = 1;

    obtenerResultados(busqueda, tipo, paginaActual);
});

// Eventos para los botones de paginación
document.getElementById("boton-primera").addEventListener("click", () => {
    paginaActual = 1;
    obtenerResultados(busqueda, tipo, paginaActual);
});

document.getElementById("boton-anterior").addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        obtenerResultados(busqueda, tipo, paginaActual);
    }
});

document.getElementById("boton-siguiente").addEventListener("click", () => {
    paginaActual++;
    obtenerResultados(busqueda, tipo, paginaActual);
});

document.getElementById("boton-ultima").addEventListener("click", () => {
    const totalPaginas = Math.ceil(totalResultados / 20);
    paginaActual = totalPaginas;
    obtenerResultados(busqueda, tipo, paginaActual);
});


// Evento para cargar datos automáticamente
window.addEventListener("load", () => {
    obtenerResultados("", "character", 1);
});


actualizarVisibilidadFiltros(); // Mostrar u ocultar filtros en el inicio

// Aplicar el modo guardado en localStorage al cargar la página
const modoGuardado = localStorage.getItem("modo");
if (modoGuardado === "oscuro") {
    document.documentElement.classList.add("dark");
    iconoOscuro.classList.add("hidden");
    iconoClaro.classList.remove("hidden");
} else {
    document.documentElement.classList.remove("dark");
    iconoClaro.classList.add("hidden");
    iconoOscuro.classList.remove("hidden");
}

