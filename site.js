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
    // « Répondre » doit écrire au visiteur, pas au service qui transmet le message.
    donnees.replyto = donnees["E-mail"];

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

// Parties de l'accueil, avec des adresses sans « # » : /services, /comment-ca-se-passe.
const parties = { "/": "top", "/services": "services", "/comment-ca-se-passe": "deroule" };
const surAccueil = ["/", "/index", "/index.html"].includes(location.pathname);

if (surAccueil) {
  const aller = (id, comment) => {
    const cible = document.getElementById(id);
    if (!cible) return false;
    if (id === "top") scrollTo({ top: 0, behavior: comment });
    else cible.scrollIntoView({ behavior: comment });
    return true;
  };

  // Sur l'accueil, un lien de menu fait défiler la page sans toucher à l'adresse.
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const lien = e.target instanceof Element ? e.target.closest("a[href]") : null;
    const id = lien && parties[lien.getAttribute("href")];
    if (id && aller(id, "smooth")) e.preventDefault();
  });

  // Arrivée par /services ou /comment-ca-se-passe : on descend tout de suite à la partie.
  let demande = null;
  try {
    demande = sessionStorage.getItem("partie");
    sessionStorage.removeItem("partie");
  } catch {}

  // Ancien lien en « /#services » : le navigateur a déjà défilé, on nettoie l'adresse.
  if (!demande && location.hash) {
    demande = location.hash.slice(1);
    history.replaceState(null, "", "/");
  }

  if (demande && aller(demande, "instant")) {
    // Les polices et images peuvent décaler la page : on recale une fois tout chargé.
    addEventListener("load", () => aller(demande, "instant"), { once: true });
  }
}

// Finitions à la souris (ordinateur seulement, et jamais si l'appareil préfère moins d'animation) :
// le téléphone s'incline vers le curseur, une lumière le suit, et les cartes ont un reflet.
const sourisFine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (sourisFine && !calme) {
  const heros = document.querySelector(".hero.accueil");
  if (heros) {
    let image = 0;
    heros.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(image);
      image = requestAnimationFrame(() => {
        const r = heros.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 2 - 1;
        const y = ((e.clientY - r.top) / r.height) * 2 - 1;
        heros.style.setProperty("--px", x.toFixed(3));
        heros.style.setProperty("--py", y.toFixed(3));
      });
    });
    heros.addEventListener("pointerleave", () => {
      heros.style.setProperty("--px", "0");
      heros.style.setProperty("--py", "0");
    });
  }

  document.querySelectorAll(".carte, .tarif, .repere, .etape").forEach((carte) => {
    carte.addEventListener("pointermove", (e) => {
      const r = carte.getBoundingClientRect();
      carte.style.setProperty("--x", `${e.clientX - r.left}px`);
      carte.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
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
