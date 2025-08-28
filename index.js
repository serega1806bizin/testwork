const prefersReduce =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const id = this.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({
      behavior: prefersReduce ? "auto" : "smooth",
    });
  });
});

const ioReveal = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add("show");
    });
  },
  { threshold: 0.15 }
);
document
  .querySelectorAll(".intro, .text")
  .forEach((el) => ioReveal.observe(el));

const navLinks = document.querySelectorAll(".nav a");
const sections = [...document.querySelectorAll("main section[id]")];

function setActive(id) {
  navLinks.forEach((a) => a.removeAttribute("aria-current"));
  document
    .querySelector(`.nav a[href="#${id}"]`)
    ?.setAttribute("aria-current", "page");
}

function syncByCenter() {
  if (window.scrollY < 40) {
    setActive("home");
    return;
  }

  const viewportCenter = window.scrollY + window.innerHeight / 2;
  let bestId = null,
    bestDelta = Infinity;

  for (const s of sections) {
    const rect = s.getBoundingClientRect();
    const secCenter = window.scrollY + rect.top + rect.height / 2;
    const delta = Math.abs(secCenter - viewportCenter);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestId = s.id;
    }
  }
  if (bestId) setActive(bestId);
}

const throttle = (fn, wait = 100) => {
  let t = 0;
  return () => {
    const now = Date.now();
    if (now - t > wait) {
      t = now;
      fn();
    }
  };
};

window.addEventListener("scroll", throttle(syncByCenter), {
  passive: true,
});
window.addEventListener("resize", syncByCenter);
document.addEventListener("DOMContentLoaded", syncByCenter);
syncByCenter();

const burger = document.querySelector(".burger");
const panel = document.getElementById("mobileNav");
const closeBtn = document.querySelector(".mobile-nav__close");
const backdrop = document.querySelector(".backdrop");
let releaseTrap = null;

function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return () => {};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const handler = (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener("keydown", handler);
  first.focus({ preventScroll: true });
  return () => container.removeEventListener("keydown", handler);
}

function openMenu() {
  burger.classList.add("is-open");
  panel.classList.add("open");
  document.body.classList.add("menu-open");
  burger.setAttribute("aria-expanded", "true");
  panel.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  releaseTrap = trapFocus(panel);
}
function closeMenu() {
  burger.classList.remove("is-open");
  panel.classList.remove("open");
  document.body.classList.remove("menu-open");
  burger.setAttribute("aria-expanded", "false");
  panel.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
  if (releaseTrap) {
    releaseTrap();
    releaseTrap = null;
  }
  burger.focus({ preventScroll: true });
}
function toggleMenu() {
  panel.classList.contains("open") ? closeMenu() : openMenu();
}

burger.addEventListener("click", toggleMenu);
closeBtn.addEventListener("click", closeMenu);
backdrop.addEventListener("click", closeMenu);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
panel
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", closeMenu));
