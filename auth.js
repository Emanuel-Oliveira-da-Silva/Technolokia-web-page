const ADMIN_EMAIL = "contacto.technolokia@gmail.com";
const ADMIN_PASS = "technolokia2025";

function getUser() {
  try {
    const raw = localStorage.getItem("technolokia:user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function setUser(u) {
  localStorage.setItem("technolokia:user", JSON.stringify(u));
}
function getSession() {
  try {
    const raw = localStorage.getItem("technolokia:session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function setSession(s) {
  localStorage.setItem("technolokia:session", JSON.stringify(s));
}

function isAdminSession() {
  const s = getSession();
  return s && s.email === ADMIN_EMAIL;
}

function syncHeader() {
  const s = getSession();
  const navRegister = document.querySelector(".nav-register");
  const navLogin = document.querySelector(".nav-login");
  const navProfile = document.querySelector(".nav-profile");
  const navAdmin = document.querySelector(".nav-admin");
  const navLogout = document.querySelector(".nav-logout");
  if (!navRegister || !navLogin || !navProfile || !navAdmin || !navLogout)
    return;

  if (s && s.email) {
    navRegister.classList.add("hidden");
    navLogin.classList.add("hidden");
    navProfile.classList.remove("hidden");
    navLogout.classList.remove("hidden");
    isAdminSession()
      ? navAdmin.classList.remove("hidden")
      : navAdmin.classList.add("hidden");
  } else {
    navRegister.classList.remove("hidden");
    navLogin.classList.remove("hidden");
    navProfile.classList.add("hidden");
    navAdmin.classList.add("hidden");
    navLogout.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  syncHeader();

  // Mostrar plan preseleccionado en registro
  const selPlanBox = document.getElementById("selected-plan-box");
  if (selPlanBox) {
    const p = localStorage.getItem("technolokia:selected-plan") || "standard";
    const label =
      { standard: "STANDARD", exclusive: "EXCLUSIVE", premium: "PREMIUM" }[p] ||
      p;
    selPlanBox.innerHTML = `<b>Plan seleccionado:</b> ${label}`;
  }

  // Registro
  const regForm = document.getElementById("register-form");
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const email = document
        .getElementById("reg-email")
        .value.trim()
        .toLowerCase();
      const pass = document.getElementById("reg-pass").value;
      const phone = document.getElementById("reg-phone").value.trim();
      if (!name || !email || !pass || !phone) {
        return;
      }
      const selectedPlan =
        localStorage.getItem("technolokia:selected-plan") || "standard";
      const user = {
        name,
        email,
        password: pass,
        phone,
        planes: selectedPlan ? [{ tipo: selectedPlan, equipos: 0 }] : [],
        lastTicket: null,
        role: email === ADMIN_EMAIL ? "admin" : "user",
      };

      setUser(user);
      setSession({ email: user.email });
      const fb = document.getElementById("reg-feedback");
      if (fb) fb.textContent = "Registro exitoso.";
      setTimeout(() => (location.href = "profile.html"), 700);
    });
  }

  // Login
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document
        .getElementById("login-email")
        .value.trim()
        .toLowerCase();
      const pass = document.getElementById("login-pass").value;
      let user = getUser();

      // Admin fast-login
      if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        if (!user || user.email !== ADMIN_EMAIL) {
          user = {
            name: "Administrador",
            email: ADMIN_EMAIL,
            password: ADMIN_PASS,
            phone: "-",
            premium: true,
            selectedPlan: "premium",
            lastTicket: null,
            role: "admin",
          };
          setUser(user);
        }
        setSession({ email: ADMIN_EMAIL });
        const fb = document.getElementById("login-feedback");
        if (fb) fb.textContent = "Login admin correcto.";
        setTimeout(() => (location.href = "admin.html"), 500);
        return;
      }

      if (!user || email !== user.email || pass !== user.password) {
        const fb = document.getElementById("login-feedback");
        if (fb)
          fb.textContent = "Credenciales incorrectas o usuario no registrado.";
        return;
      }
      setSession({ email: user.email });
      const fb = document.getElementById("login-feedback");
      if (fb) fb.textContent = "Login correcto.";
      setTimeout(() => (location.href = "profile.html"), 500);
    });
  }

  // Perfil
  const profileBox = document.getElementById("profile-box");
  if (profileBox) {
    const s = getSession();
    const user = getUser();

    if (!s || !user || s.email !== user.email) {
      profileBox.innerHTML =
        '<p class="muted">No hay sesión activa. <a href="login.html">Iniciar sesión</a></p>';
      return;
    }

    profileBox.innerHTML = `
    <div><b>Nombre:</b> ${user.name}</div>
    <div><b>Email:</b> ${user.email}</div>
    <div><b>Teléfono:</b> ${user.phone || "—"}</div>
  `;

    // ==== Sincronizar estado de solicitudes con Discord ====
    (async () => {
      try {
        const res = await fetch(
          "https://technolokia-bot-production.up.railway.app/api/solicitudes"
        );
        const data = await res.json();
        const userEmail = user.email.toLowerCase();

        for (const id in data) {
          const s = data[id];
          if (s.email.toLowerCase() !== userEmail) continue;

          // Si fue aprobado → agregar/reemplazar plan
          if (s.estado === "aprobado") {
            const tipo =
              s.plan.toLowerCase() === "standart"
                ? "standard"
                : s.plan.toLowerCase();
            const exists = user.planes.some((p) => p.tipo === tipo);
            if (!exists) {
              user.planes.push({ tipo, equipos: s.equipos });
              setUser(user);
            }
          }

          // Si fue rechazado → guardar rechazo para mostrarlo
          if (s.estado === "rechazado") {
            user.planes.push({
              tipo: s.plan.toLowerCase(),
              equipos: 0,
              estado: "rechazado",
              razon: s.razon || "Sin motivo especificado",
            });
            setUser(user);
          }
        }
      } catch (err) {
        console.warn("No se pudo sincronizar planes:", err);
      }
    })();

    // Mostrar planes
    const planesBox = document.getElementById("planes-box");
    const plansInfo = {
      standard: {
        title: "PLAN STANDARD",
        equipos: 10,
        price: "$200 USD / mes",
      },
      exclusive: {
        title: "PLAN EXCLUSIVE",
        equipos: 25,
        price: "$450 USD / mes",
      },
      premium: { title: "PLAN PREMIUM", equipos: 50, price: "$800 USD / mes" },
    };

    if (!user.planes || user.planes.length === 0) {
      planesBox.innerHTML = `<p class="muted" style="margin-top:12px;">No tenés planes contratados.</p>`;
    } else {
      planesBox.innerHTML = user.planes
        .map((p, i) => {
          // 🔥 Normalizar nombre del plan
          let tipo = p.tipo.toLowerCase();
          if (tipo === "standart") tipo = "standard";

          const info = plansInfo[tipo];
          if (!info) return "";

          return `
        <div class="panel plan" style="margin-top:16px;">
          <h3>${
            p.estado === "rechazado" ? "❌ Plan Rechazado" : info.title
          }</h3>
<p class="muted">
  ${
    p.estado === "rechazado"
      ? p.razon || "Sin detalle"
      : `${p.equipos} equipos registrados`
  }
</p>

          <h2 class="price">${info.price}</h2>
          <button class="btn btn-danger" data-index="${i}">Eliminar plan</button>
        </div>
      `;
        })
        .join("");

      // Listener para eliminar plan
      planesBox.querySelectorAll("button.btn-danger").forEach((btn) => {
        btn.addEventListener("click", () => {
          user.planes.splice(Number(btn.dataset.index), 1);
          setUser(user);
          location.reload();
        });
      });
    }
  }

  // Solicitud
  const svcForm = document.getElementById("service-form");
  if (svcForm) {
    svcForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = getSession();
      let user = getUser();
      const fb = document.getElementById("svc-feedback");
      if (!s || !user || s.email !== user.email) {
        fb.textContent = "Tenés que estar logueado para enviar una solicitud.";
        return;
      }
      const subject = document.getElementById("svc-subject").value.trim();
      const details = document.getElementById("svc-details").value.trim();
      const wantsPremium = document.getElementById("svc-premium").checked;
      if (!subject || !details) {
        fb.textContent = "Completá asunto y descripción.";
        return;
      }
      if (wantsPremium) {
        user.premium = true;
        user.selectedPlan = "premium";
      }
      user.lastTicket = {
        subject,
        details,
        date: new Date().toLocaleString(),
        premium: user.premium,
      };
      setUser(user);
      fb.textContent =
        "Solicitud registrada (demo local). Se actualizó tu perfil.";
      setTimeout(() => (location.href = "profile.html"), 900);
    });
  }

  // Admin
  const adminBox = document.getElementById("admin-box");
  if (adminBox) {
    if (!isAdminSession()) {
      adminBox.innerHTML =
        '<p class="muted">Acceso solo para administrador.</p>';
      return;
    }
    const user = getUser();
    if (!user) {
      adminBox.innerHTML =
        '<p class="muted">No hay usuarios cargados en este demo.</p>';
      return;
    }
    const t = user.lastTicket;
    const label =
      { standard: "STANDARD", exclusive: "EXCLUSIVE", premium: "PREMIUM" }[
        user.selectedPlan
      ] || "-";
    adminBox.innerHTML = `
      <h3>Cliente actual</h3>
      <table class="table">
        <tr><th>Nombre</th><th>Email</th><th>Plan</th><th>Premium</th></tr>
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${label}</td>
          <td>${user.premium ? "Sí" : "No"}</td>
        </tr>
      </table>
      <h3>Última solicitud</h3>
      ${
        t
          ? `
        <div><b>Fecha:</b> ${t.date}</div>
        <div><b>Asunto:</b> ${t.subject}</div>
        <div><b>Detalle:</b> ${t.details}</div>
        <div><b>Premium en ese momento:</b> ${t.premium ? "Sí" : "No"}</div>
      `
          : '<p class="muted">Sin solicitudes registradas.</p>'
      }
    `;
  }
});
