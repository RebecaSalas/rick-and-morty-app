// =======================
// Constantes 
// =======================
const API_URL = "https://rickandmortyapi.com/api/";
const iconoOscuro = document.getElementById("icono-modo-oscuro");
const iconoClaro = document.getElementById("icono-modo-claro");

// =======================
// Variables 
// =======================
let busqueda = "";
let tipo = "character";
let status = "";
let gender = "";
let paginaActual = 1;
let totalResultados = 0;

// =======================
// Funciones de Vista
// =======================

// Función para volver a la vista principal
function volverAVistaPrincipal() {
    const resultadosSeccion = document.getElementById("resultados-seccion");
    resultadosSeccion.innerHTML = `
        <p id="total-resultados" class="text-lg font-semibold text-gray-700 mb-4"></p>
        <div id="resultados" class="grid grid-cols-2 md:grid-cols-4 gap-6"></div>
    `;
}

// Función para limpiar los resultados anteriores
function limpiarResultados() {
    document.getElementById("resultados").innerHTML = "";
}

// Función para mostrar los resultados de la búsqueda
function mostrarResultados(resultados, tipo) {
    const contenedor = document.getElementById("resultados");
    limpiarResultados();

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

        // Agrega evento para mostrar detalles al hacer clic
        tarjeta.addEventListener("click", () => mostrarDetalles(item.id, tipo));
        contenedor.appendChild(tarjeta);
    });
}

// Función para mostrar un mensaje si no hay resultados
function mostrarMensaje(mensaje) {
    limpiarResultados();
    const contenedor = document.getElementById("resultados");
    const mensajeElemento = document.createElement("p");
    mensajeElemento.className = "text-center text-red-500 font-bold";
    mensajeElemento.textContent = mensaje;
    contenedor.appendChild(mensajeElemento);
}

// Función para mostrar la cantidad total de resultados encontrados
function actualizarTotalResultados(total) {
    document.getElementById("total-resultados").innerText = `${total} RESULTADOS`;
}

// Función para mostrar el número de página actual y habilitar o deshabilitar botones
function actualizarPaginado(totalPaginas, paginaActual) {
    const infoPagina = document.getElementById("info-pagina");
    if (!infoPagina) return;
    infoPagina.innerText = `Página ${paginaActual} de ${totalPaginas}`;

    document.getElementById("boton-anterior").disabled = paginaActual <= 1;
    document.getElementById("boton-siguiente").disabled = paginaActual >= totalPaginas;
    document.getElementById("boton-primera").disabled = paginaActual <= 1;
    document.getElementById("boton-ultima").disabled = paginaActual >= totalPaginas;
}

// Función para mostrar u ocultar los filtros según el tipo seleccionado
function actualizarVisibilidadFiltros() {
    const tipoSeleccionado = document.getElementById("filtro-tipo").value;
    const contenedorStatus = document.getElementById("contenedor-status");
    const contenedorGender = document.getElementById("contenedor-gender");

    contenedorStatus.style.display = tipoSeleccionado === "episode" ? "none" : "block";
    contenedorGender.style.display = tipoSeleccionado === "episode" ? "none" : "block";
}

// =======================
// Funciones de API
// =======================

// Función para obtener resultados de la API
async function obtenerResultados(busqueda, tipo, pagina) {
    let endpoint = `${API_URL}${tipo}/?`;
    if (busqueda) endpoint += `name=${busqueda}&`;
    if (status) endpoint += `status=${status}&`;
    if (gender) endpoint += `gender=${gender}&`;
    endpoint += `page=${pagina}`;

    try {
        const respuesta = await fetch(endpoint);

        if (respuesta.status === 404) {
            mostrarMensaje("No se encontraron coincidencias.");
            return;
        }

        if (!respuesta.ok) throw new Error("Error en la solicitud");

        const datos = await respuesta.json();

        if (datos.results?.length > 0) {
            totalResultados = datos.info.count;
            mostrarResultados(datos.results, tipo);
            actualizarPaginado(datos.info.pages, pagina);
            actualizarTotalResultados(totalResultados);
        } else {
            mostrarMensaje("No se encontraron resultados para tu búsqueda.");
        }
    } catch {
        mostrarMensaje("Hubo un problema al cargar los datos.");
    }
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
                            <p><strong>Episodes:</strong> ${datos.episode.map(ep => `<a href="${ep}" target="_blank">${ep.split('/').pop()}</a>`).join(", ")}</p>
                        `
                        : `
                            <p><strong>Fecha de lanzamiento:</strong> ${datos.air_date}</p>
                            <p><strong>Código:</strong> ${datos.episode}</p>
                            <p><strong>Personajes:</strong> ${datos.characters.map(char => `<a href="${char}" target="_blank">${char.split('/').pop()}</a>`).join(", ")}</p>
                        `
                }
                <button id="volver" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Volver a Resultados
                </button>
            </div>
        `;

        // Agrega evento al botón para volver a la vista principal
        document.getElementById("volver").addEventListener("click", volverAVistaPrincipal);
    } catch {
        mostrarMensaje("Hubo un problema al cargar los detalles.");
    }
}

// =======================
// Configuración Inicial
// =======================

// Mostrar u ocultar filtros en base al tipo seleccionado
actualizarVisibilidadFiltros();

// Aplicar modo claro/oscuro desde localStorage
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

// =======================
// Eventos
// =======================

// Eventos para cambiar entre modo oscuro y claro
iconoOscuro.addEventListener("click", () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("modo", "oscuro");
    iconoOscuro.classList.add("hidden");
    iconoClaro.classList.remove("hidden");
});

iconoClaro.addEventListener("click", () => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("modo", "claro");
    iconoClaro.classList.add("hidden");
    iconoOscuro.classList.remove("hidden");
});

// Evento para cambiar el tipo de búsqueda (character o episode)
document.getElementById("filtro-tipo").addEventListener("change", () => {
    actualizarVisibilidadFiltros();
    volverAVistaPrincipal();
    busqueda = "";
    obtenerResultados(busqueda, tipo, 1);
});

// Evento para realizar búsqueda
document.getElementById("barra-busqueda").addEventListener("submit", (evento) => {
    evento.preventDefault();
    volverAVistaPrincipal();

    // Obtener valores de los campos
    busqueda = document.getElementById("campo-busqueda").value.trim();
    tipo = document.getElementById("filtro-tipo").value;
    status = document.getElementById("filtro-status").value || "";
    gender = document.getElementById("filtro-gender").value || "";
    paginaActual = 1;

    obtenerResultados(busqueda, tipo, paginaActual);
});

// Eventos para paginación
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

// // Evento para cargar datos automáticamente
window.addEventListener("load", () => {
    obtenerResultados("", "character", 1);
});
