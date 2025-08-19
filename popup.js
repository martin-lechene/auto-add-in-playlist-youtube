const listEl = document.getElementById("playlist-list");
const addBtn = document.getElementById("addBtn");

// Charger les playlists depuis chrome.storage
function loadPlaylists() {
  chrome.storage.sync.get({ playlists: [] }, (data) => {
    listEl.innerHTML = "";
    data.playlists.forEach((pl, idx) => {
      const div = document.createElement("div");
      div.className = "playlist-item";

      div.innerHTML = `
                <button class="delete-btn" data-idx="${idx}">❌</button>
                <label>Nom <input type="text" class="pl-name" value="${
                  pl.name
                }"></label>
                <label>Icône <input type="text" class="pl-icon" value="${
                  pl.icon || ""
                }" placeholder="🎵"></label>
                <label>Couleur <input type="color" class="pl-color" value="${
                  pl.color || "#3ea6ff"
                }"></label>
                <label>Raccourci
                  <select class="pl-shortcut">
                    <option value="">Aucun</option>
                    <option value="quick-save-1" ${
                      pl.shortcut === "quick-save-1" ? "selected" : ""
                    }>Ctrl+Shift+1</option>
                    <option value="quick-save-2" ${
                      pl.shortcut === "quick-save-2" ? "selected" : ""
                    }>Ctrl+Shift+2</option>
                    <option value="quick-save-3" ${
                      pl.shortcut === "quick-save-3" ? "selected" : ""
                    }>Ctrl+Shift+3</option>
                    <option value="quick-save-4" ${
                      pl.shortcut === "quick-save-4" ? "selected" : ""
                    }>Ctrl+Shift+4</option>
                  </select>
                </label>
                <label>Multi-playlists (séparer par ,)
                  <input type="text" class="pl-multi" value="${
                    pl.multi ? pl.multi.join(",") : ""
                  }" placeholder="Musiques,Learn">
                </label>
            `;

      // Sauvegarde à la volée
      div.querySelectorAll("input, select").forEach((input) => {
        input.addEventListener("change", () => {
          data.playlists[idx] = {
            name: div.querySelector(".pl-name").value,
            icon: div.querySelector(".pl-icon").value,
            color: div.querySelector(".pl-color").value,
            shortcut: div.querySelector(".pl-shortcut").value,
            multi: div
              .querySelector(".pl-multi")
              .value.split(",")
              .map((v) => v.trim())
              .filter((v) => v),
          };
          chrome.storage.sync.set({ playlists: data.playlists });
        });
      });

      // Suppression
      div.querySelector(".delete-btn").addEventListener("click", () => {
        data.playlists.splice(idx, 1);
        chrome.storage.sync.set({ playlists: data.playlists }, loadPlaylists);
      });

      listEl.appendChild(div);
    });
  });
}

// Ajouter une playlist
addBtn.addEventListener("click", () => {
  chrome.storage.sync.get({ playlists: [] }, (data) => {
    data.playlists.push({
      name: "Nouvelle",
      icon: "⭐",
      color: "#3ea6ff",
      shortcut: "",
      multi: [],
    });
    chrome.storage.sync.set({ playlists: data.playlists }, loadPlaylists);
  });
});

loadPlaylists();
