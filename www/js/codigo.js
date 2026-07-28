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
  document.querySelector("#slcFiltro").innerHTML = html;
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
  } else if (ruta == "/listado") {
    cargarComboFiltroPaises();
    cargarListaJugadores();
    LISTADO.style.display = "block";
  } else if (ruta == "/mapa") {
    MAPA.style.display = "block";
  }
  MENU.close();
  console.log(ruta);
}

async function registrarUsuario() {
  let nombre = document.querySelector("#txtRegistroNombre").value;
  let pass = document.querySelector("#txtRegistroContraseña").value;
  let pais = document.querySelector("#slcPais").value;

  if (datosValidos(nombre, pass, pais)) {
    let objReg = new Object();
    objReg.usuario = nombre;
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
      console.log(data.mensaje);
      Alertar("IMPORTANTE", "Error de Registro de usuario", data.mensaje);
    } else {
      MostrarToast("Usuario registrado correctamente", 2000);

      //await login(nombre, pass);
    }
    LoadingClose();
  }
}

function datosValidos(nombre, pass, pais) {
  if (nombre == "" || pass == "" || pais == "") {
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
      console.log(data.mensaje);
      Alertar("IMPORTANTE", "Error de inicio de sesión", data.mensaje);
    } else {
      let data = await response.json();
      localStorage.setItem("token", data.token);
      ROUTER.push("/");
      armarMenu();

      console.log("Usuario logueado correctamente");
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
  let html = `<ion-list>`;
  for (let j of jugadores) {
    html += `
  <ion-item-sliding>
    <ion-item>
      <ion-label>${j.nombre}</ion-label>
    </ion-item>

    <ion-item-options>
      <ion-item-option color="danger" onclick="eliminar(${j.id})">Eliminar</ion-item-option>
    </ion-item-options>
  </ion-item-sliding>

`;

    LoadingClose();
    html += `</ion-list>`;
  }
  document.querySelector("#tablaJugadores").innerHTML = html;
}

async function eliminar(idJ) {
  let jugadores = await eliminarJugador(idJ);
  //cargarListaJugadores()
  MostrarToast("Jugador eliminado correctamente", 2000);
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
    console.log(data);
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
  console.log(data);
  return data.jugadores;
}

//async function genAI(){

//}

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
  //loading.duration = 2000;
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
