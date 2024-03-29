"use strict";

/**
 * add event on element
 */

const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
};

/**
 * navbar toggle
 */

const navbar = document.querySelector("[data-navbar]");
const navToggler = document.querySelector("[data-nav-toggler]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const toggleNavbar = () => navbar.classList.toggle("active");

addEventOnElem(navToggler, "click", toggleNavbar);

const closeNavbar = () => navbar.classList.remove("active");

addEventOnElem(navLinks, "click", closeNavbar);

/**
 * header & back top btn active when scroll down to 100px
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const headerActive = function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
};

addEventOnElem(window, "scroll", headerActive);

function mostrarAlerta(tipo, titulo, texto) {
  Swal.fire({
    icon: tipo,
    title: titulo,
    text: texto,
  });
}

function transformarFecha(fecha) {
  const fechaOriginal = fecha ? new Date(fecha) : new Date();
  const dia = fechaOriginal.getDate().toString().padStart(2, "0");
  const mes = (fechaOriginal.getMonth() + 1).toString().padStart(2, "0"); // Los meses en JavaScript comienzan desde 0 (enero es 0).
  const año = fechaOriginal.getFullYear().toString();

  return `${dia}-${mes}-${año}`;
}

function mostrarLoader() {
  if (loader) {
    loader.style.display = "block";
  }
}

function ocultarLoader() {
  if (loader) {
    loader.style.display = "none";
  }
}

// CLIENTES
document.addEventListener("DOMContentLoaded", function () {
  var formularioClientes = document.querySelector(".clientes-form");

  formularioClientes.addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      mostrarLoader();
      var nombreApellido = formularioClientes.name.value.split(" ");
      var nombre = nombreApellido[0];
      var apellido = nombreApellido[1];
      var dni = formularioClientes.dni.value;
      var fechanac = formularioClientes.date.value;
      var telefono = formularioClientes.phone.value;
      var email = formularioClientes.email.value;

      var msg = await guardarCliente(
        nombre,
        apellido,
        dni,
        transformarFecha(fechanac),
        telefono,
        email
      );
      mostrarAlerta("info", msg, "");
      formularioClientes.name.value = "";
      formularioClientes.dni.value = "";
      formularioClientes.date.value = "";
      formularioClientes.phone.value = "";
      formularioClientes.email.value = "";
    } catch (error) {
      console.error(error);
      if (error.response.data.errno == 1062) {
        mostrarAlerta(
          "error",
          "Ya existe un usuario con ese DNI",
          "Por favor, intenta de nuevo."
        );
      }
      mostrarAlerta(
        "error",
        "Error al guardar cliente",
        "Por favor, intenta de nuevo."
      );
    } finally {
      ocultarLoader();
    }
  });

  function guardarCliente(nombre, apellido, dni, fechanac, telefono, email) {
    return new Promise((resolve, reject) => {
      var data = {
        nombre: nombre,
        apellido: apellido,
        dni: dni,
        fechaNacimiento: fechanac,
        telefono: telefono,
        email: email,
      };

      const config = {
        url: `https://cork-be.onrender.com/customer`,
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then((response) => {
          resolve(response.data.mensaje);
        })
        .catch((error) => {
          console.log("error", error);
          reject(error);
        });
    });
  }
});

// VENTAS

var dniCliente = "";
document.addEventListener("DOMContentLoaded", function () {
  var buscarClienteBtn = document.getElementById("buscarClienteBtn");
  var infoClienteDiv = document.getElementById("infoCliente");
  var infoVentaDiv = document.getElementById("infoVenta");

  buscarClienteBtn.addEventListener("click", async function () {
    event.preventDefault();
    try {
      mostrarLoader();
      var msg = await buscarClientePorDNI();
      mostrarInfoCliente(msg);
    } catch (error) {
      console.error(error);
      mostrarAlerta(
        "error",
        "Error al buscar cliente por DNI",
        "Por favor, intenta de nuevo."
      );
    } finally {
      ocultarLoader();
    }
  });

  function mostrarInfoCliente(cliente) {
    var infoClienteHTML = `
    <h3>Información del Cliente</h3>
    <p>Nombre: ${cliente.Nombre} ${cliente.Apellido}</p>
    <p>DNI: ${cliente.DNI}</p>
    <p>Email: ${cliente.Email}</p>
    <p>Telefono: ${cliente.Telefono}</p>
    <p>Fecha de Nacimiento: ${cliente.FechaNacimiento}</p>
    <p>PuntosTotales: ${cliente.PuntosTotales}</p>
    `;
    // if (cliente.PuntosTotales > 0) {
      infoClienteHTML += `<button id="canjearPuntosBtn">Canjear Puntos</button>`;
    // }

    infoClienteDiv.innerHTML = infoClienteHTML;
    infoClienteDiv.style.display = "block";
    infoVentaDiv.style.display = "block";

    var canjearPuntosBtn = document.getElementById("canjearPuntosBtn");
    if (canjearPuntosBtn) {
      canjearPuntosBtn.addEventListener("click", function () {
        mostrarDialogoCanje(cliente.PuntosTotales);
      });
    }
  }

  function mostrarDialogoCanje(puntosDisponibles) {
    Swal.fire({
      title: 'Canjear Puntos',
      html: `<p>Ingrese la cantidad de puntos que desea canjear (Disponibles: ${puntosDisponibles}):</p>`,
      input: 'text',
      inputAttributes: {
        type: 'number',
        min: '0',
        max: puntosDisponibles,
      },
      showCancelButton: true,
      confirmButtonText: 'Canjear',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      preConfirm: (canjeInput) => {
        // Aquí puedes realizar la lógica para canjear los puntos con el valor ingresado
        if (canjeInput === '' || isNaN(canjeInput)) {
          Swal.showValidationMessage('Por favor, ingrese una cantidad válida.');
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const puntosCanjeados = result.value;
        try {
          mostrarLoader();
          await canjearPuntos(puntosCanjeados, dniCliente);
          var msg = await buscarClientePorDNI(dniCliente);
          mostrarInfoCliente(msg);
          mostrarAlerta(
            "info",
            "Operación realizada exitosamente",
            `Puntos canjeados: ${puntosCanjeados}`
          );
        } catch (error) {
          console.error(error);
          mostrarAlerta(
            "error",
            "Error al canjear los puntos",
            "Por favor, intenta de nuevo."
          );
        } finally {
          ocultarLoader();
        }
      }
    });
  }

  function canjearPuntos(puntos, dni) {
    return new Promise((resolve, reject) => {
      const data = {
        dni: dni,
        puntos: puntos
      };
      const config = {
        url: `https://cork-be.onrender.com/costumer/puntos`,
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        data: data
      };

      axios(config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  function buscarClientePorDNI(otroDNI) {
    var dni = otroDNI ? otroDNI : formularioVentas.dniCliente.value;
    dniCliente = dni;
    return new Promise((resolve, reject) => {
      const config = {
        url: `https://cork-be.onrender.com/getcustomer/${dni}`,
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then((response) => {
          formularioVentas.dniCliente.value = "";
          resolve(response.data[0]);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  function calcularPuntos(detalle) {
    const puntosPorOpcion = {
      Bebidas: 10,
      Productos: 15,
      Barba: 20,
      Corte: 30,
      "Corte + Barba": 50,
    };

    const opciones = detalle.split(";");
    let puntosTotales = 0;

    opciones.forEach((opcion) => {
      const opcionLimpia = opcion.trim();
      if (puntosPorOpcion[opcionLimpia]) {
        puntosTotales += puntosPorOpcion[opcionLimpia];
      }
    });

    return puntosTotales;
  }

  var formularioVentas = document.querySelector(".ventas-form");

  formularioVentas.addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      mostrarLoader();
      var montoCobrado = formularioVentas.monto.value;
      var detalle = Array.from(opcionesElegidasList.getElementsByTagName("li"))
                          .map((li) => li.textContent)
                          .join(";");
      var empleado = formularioVentas.empleado.value;
      var dni = dniCliente;
      var sucursal = formularioVentas.sucursal.value;
      var puntos = calcularPuntos(detalle);

      var msg = await guardarVenta(
        montoCobrado,
        detalle,
        empleado,
        dni,
        sucursal,
        puntos
      );
      console.log(msg);
      mostrarAlerta("info", msg, "Se ha registrado la venta");
    } catch (error) {
      console.error(error);
      mostrarAlerta(
        "error",
        "Error al guardar venta",
        "Por favor, intenta de nuevo."
      );
    } finally {
      ocultarLoader();
    }
  });

  function guardarVenta(
    montoCobrado,
    detalle,
    empleado,
    dni,
    sucursal,
    puntos
  ) {
    return new Promise((resolve, reject) => {
      var data = {
        monto: montoCobrado,
        detalle: detalle,
        fecha: transformarFecha(),
        employeeid: empleado,
        dni: dni,
        sucursalId: sucursal,
        puntosTotales: puntos,
      };
      const config = {
        url: `https://cork-be.onrender.com/transactions`,
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const selectElement = document.getElementById("detalleSelect");
  const opcionesElegidasDiv = document.getElementById("infoOpcionesElegidas");
  let opcionesElegidasList = document.getElementById("opcionesElegidasList");

  if (!opcionesElegidasList) {
    opcionesElegidasList = document.createElement("ul");
    opcionesElegidasList.id = "opcionesElegidasList";
    opcionesElegidasDiv
      .querySelector(".opciones-elegidas")
      .appendChild(opcionesElegidasList);
  }

  selectElement.addEventListener("change", function () {
    updateOpcionesElegidasList();
  });

  opcionesElegidasList.addEventListener("click", function (event) {
    if (event.target.tagName === "LI") {
      returnOptionToSelect(event.target.textContent);
      event.target.remove();
      checkOpcionesElegidasVisibility();
    }
  });

  function updateOpcionesElegidasList() {
    const opcionSeleccionada = selectElement.value;

    if (opcionSeleccionada.trim() !== "") {
      const listItem = document.createElement("li");
      listItem.textContent = opcionSeleccionada;

      opcionesElegidasList.appendChild(listItem);
      selectElement.value = ""; // Limpiar el valor seleccionado

      removeOptionFromSelect(opcionSeleccionada);
      showOpcionesElegidasDiv();
    }
  }

  function removeOptionFromSelect(value) {
    const optionToRemove = selectElement.querySelector(
      `option[value="${value}"]`
    );
    if (optionToRemove) {
      optionToRemove.remove();
    }
  }

  function returnOptionToSelect(value) {
    const option = document.createElement("option");
    option.value = value;
    option.text = value;
    selectElement.appendChild(option);
  }

  function showOpcionesElegidasDiv() {
    opcionesElegidasDiv.style.display = "block";
  }

  function checkOpcionesElegidasVisibility() {
    if (opcionesElegidasList.childElementCount === 0) {
      opcionesElegidasDiv.style.display = "none";
    }
  }
});
// TRANSACCIONES

document.addEventListener("DOMContentLoaded", function () {
  var tablaResultados = document.getElementById("tabla-resultados");
  var formularioTransacciones = document.querySelector(".transacciones-form");

  formularioTransacciones.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      mostrarLoader();
      var resultados = await obtenerTransaccionesPorDNI(
        formularioTransacciones.dniTransacciones.value
      );

      if (resultados && resultados.length > 0) {
        mostrarAlerta("info", "Se encontraron resultados", "");
        mostrarTabla(resultados);
        formularioTransacciones.dniTransacciones.value = "";
      } else {
        mostrarAlerta(
          "warning",
          "No se encontraron resultados",
          "Por favor, intenta con otro DNI."
        );
        ocultarTabla();
      }
    } catch (error) {
      console.error(error);
      mostrarAlerta(
        "error",
        "Error al obtener transacciones",
        "Por favor, intenta de nuevo."
      );
      ocultarTabla();
    } finally {
      ocultarLoader();
    }
  });

  function mostrarTabla(resultados) {
    tablaResultados.innerHTML += `
    <thead>
        <tr>
            <th>Monto</th>
            <th>Detalle</th>
            <th>Fecha</th>
            <th>Puntos Acreditados</th>
        </tr>
    </thead>
    <tbody>
    `;

    resultados.forEach(function (resultado) {
      tablaResultados.innerHTML += `
            <tr>
                <td>${resultado.monto}</td>
                <td>${resultado.detalle}</td>
                <td>${resultado.fecha}</td>
                <td>${resultado.canjePuntos}</td>
            </tr>
        `;
    });

    tablaResultados.innerHTML += "</tbody>";
    tablaResultados.style.display = "table";
  }

  function ocultarTabla() {
    tablaResultados.style.display = "none";
  }

  function obtenerTransaccionesPorDNI(dni) {
    return new Promise((resolve, reject) => {
      const config = {
        url: `https://cork-be.onrender.com/transactions/${dni}`,
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      };

      axios(config)
        .then((response) => {
          var clienteData = response;
          resolve(clienteData.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
});
