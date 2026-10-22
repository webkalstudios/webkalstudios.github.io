// Formulaire de demande de devis.
const devis = document.getElementById("devis");

if (devis) {
  const bouton = document.getElementById("envoyer");
  const repOk = document.getElementById("reponse-ok");
  const repKo = document.getElementById("reponse-ko");
  const texteBouton = bouton.innerHTML;

  const montrer = (quoi) => {
    repOk.hidden = quoi !== "ok";
    repKo.hidden = quoi !== "ko";
  };

  devis.addEventListener("submit", async (e) => {
    e.preventDefault();
    montrer(null);

    // Validation du navigateur : on laisse le premier champ fautif se signaler.
    if (!devis.checkValidity()) {
      devis.reportValidity();
      const fautif = devis.querySelector(":invalid");
      if (fautif instanceof HTMLElement) fautif.focus();
      return;
    }

    bouton.disabled = true;
    bouton.textContent = "Envoi en cours…";

    const donnees = Object.fromEntries(new FormData(devis).entries());

    try {
      const reponse = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(donnees),
      });
      const resultat = await reponse.json().catch(() => ({}));

      if (reponse.ok && resultat.success) {
        devis.reset();
        montrer("ok");
        repOk.scrollIntoView({ block: "center", behavior: "smooth" });
      } else {
        montrer("ko");
        console.error("[webkal] envoi refusé :", resultat);
      }
    } catch (erreur) {
      montrer("ko");
      console.error("[webkal] envoi impossible :", erreur);
    } finally {
      bouton.disabled = false;
      bouton.innerHTML = texteBouton;
    }
  });
}

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
