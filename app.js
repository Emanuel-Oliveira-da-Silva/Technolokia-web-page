document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      nav.classList.toggle("open");
      const expanded = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", (!expanded).toString());
    });
  }

  const btnLogout = document.querySelector(".nav-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("technolokia:session");
      location.href = "index.html";
    });
  }

  // ===== Modal de Planes =====
  const plans = {
    standard: {
      title: "PLAN STANDARD",
      price: "$200 USD / mes",
      description: `
        ✅ Hasta 10 equipos<br>
        ✅ Soporte remoto en horario laboral<br>
        ✅ Solución provisional en la primera llamada<br>
        ✅ Técnicos certificados<br><br>
        Ideal para estudios, freelancers y oficinas pequeñas.
      `,
    },
    exclusive: {
      title: "PLAN EXCLUSIVE",
      price: "$450 USD / mes",
      description: `
        ✅ Hasta 25 equipos<br>
        ✅ Prioridad en incidentes críticos<br>
        ✅ Soporte 24/7<br>
        ✅ Técnico fijo asignado (Tomás o Franco)<br>
        ✅ Sin límite de solicitudes<br><br>
        Perfecto para empresas en crecimiento.
      `,
    },
    premium: {
      title: "PLAN PREMIUM",
      price: "$800 USD / mes",
      description: `
        ✅ Hasta 50 equipos<br>
        ✅ Soporte prioritario 24/7 + teléfono directo<br>
        ✅ Respuesta garantizada &lt; 1 hora<br>
        ✅ Auditoría trimestral de IT incluida<br>
        ✅ Gestión de seguridad + backup remoto<br><br>
        Diseñado para empresas que no pueden frenar su operación.
      `,
    },
  };

  const modal = document.getElementById("plan-modal");
  if (modal) {
    const modalTitle = document.getElementById("modal-plan-title");
    const modalPrice = document.getElementById("modal-plan-price");
    const modalDescription = document.getElementById("modal-plan-description");
    const modalSelect = document.getElementById("modal-select-plan");
    const closeModal = document.getElementById("close-modal");

    document.querySelectorAll(".select-plan").forEach((btn) => {
      btn.addEventListener("click", () => {
        const plan = btn.dataset.plan;
        const p = plans[plan];
        modalTitle.textContent = p.title;
        modalPrice.textContent = p.price;
        modalDescription.innerHTML = p.description;
        modal.classList.remove("hidden");

        modalSelect.onclick = () => {
          // Guardamos el plan (standard, exclusive o premium)
          localStorage.setItem("technolokia:selected-plan", plan);

          // Redirigimos a contac.html con los parámetros necesarios
          window.location.href = `contac.html?tipo=plan&plan=${plan}`;
        };
      });
    });

    closeModal.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }
});
