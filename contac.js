function getSession() {
  try { return JSON.parse(localStorage.getItem("technolokia:session")); }
  catch { return null; }
}
function getUser() {
  try { return JSON.parse(localStorage.getItem("technolokia:user")); }
  catch { return null; }
}

document.addEventListener("DOMContentLoaded", () => {
  const session = getSession();
  const user = getUser();

  if (!session || !user || session.email !== user.email) {
    document.getElementById("main-form").innerHTML =
      `<p class="alert">Tenés que iniciar sesión.<br><a href="login.html">Iniciar sesión</a></p>`;
    return;
  }

  const tipoSelect = document.getElementById("tipo-solicitud");
  const compraBox = document.getElementById("compra-plan-box");
  const soporteBox = document.getElementById("soporte-box");

  tipoSelect.addEventListener("change", () => {
    compraBox.style.display = tipoSelect.value === "plan" ? "block" : "none";
    soporteBox.style.display = tipoSelect.value === "soporte" ? "block" : "none";
  });

  // ----- Solicitud de Plan -----
  document.getElementById("btn-enviar-plan").addEventListener("click", async () => {
    const plan = document.getElementById("select-plan").value;
    const equipos = parseInt(document.getElementById("input-equipos").value);
    const errPlan = document.getElementById("err-plan");
    const errEquipos = document.getElementById("err-equipos");

    errPlan.textContent = "";
    errEquipos.textContent = "";

    if (!["Standart", "Exclusive", "Premium"].includes(plan)) {
      errPlan.textContent = "Opción inválida";
      return;
    }

    const limites = { Standart: 10, Exclusive: 25, Premium: 50 };
    if (!(equipos >= 1 && equipos <= limites[plan])) {
      errEquipos.textContent = "Número de equipos inválido";
      return;
    }

    const res = await fetch("https://technolokia-bot-production.up.railway.app/api/nueva-solicitud-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa: user.name,
        email: user.email,
        plan,
        equipos
      })
    });

    if (res.ok) alert("✅ Solicitud enviada con éxito.");
  });

  // ----- Pre Ticket -----
  document.getElementById("btn-enviar-soporte").addEventListener("click", async () => {
    const problema = document.getElementById("input-problema").value.trim();
    const tecnico = document.getElementById("input-tecnico").value.trim();
    const errProb = document.getElementById("err-problema");

    errProb.textContent = "";
    if (!problema) {
      errProb.textContent = "Describí el inconveniente.";
      return;
    }

    const res = await fetch("https://technolokia-bot-production.up.railway.app/api/nuevo-pre-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa: user.name,
        email: user.email,
        problema,
        tecnico,
        plan: user.selectedPlan
      })
    });

    if (res.ok) alert("✅ Pre-Ticket enviado con éxito.");
  });
});
