// === CONFIG DES PLAYLISTS (modifiable) ===
const playlists = ["Musiques", "Documentaires", "Learn"];

// === Attente que le DOM soit prêt ===
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// === Fonction qui ajoute les boutons rapides ===
async function addQuickButtons() {
  const saveBtn = await waitForElm('button[aria-label*="Enregistrer"]');

  if (document.querySelector(".quick-save-container")) return; // éviter doublons

  const container = document.createElement("div");
  container.className = "quick-save-container";
  container.style.display = "flex";
  container.style.gap = "6px";
  container.style.marginLeft = "10px";

  playlists.forEach((plName) => {
    const btn = document.createElement("button");
    btn.textContent = plName;
    btn.style.background = "#3ea6ff";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.padding = "4px 8px";
    btn.style.cursor = "pointer";

    btn.addEventListener("click", () => quickSave(plName));
    container.appendChild(btn);
  });

  // Insérer les boutons juste après le bouton "Enregistrer"
  saveBtn.parentNode.appendChild(container);
}

// === Fonction pour cliquer sur "Enregistrer" et choisir la playlist ===
async function quickSave(playlistName) {
  const saveBtn = document.querySelector('button[aria-label*="Enregistrer"]');
  if (!saveBtn) return alert("Bouton Enregistrer introuvable");

  saveBtn.click(); // ouvrir la popup

  // attendre la popup
  const popup = await waitForElm(
    "ytd-add-to-playlist-renderer, tp-yt-paper-dialog"
  );

  setTimeout(() => {
    const items = [...document.querySelectorAll("yt-formatted-string")];
    const target = items.find((el) => el.innerText.trim() === playlistName);

    if (target) {
      target.click(); // cliquer sur la playlist
      console.log(`✅ Ajouté à la playlist: ${playlistName}`);

      // fermer popup
      const closeBtn = document.querySelector(
        'yt-icon-button[aria-label="Fermer"]'
      );
      if (closeBtn) closeBtn.click();
    } else {
      alert(`❌ Playlist "${playlistName}" introuvable`);
    }
  }, 500);
}

// === Lancer l’injection des boutons quand on est sur une page vidéo ===
function init() {
  if (location.pathname.startsWith("/watch")) {
    addQuickButtons();
  }
}

// Détection navigation YouTube (car SPAs → pas de reload)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    init();
  }
}).observe(document, { subtree: true, childList: true });

init();
