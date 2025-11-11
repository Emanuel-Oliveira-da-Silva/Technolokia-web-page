// ===== VISIBILIDAD DE SECCIONES =====
const tipoSolicitud = document.getElementById("tipo-solicitud");
const sectionPlan = document.getElementById("section-plan");
const sectionSoporte = document.getElementById("section-soporte");

tipoSolicitud.addEventListener("change", () => {
  const val = tipoSolicitud.value;

  sectionPlan.classList.toggle("hidden", val !== "plan");
  sectionSoporte.classList.toggle("hidden", val !== "soporte");
});

// ===== FORMULARIO =====
const form = document.getElementById("request-form");
const feedback = document.getElementById("form-feedback");

// PLAN
const planSelect = document.getElementById("plan-select");
const equiposInput = document.getElementById("equipos");

// SOPORTE
const descripcionInput = document.getElementById("descripcion");
const tecnicoPreferidoInput = document.getElementById("tecnico-preferido");

// ERRORES
const errorTipo = document.getElementById("error-tipo");
const errorPlan = document.getElementById("error-plan");
const errorEquipos = document.getElementById("error-equipos");
const errorDescripcion = document.getElementById("error-descripcion");

function clearErrors() {
  errorTipo.textContent = "";
  errorPlan.textContent = "";
  errorEquipos.textContent = "";
  errorDescripcion.textContent = "";
  feedback.textContent = "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const tipo = tipoSolicitud.value;
  let data = { tipo };

  // ===== VALIDACIÓN COMPRA DE PLAN =====
  if (tipo === "plan") {
    const plan = planSelect.value;
    const equipos = Number(equiposInput.value);

    if (!plan) {
      errorPlan.textContent = "Debes seleccionar un plan.";
      return;
    }

    if (!equipos || equipos <= 0) {
      errorEquipos.textContent = "Ingresá una cantidad válida.";
      return;
    }

    data.plan = plan;
    data.equipos = equipos;
  }

  // ===== VALIDACIÓN PROBLEMA TÉCNICO =====
  if (tipo === "soporte") {
    const desc = descripcionInput.value.trim();
    if (!desc) {
      errorDescripcion.textContent = "Describí el problema.";
      return;
    }

    data.descripcion = desc;
    data.tecnicoPreferido = tecnicoPreferidoInput.value.trim() || "No especificado";
  }

  // ===== ENVIAR =====
  try {
    const res = await fetch("https://technolokia-bot-production.up.railway.app/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error en el servidor");

    feedback.textContent = "✅ Solicitud enviada correctamente. ¡Nos vamos a contactar!";
    form.reset();
    sectionPlan.classList.add("hidden");
    sectionSoporte.classList.add("hidden");

  } catch (err) {
    console.error(err);
    feedback.textContent = "❌ Hubo un error, intentá más tarde.";
  }
});
