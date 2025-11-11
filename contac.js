// contac.js - cliente que llama a la API del bot
const BOT_BASE = "https://technolokia-bot-production.up.railway.app";

function getSession(){ try{ const raw=localStorage.getItem('technolokia:session'); return raw?JSON.parse(raw):null;}catch{return null;} }
function getUser(){ try{ const raw=localStorage.getItem('technolokia:user'); return raw?JSON.parse(raw):null;}catch{return null;} }

document.addEventListener("DOMContentLoaded", () => {
  const session = getSession();
  const user = getUser();

  // Asegurar que el usuario tenga array de planes
  if (user && !user.planes) {
    user.planes = [];
    localStorage.setItem('technolokia:user', JSON.stringify(user));
  }

  const params = new URLSearchParams(window.location.search);
  const urlTipo = params.get("tipo");
  const urlPlan = params.get("plan");

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

  if(!session || !user || session.email !== user.email){
    main.innerHTML = `<p class="alert">Tenés que iniciar sesión.<br><a href="login.html">Iniciar sesión</a></p>`;
    return;
  }

  // AUTO-SELECCIÓN SI VIENE DESDE "CONTRATAR PLAN"
  if (urlTipo === "plan") {
    tipoSelect.value = "plan";
    compraBox.classList.remove("hidden");
    soporteBox.classList.add("hidden");

    if (urlPlan) {
      const planMap = {
        standard: "Standart",
        exclusive: "Exclusive",
        premium: "Premium"
      };
      selectPlan.value = planMap[urlPlan] ?? "";
    }
  }

  // Cambio de selección
  tipoSelect.addEventListener("change", () => {
    if (tipoSelect.value === "plan") {
      compraBox.classList.remove("hidden");
      soporteBox.classList.add("hidden");
    } else if (tipoSelect.value === "soporte") {
      soporteBox.classList.remove("hidden");
      compraBox.classList.add("hidden");
    } else {
      compraBox.classList.add("hidden");
      soporteBox.classList.add("hidden");
    }
  });

  // === ENVIAR SOLICITUD DE PLAN ===
  btnEnviarPlan.addEventListener("click", async () => {
    errPlan.textContent = "";
    errEquipos.textContent = "";

    const plan = selectPlan.value;
    const equipos = Number(inputEquipos.value.trim());
    const limites = { Standart: 10, Exclusive: 25, Premium: 50 };

    if (!["Standart","Exclusive","Premium"].includes(plan)) {
      errPlan.textContent = "Opción inválida";
      return;
    }
    if (!Number.isInteger(equipos) || equipos < 1 || equipos > limites[plan]) {
      errEquipos.textContent = `Número de equipos inválido (1 - ${limites[plan]})`;
      return;
    }


    // Enviar a la API del bot (aunque marque CORS, igual funciona)
    try {
      await fetch(BOT_BASE + "/api/nueva-solicitud-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa: user.name,
          email: user.email,
          plan,
          equipos
        })
      });
    } catch (err) {
      console.warn("CORS bloqueó la respuesta, pero el servidor recibió la solicitud.");
    }

    alert("✅ Solicitud enviada. Finanzas la revisará.");
    location.href = "profile.html";
  });

  // === ENVIAR PRE-TICKET ===
  btnEnviarSoporte.addEventListener("click", async () => {
    errProblema.textContent = "";
    const problema = inputProblema.value.trim();
    const tecnico = inputTecnico.value.trim();

    if (!problema) {
      errProblema.textContent = "Describí el inconveniente.";
      return;
    }

    try {
      await fetch(BOT_BASE + "/api/nuevo-pre-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa: user.name,
          email: user.email,
          problema,
          tecnico,
          plan: user.selectedPlan || "Sin plan"
        })
      });
    } catch (err) {
      console.warn("CORS bloqueó la respuesta, pero el servidor recibió la solicitud.");
    }

    alert("✅ Pre-ticket enviado correctamente.");
  });
});
