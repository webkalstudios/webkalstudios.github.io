// Menu de navigation sur petit écran.
const bouton = document.querySelector(".burger");
const panneau = document.getElementById("menu-mobile");

if (bouton && panneau) {
  const ouvrir = (etat) => {
    panneau.hidden = !etat;
    bouton.setAttribute("aria-expanded", String(etat));
    bouton.setAttribute("aria-label", etat ? "Fermer le menu" : "Ouvrir le menu");
  };

  bouton.addEventListener("click", () => {
    ouvrir(panneau.hidden);
  });

  // Un lien choisi : on referme avant de naviguer.
  panneau.addEventListener("click", (e) => {
    if (e.target instanceof HTMLAnchorElement) ouvrir(false);
  });

  // Échap, ou un clic en dehors de la barre.
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panneau.hidden) {
      ouvrir(false);
      bouton.focus();
    }
  });

  addEventListener("click", (e) => {
    if (panneau.hidden) return;
    const dansLaBarre = e.target instanceof Node && e.target.closest(".top");
    if (!dansLaBarre) ouvrir(false);
  });

  // Repassé en grand écran : le panneau n'a plus lieu d'être ouvert.
  matchMedia("(min-width: 781px)").addEventListener("change", (e) => {
    if (e.matches) ouvrir(false);
  });
}

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
