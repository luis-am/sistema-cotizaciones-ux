document.addEventListener('DOMContentLoaded', () => {
  const yearNode = document.querySelector('[data-year]');
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  document.querySelectorAll('[data-demo-toast]').forEach(btn => {
    btn.addEventListener('click', () => {
      const selector = btn.getAttribute('data-demo-toast');
      const toastEl = document.querySelector(selector);
      if (toastEl && window.bootstrap) bootstrap.Toast.getOrCreateInstance(toastEl).show();
    });
  });

  document.querySelectorAll('[data-fill-demo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = document.querySelector(btn.getAttribute('data-target'));
      if (!form) return;
      Object.entries(JSON.parse(btn.dataset.fillDemo)).forEach(([name, value]) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) input.value = value;
      });
    });
  });
});

function logout() {
  window.location.href = "../../index.html";
}

function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (email === "admin@cotizaciones.com" && password === "admin123") {
    window.location.href = "pages/admin/dashboard.html";
    return;
  }

  if (email === "vendedor@cotizaciones.com" && password === "vendedor123") {
    window.location.href = "pages/vendedor/dashboard.html";
    return;
  }

  if (email === "cliente@empresa.com" && password === "cliente123") {
    window.location.href = "pages/cliente/dashboard.html";
    return;
  }

  alert("Credenciales incorrectas");
}
function showQuoteStep(step) {

  const productosSection = document.getElementById("productosSection");
  const clienteSection = document.getElementById("clienteSection");

  const stepProductosBtn = document.getElementById("stepProductosBtn");
  const stepClienteBtn = document.getElementById("stepClienteBtn");

  if (!productosSection || !clienteSection) return;

  if (step === "productos") {

    productosSection.style.display = "block";
    clienteSection.style.display = "none";

    stepProductosBtn.classList.add("active");
    stepClienteBtn.classList.remove("active");

  }

  if (step === "cliente") {

    productosSection.style.display = "none";
    clienteSection.style.display = "block";

    stepProductosBtn.classList.remove("active");
    stepClienteBtn.classList.add("active");

  }

}