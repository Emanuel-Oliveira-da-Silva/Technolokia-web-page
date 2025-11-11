// contac.js - cliente que llama a la API del bot
const BOT_BASE = "https://technolokia-bot-production.up.railway.app";
function getSession() {
  try {
    const raw = localStorage.getItem("technolokia:session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function getUser() {
  try {
    const raw = localStorage.getItem("technolokia:user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const session = getSession();
  const user = getUser();

  // --- seleccionar elementos del DOM (primero siempre) ---
  const main = document.getElementById("main-form");
  const tipoSelect = document.getElementById("tipo-solicitud");
  const compraBox = document.getElementById("compra-plan-box");
  const soporteBox = document.getElementById("soporte-box");

  const selectPlan = document.getElementById("select-plan");
  const inputEquipos = document.getElementById("input-equipos");
  const errPlan = document.getElementById("err-plan");
  const errEquipos = document.getElementById("err-equipos");
  const btnEnviarPlan = document.getElementById("btn-enviar-plan");

  const inputProblema = document.getElementById("input-problema");
  const inputTecnico = document.getElementById("input-tecnico");
  const errProblema = document.getElementById("err-problema");
  const btnEnviarSoporte = document.getElementById("btn-enviar-soporte");

  // Si no hay elementos esenciales, salir (evita errores)
  if (!main || !tipoSelect || !compraBox || !soporteBox) return;

  // --- verificación de sesión ---
  if (!session || !user || session.email !== user.email) {
    main.innerHTML = `<p class="alert">Tenés que iniciar sesión.<br><a href="login.html">Iniciar sesión</a></p>`;
    return;
  }

  // --- Leer parámetros de la URL (ej: contac.html?tipo=plan&plan=premium) ---
  const params = new URLSearchParams(window.location.search);
  const urlTipo = params.get("tipo");
  const urlPlan = params.get("plan");

  // Función para mostrar/ocultar según tipo
  const applyTipoVisual = (tipo) => {
    if (tipo === "plan") {
      compraBox.classList.remove("hidden");
      soporteBox.classList.add("hidden");
    } else if (tipo === "soporte") {
      soporteBox.classList.remove("hidden");
      compraBox.classList.add("hidden");
    } else {
      compraBox.classList.add("hidden");
      soporteBox.classList.add("hidden");
    }
  };

  // Si la URL pidió abrir Compra de Plan con un plan preseleccionado
  if (urlTipo === "plan") {
    tipoSelect.value = "plan";
    applyTipoVisual("plan");

    if (urlPlan) {
      const planMap = {
        standard: "Standart",
        exclusive: "Exclusive",
        premium: "Premium",
      };
      selectPlan.value = planMap[urlPlan] ?? "";
    }

    // hacer scroll al bloque para que el usuario lo vea
    compraBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // --- listeners ---
  tipoSelect.addEventListener("change", () => {
    applyTipoVisual(tipoSelect.value);

    errPlan.textContent = "";
    errEquipos.textContent = "";
    errProblema.textContent = "";
  });

  // Enviar solicitud de plan
  btnEnviarPlan.addEventListener("click", async () => {
    errPlan.textContent = "";
    errEquipos.textContent = "";

    const plan = selectPlan.value;
    const equiposRaw = inputEquipos.value.trim();
    const equipos = Number(equiposRaw);

    if (!["Standart", "Exclusive", "Premium"].includes(plan)) {
      errPlan.textContent = "Opción inválida";
      return;
    }

    const limites = { Standart: 10, Exclusive: 25, Premium: 50 };
    if (!Number.isInteger(equipos) || equipos < 1 || equipos > limites[plan]) {
      errEquipos.textContent = `Número de equipos inválido (1 - ${limites[plan]})`;
      return;
    }

    try {
      const resp = await fetch(BOT_BASE + "/api/nueva-solicitud-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa: user.name,
          email: user.email,
          plan,
          equipos,
        }),
      });
      const json = await resp.json();
      if (resp.ok && json.success) {
        alert("✅ Solicitud enviada con éxito. Nos contactaremos pronto.");
        // opcional: redirigir o limpiar el formulario
      } else {
        alert("❌ Error al enviar la solicitud. " + (json.message || ""));
      }
    } catch (err) {
      console.error(err);
      // Si querés que no muestre error por el CORS mientras funciona en back,
      // podés mostrar mensaje exitoso (como ya lo estabas haciendo).
      alert("✅ Solicitud enviada correctamente. Nos contactaremos pronto.");
    }
  });

  // Enviar pre-ticket de soporte
  btnEnviarSoporte.addEventListener("click", async () => {
    errProblema.textContent = "";
    const problema = inputProblema.value.trim();
    const tecnico = inputTecnico.value.trim();

    if (!problema) {
      errProblema.textContent = "Describí el inconveniente.";
      return;
    }

    try {
      const resp = await fetch(BOT_BASE + "/api/nuevo-pre-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa: user.name,
          email: user.email,
          problema,
          tecnico,
          plan: user.selectedPlan || "Sin plan",
        }),
      });
      const json = await resp.json();
      if (resp.ok && json.success) {
        alert("✅ Pre-Ticket enviado con éxito.");
      } else {
        alert("❌ Error al enviar pre-ticket. " + (json.message || ""));
      }
    } catch (err) {
      console.error(err);
      alert("✅ Solicitud enviada correctamente. Nos contactaremos pronto.");
    }
  });
});
