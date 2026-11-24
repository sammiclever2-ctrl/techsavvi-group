document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  // Header shadow once the page scrolls
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    const scrolled = window.scrollY > 8;
    header?.classList.toggle("shadow-sm", scrolled);
    header?.classList.toggle("border-slate-200", scrolled);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("mobileMenu");
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    menu?.classList.toggle("hidden", open);
  });

  // Reveal sections as they scroll into view
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-visible"));
  }

  // Pre-select a course on the Academy form from ?course=... or a course card button
  const courseSelect = document.getElementById("course");
  const params = new URLSearchParams(location.search);
  if (courseSelect && params.get("course")) courseSelect.value = params.get("course");
  document.querySelectorAll("[data-course]").forEach((btn) =>
    btn.addEventListener("click", () => { if (courseSelect) courseSelect.value = btn.dataset.course; })
  );

  // Pre-select the service on the contact form from ?service=...
  const serviceSelect = document.getElementById("service");
  if (serviceSelect && params.get("service")) serviceSelect.value = params.get("service");

  // Forms: submit to Formspree without leaving the page
  document.querySelectorAll("form[data-ajax]").forEach((form) => {
    const status = form.querySelector(".form-status");
    const button = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const label = button.textContent;
      button.disabled = true;
      button.textContent = "Sending…";
      status.className = "form-status";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        status.textContent = form.dataset.success || "Thank you. We'll be in touch shortly.";
        status.classList.add("is-success");
      } catch {
        status.textContent = "Sorry, something went wrong. Please try again, or reach us on WhatsApp.";
        status.classList.add("is-error");
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  });
});
