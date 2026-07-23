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

async function cargarComboPaises() {
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
}

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
    } else {
      console.log("Usuario registrado correctamente");
    }
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
    } else {
      let data = await response.json();
      localStorage.setItem("token", data.token);
      ROUTER.push("/");
      armarMenu();

      console.log("Usuario logueado correctamente");
    }
  }
}

function datosValidosLogin(usuario, password) {
  if (usuario == "" || password == "") {
    alert("Todos los campos son obligatorios");
    return false;
  }
  return true;
}

function logout() {
  localStorage.clear()
    ROUTER.push("/login");
    armarMenu()

}

function ocultarPantallas() {
  HOME.style.display = "none";
  REGISTRO.style.display = "none";
  LOGIN.style.display = "none";
  AGREGARJUGADOR.style.display = "none";
  LISTADO.style.display = "none";
  MAPA.style.display = "none";
}
