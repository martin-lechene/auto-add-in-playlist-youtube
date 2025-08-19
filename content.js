// Utilitaire pour attendre un élément
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector))
      return resolve(document.querySelector(selector));
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// Ajout des boutons sous la vidéo
async function addQuickButtons() {
  const saveBtn = await waitForElm('button[aria-label*="Enregistrer"]');
  if (!saveBtn || document.querySelector(".quick-save-container")) return;

  chrome.storage.sync.get({ playlists: [] }, (data) => {
    const container = document.createElement("div");
    container.className = "quick-save-container";
    container.style.display = "flex";
    container.style.gap = "6px";
    container.style.marginLeft = "10px";

    data.playlists.forEach((pl) => {
      const btn = document.createElement("button");
      btn.textContent = `${pl.icon || ""} ${pl.name}`;
      btn.style.background = pl.color || "#3ea6ff";
      btn.style.color = "white";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.padding = "4px 8px";
      btn.style.cursor = "pointer";
      btn.addEventListener("click", () => quickSave(pl));
      container.appendChild(btn);
    });

    saveBtn.parentNode.appendChild(container);
  });
}

// Fonction qui ajoute dans une ou plusieurs playlists
async function quickSave(pl) {
  const saveBtn = document.querySelector('button[aria-label*="Enregistrer"]');
  if (!saveBtn) return alert("Bouton Enregistrer introuvable");

  saveBtn.click();
  const popup = await waitForElm(
    "ytd-add-to-playlist-renderer, tp-yt-paper-dialog"
  );

  setTimeout(() => {
    const items = [...document.querySelectorAll("yt-formatted-string")];

    // Playlist principale
    const target = items.find((el) => el.innerText.trim() === pl.name);
    if (target) target.click();

    // Multi playlists
    if (pl.multi && pl.multi.length) {
      pl.multi.forEach((name) => {
        const extra = items.find((el) => el.innerText.trim() === name);
        if (extra) extra.click();
      });
    }

    // Fermer popup
    const closeBtn = document.querySelector(
      'yt-icon-button[aria-label="Fermer"]'
    );
    if (closeBtn) closeBtn.click();

    console.log(
      `✅ Ajouté à : ${pl.name} ${
        pl.multi && pl.multi.length ? "+ " + pl.multi.join(", ") : ""
      }`
    );
  }, 500);
}

// Ecoute des raccourcis clavier
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "command") {
    chrome.storage.sync.get({ playlists: [] }, (data) => {
      const pl = data.playlists.find((p) => p.shortcut === msg.command);
      if (pl) quickSave(pl);
    });
  }
});

// Initialisation
function init() {
  if (location.pathname.startsWith("/watch")) addQuickButtons();
}

// Suivi navigation SPA
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    init();
  }
}).observe(document, { subtree: true, childList: true });

init();
