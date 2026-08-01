const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const REGISTRO = document.querySelector("#pantalla-registro");
const LOGIN = document.querySelector("#pantalla-login");
const AGREGARJUGADOR = document.querySelector("#pantalla-agregarjugador");
const LISTADO = document.querySelector("#pantalla-listado");
const MAPA = document.querySelector("#pantalla-mapa");
const URLBASE = "https://worldcupfan.develotion.com";

inicio();

function inicio() {
  eventos();
  armarMenu();
}

function eventos() {
  ROUTER.addEventListener("ionRouteDidChange", navegar);
  document
    .querySelector("#btnRegistro")
    .addEventListener("click", registrarUsuario);
  document.querySelector("#btnLogin").addEventListener("click", login);
  document
    .querySelector("#slcFiltro")
    .addEventListener("ionChange", cargarListaJugadores);
  document
    .querySelector("#btnAgregarJugador")
    .addEventListener("click", agregarJugador);
}

function armarMenu() {
  let hayToken = localStorage.getItem("token");
  let html = `
      <ion-item href="/">Home</ion-item>
      `;

  if (hayToken) {
    html += `<ion-item href="/agregarjugador">Agregar Jugador</ion-item>
    <ion-item href="/listado">Listado</ion-item>
    <ion-item href="/mapa">Mapa</ion-item>
   <ion-button onclick="logout()" color="danger">Cerrar sesión</ion-button>
    `;
  } else {
    html += `<ion-item href="/registro">Registro</ion-item>
  <ion-item href="/login">Login</ion-item>`;
  }
  document.querySelector("#menu-opciones").innerHTML = html;
}

/* CARGA DE SELECTS */
async function cargarComboPaises() {
  Loading("Cargando países...");
  let response = await fetch(`${URLBASE}/paises`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  let data = await response.json();
  let html = ``;

  for (let p of data.paises) {
    html += `<ion-select-option value="${p.id}">${p.nombre}</ion-select-option>`;
  }
  document.querySelector("#slcPais").innerHTML = html;
  LoadingClose();
}

async function cargarComboFiltroPaises() {
  Loading("Cargando países...");
  let response = await fetch(`${URLBASE}/selecciones`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  let data = await response.json();
  let html = `<ion-select-option value="">Todos</ion-select-option>`;

  for (let p of data.selecciones) {
    html += `<ion-select-option value="${p.id}">${p.nombre}</ion-select-option>`;
  }
  document.querySelector("#slcFiltro").innerHTML = html;
  LoadingClose();
}

async function cargarComboFiltroPaisesParaAgregar() {
  Loading("Cargando países...");
  let response = await fetch(`${URLBASE}/selecciones`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  let data = await response.json();
  let html = ``;

  for (let p of data.selecciones) {
    html += `<ion-select-option value="${p.id}">${p.nombre}</ion-select-option>`;
  }
  document.querySelector("#slcSeleccion").innerHTML = html;
  LoadingClose();
}

async function cargarComboPosiciones() {
  Loading("Cargando posiciones...");
  let response = await fetch(`${URLBASE}/posiciones`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  let data = await response.json();
  let html = ``;

  for (let p of data.posiciones) {
    html += `<ion-select-option value="${p.id}">${p.nombre}</ion-select-option>`;
  }
  document.querySelector("#slcPosicion").innerHTML = html;
  LoadingClose();
}

/* CARGA DE SELECTS */

function navegar(evt) {
  ocultarPantallas();
  let ruta = evt.detail.to;
  if (ruta == "/") {
    HOME.style.display = "block";
  } else if (ruta == "/registro") {
    cargarComboPaises();
    REGISTRO.style.display = "block";
  } else if (ruta == "/login") {
    LOGIN.style.display = "block";
  } else if (ruta == "/agregarjugador") {
    AGREGARJUGADOR.style.display = "block";
    cargarComboFiltroPaisesParaAgregar();
    cargarComboPosiciones();
  } else if (ruta == "/listado") {
    cargarComboFiltroPaises();
    cargarListaJugadores();
    cargarEstadisticas();
    LISTADO.style.display = "block";
  } else if (ruta == "/mapa") {
    MAPA.style.display = "block";
    crearMapa();
  }
  MENU.close();
}

async function registrarUsuario() {
  let usuario = document.querySelector("#txtRegistroNombre").value;
  let pass = document.querySelector("#txtRegistroContraseña").value;
  let pais = document.querySelector("#slcPais").value;

  if (datosValidos(usuario, pass, pais)) {
    let objReg = new Object();
    objReg.usuario = usuario;
    objReg.password = pass;
    objReg.idPais = pais;

    Loading("Registrando usuario...");

    let response = await fetch(`${URLBASE}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(objReg),
    });
    if (!response.ok) {
      let data = await response.json();

      Alertar("IMPORTANTE", "Error de Registro de usuario", data.mensaje);
    } else {
      let auth = await response.json();
      localStorage.setItem("token", auth.token);
      MostrarToast("Usuario registrado correctamente", 2000);
      ROUTER.push("/");
    }
    LoadingClose();
  }
}

function datosValidos(usuario, pass, pais) {
  if (usuario == "" || pass == "" || pais == "") {
    alert("Todos los campos son obligatorios");
    return false;
  }
  return true;
}

async function login() {
  let usuario = document.querySelector("#txtLoginUsuario").value;
  let password = document.querySelector("#txtLoginContrasenia").value;

  if (datosValidosLogin(usuario, password)) {
    let objLogin = new Object();
    objLogin.usuario = usuario;
    objLogin.password = password;

    Loading("Iniciando sesión...");
    let response = await fetch(`${URLBASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(objLogin),
    });

    if (!response.ok) {
      let data = await response.json();

      Alertar("IMPORTANTE", "Error de inicio de sesión", data.mensaje);
    } else {
      let data = await response.json();
      localStorage.setItem("token", data.token);
      ROUTER.push("/");
      armarMenu();
    }
    LoadingClose();
  }
}

function datosValidosLogin(usuario, password) {
  if (usuario == "" || password == "") {
    alert("Todos los campos son obligatorios");
    return false;
  }
  return true;
}

async function cargarListaJugadores() {
  Loading("Cargando jugadores...");

  let jugadores = await obtenerJugadores();
  let selecciones = await getSelecciones();
  let filtroPais = document.querySelector("#slcFiltro").value;
  let html = `<ion-list>`;
  for (let j of jugadores) {
    //let seleccion = await buscarSeleccionPorId(j.idSeleccion);
    let seleccion = buscarSeleccionDelJugador(j.idSeleccion, selecciones);

    if (filtroPais == "" || filtroPais == null) {
      html += `
  <ion-item-sliding>
    <ion-item>
      <ion-label>${j.nombre} - ${seleccion.emoji}</ion-label>
    </ion-item>

    <ion-item-options side="end">
      <ion-item-option color="danger" onclick="eliminar(${j.id})">Eliminar</ion-item-option>
    </ion-item-options>
  </ion-item-sliding>`;
    } else if (filtroPais == seleccion.id) {
      html += `
  <ion-item-sliding>
    <ion-item>
      <ion-label>${j.nombre} - ${seleccion.emoji}</ion-label>
    </ion-item>
    `;
    }
  }
  html += `</ion-list>`;
  LoadingClose();
  document.querySelector("#tablaJugadores").innerHTML = html;
}

function buscarSeleccionDelJugador(idSeleccion, selecciones) {
  for (let s of selecciones) {
    if (s.id == idSeleccion) {
      return s;
    }
  }
}

function buscarPosicionPorId(idPosicion, posiciones) {
  for (let p of posiciones) {
    if (p.id == idPosicion) {
      return p;
    }
  }
  return null;
}

async function getSelecciones() {
  let response = await fetch(`${URLBASE}/selecciones`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  let data = await response.json();
  if (response.status === 401) {
    mandarAlLogin();
    return;
  }
  if (!response.ok) {
    let data = await response.json();
    Alertar("IMPORTANTE", "Error al obtener selecciones", data.mensaje);
    return [];
  } else {
    return data.selecciones;
  }
}

async function getPosiciones() {
  let response = await fetch(`${URLBASE}/posiciones`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  let data = await response.json();
  if (response.status === 401) {
    mandarAlLogin();
    return;
  }
  if (!response.ok) {
    Alertar("IMPORTANTE", "Error al obtener posiciones", data.mensaje);
    return [];
  } else {
    return data.posiciones;
  }
}

async function eliminar(idJ) {
  let jugadores = await eliminarJugador(idJ);
  MostrarToast("Jugador eliminado correctamente", 2000);
  cargarListaJugadores();
}

async function eliminarJugador(id) {
  let response = await fetch(`${URLBASE}/jugadores/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (response.ok) {
    let data = await response.json();

    return data;
  } else {
    return null;
  }
}

async function obtenerJugadores() {
  let response = await fetch(`${URLBASE}/jugadores`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  let data = await response.json();

  return data.jugadores;
}

async function obtenerPaises() {
  Loading("Cargando países...");
  let response = await fetch(`${URLBASE}/paises`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  let data = await response.json();
  if (!response.ok) {
    Alertar("IMPORTANTE", "Error al obtener países", data.mensaje);
    LoadingClose();
    return [];
  } else {
    LoadingClose();
    return data.paises;
  }
}

async function obtenerUsuariosPorPais() {
  Loading("Cargando usuarios por país...");
  let response = await fetch(`${URLBASE}/usuariosPorPais`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  let data = await response.json();

  if (response.status === 401) {
    mandarAlLogin();
    return;
  }
  if (!response.ok) {
    Alertar("IMPORTANTE", "Error al obtener usuarios por país", data.mensaje);
    LoadingClose();
    return [];
  } else {
    LoadingClose();
    return data.paises;
  }
}

function obtenerSeleccionFavorita(jugadores, selecciones) {
  let conteo = {};

  for (let j of jugadores) {
    if (!conteo[j.idSeleccion]) {
      conteo[j.idSeleccion] = 0;
    }
    conteo[j.idSeleccion] = conteo[j.idSeleccion] + 1;
  }

  let idFavorita = null;
  let maxCantidad = 0;

  for (let id in conteo) {
    if (conteo[id] > maxCantidad) {
      maxCantidad = conteo[id];
      idFavorita = id;
    }
  }

  let seleccion = buscarSeleccionDelJugador(idFavorita, selecciones);
  seleccion.cantidad = maxCantidad;
  return seleccion;
}

function obtenerTipoJugadorPredominante(jugadores, posiciones) {
  let totalCampo = 0;
  let totalArqueros = 0;

  for (let j of jugadores) {
    let posicion = buscarPosicionPorId(j.posicion, posiciones);

    // Si no se encuentra la posición, evitar el error y asumir jugador de campo
    if (
      posicion &&
      posicion.nombre &&
      posicion.nombre.toLowerCase() == "arquero"
    ) {
      totalArqueros = totalArqueros + 1;
    } else {
      totalCampo = totalCampo + 1;
    }
  }

  if (totalArqueros > totalCampo) {
    return {
      emoji: "🥅",
      etiqueta: "Arquero",
      totalCampo: totalCampo,
      totalArqueros: totalArqueros,
    };
  }
  return {
    emoji: "⚽",
    etiqueta: "Jugador de campo",
    totalCampo: totalCampo,
    totalArqueros: totalArqueros,
  };
}

async function cargarEstadisticas() {
  Loading("Cargando estadísticas...");

  let jugadores = await obtenerJugadores();
  let selecciones = await getSelecciones();
  let posiciones = await getPosiciones();

  if (jugadores.length == 0) {
    document.querySelector("#seleccionFavorita").innerHTML =
      "<p>Todavía no tenés jugadores registrados.</p>";
    document.querySelector("#tipoJugadorPredominante").innerHTML = "";
    LoadingClose();
    return;
  }

  let seleccionFavorita = obtenerSeleccionFavorita(jugadores, selecciones);
  let tipoPredominante = obtenerTipoJugadorPredominante(jugadores, posiciones);

  document.querySelector("#seleccionFavorita").innerHTML = `
    <ion-item>
      <ion-label>${seleccionFavorita.emoji} ${seleccionFavorita.nombre} — ${seleccionFavorita.cantidad} jugador(es)</ion-label>
    </ion-item>
  `;

  document.querySelector("#tipoJugadorPredominante").innerHTML = `
    <ion-item>
      <ion-label>${tipoPredominante.emoji} ${tipoPredominante.etiqueta} (${tipoPredominante.totalCampo} de campo · ${tipoPredominante.totalArqueros} arquero/s)</ion-label>
    </ion-item>
  `;
  LoadingClose();
}

function datosValidosAgregarJugador(
  nombre,
  fechaNacimiento,
  idSeleccion,
  posicion,
) {
  if (
    nombre == "" ||
    fechaNacimiento == "" ||
    idSeleccion == "" ||
    posicion == ""
  ) {
    alert("Todos los campos son obligatorios");
    return false;
  } else if (new Date(fechaNacimiento) > new Date()) {
    alert("La fecha de nacimiento no puede ser mayor a la fecha actual");
    return false;
  }
  return true;
}

async function agregarJugador() {
  let nombre = document.querySelector("#txtNombreAgregarJugador").value;
  let fechaNacimiento = document.querySelector("#datetime").value;
  let idSeleccion = document.querySelector("#slcSeleccion").value;
  let posicion = document.querySelector("#slcPosicion").value;
  let comentario = document.querySelector("#txtComentario").value;

  if (comentario == "") {
    Alertar(
      "IMPORTANTE",
      "Comentario obligatorio",
      "Debe ingresar un comentario para poder agregar el jugador",
    );
    return;
  }

  if (
    !datosValidosAgregarJugador(nombre, fechaNacimiento, idSeleccion, posicion)
  ) {
    return;
  }

  let comentarioModerado = await moderarComentario(comentario);

  if (comentarioModerado < 0.5) {
    Alertar(
      "IMPORTANTE",
      "Comentario inapropiado",
      "El comentario ingresado no es apropiado para agregar el jugador",
    );
    return;
  }

  let objJugador = new Object();
  objJugador.nombre = nombre;
  objJugador.fechaNacimiento = fechaNacimiento;
  objJugador.idSeleccion = idSeleccion;
  objJugador.posicion = posicion;

  Loading("Agregando jugador...");
  try {
    let response = await fetch(`${URLBASE}/jugadores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(objJugador),
    });

    if (response.status === 401) {
      mandarAlLogin();
      return;
    }

    if (!response.ok) {
      let data = await response.json();
      Alertar("IMPORTANTE", "Error al agregar jugador", data.mensaje);
    } else {
      let data = await response.json();
      MostrarToast("Jugador agregado correctamente", 2000);
      ROUTER.push("/listado");
    }
  } catch (error) {
    Alertar(
      "IMPORTANTE",
      "Error de red",
      "No se pudo conectar con el servidor. Por favor, intente nuevamente más tarde.",
    );
  }
  LoadingClose();
}

function mandarAlLogin() {
  Alertar(
    "IMPORTANTE",
    "Sesión expirada",
    "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
  );
  localStorage.clear();
  ROUTER.push("/login");
  armarMenu();
}

async function moderarComentario(txtComentario) {
  Loading("Moderando comentario...");
  try {
    let response = await fetch(`${URLBASE}/genai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ prompt: txtComentario }),
    });
    let data = await response.json();
    LoadingClose();
    return data.score;
  } catch (error) {
    LoadingClose();
    Alertar(
      "IMPORTANTE",
      "Error de red",
      "No se pudo conectar con el servidor para moderar el comentario. Por favor, intente nuevamente más tarde.",
    );
    return 0;
  }
}

function crearMapa() {
  Loading("Cargando Mapa");
  setTimeout(function () {
    cargarMapa();
  }, 1000);
  LoadingClose();
}

var map = null;
async function cargarMapa() {
  if (map != null) {
    map.remove();
  }
  map = L.map("map").setView([-34.89457123080363, -56.15285498172172], 14);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    minZoom: 1,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  let paises = await obtenerPaises();
  let usuarios = await obtenerUsuariosPorPais();

  for (let p of paises) {
    for (let u of usuarios) {
      if (p.id == u.id) {
        let marker = L.marker([p.latitud, p.longitud]).addTo(map);
        marker.bindTooltip(
          `<b>${p.nombre}</b><br>Usuarios: ${u.cantidadDeUsuarios}`,
        );
      }
    }
  }
}

function logout() {
  localStorage.clear();
  ROUTER.push("/login");
  armarMenu();
}

function ocultarPantallas() {
  HOME.style.display = "none";
  REGISTRO.style.display = "none";
  LOGIN.style.display = "none";
  AGREGARJUGADOR.style.display = "none";
  LISTADO.style.display = "none";
  MAPA.style.display = "none";
}

//CONTROL VISUAL

const loading = document.createElement("ion-loading");
function Loading(texto) {
  loading.cssClass = "my-custom-class";
  loading.message = texto;
  //loading.duration = 200000;
  document.body.appendChild(loading);
  loading.present();
}

function LoadingClose() {
  loading.dismiss();
}

function Alertar(titulo, subtitulo, mensaje) {
  const alert = document.createElement("ion-alert");
  alert.cssClass = "my-custom-class";
  alert.header = titulo;
  alert.subHeader = subtitulo;
  alert.message = mensaje;
  alert.buttons = ["OK"];
  document.body.appendChild(alert);
  alert.present();
}

function MostrarToast(mensaje, duracion) {
  const toast = document.createElement("ion-toast");
  toast.message = mensaje;
  toast.duration = duracion;
  document.body.appendChild(toast);
  toast.present();
}
