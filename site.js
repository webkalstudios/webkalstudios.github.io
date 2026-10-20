// Apparition douce des blocs, désactivée si l'appareil préfère moins d'animation.
const douceur = matchMedia("(prefers-reduced-motion: reduce)").matches;
const blocs = document.querySelectorAll(".monte");

if (douceur || !("IntersectionObserver" in window)) {
  blocs.forEach((b) => b.classList.add("vu"));
} else {
  const veilleur = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("vu");
      veilleur.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  blocs.forEach((b, i) => {
    b.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
    veilleur.observe(b);
  });
}

document.getElementById("annee").textContent = new Date().getFullYear();
