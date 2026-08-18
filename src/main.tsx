import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";

// Гарантуємо канонічний URL (з trailing slash) ДО старту OAuth-логіки.
// Без цього кроку той самий сайт, відкритий зі слешем чи без нього,
// відправляв би різний redirect_uri в Portal — і саме це причина
// "Invalid redirect_uri Error: 400" на GitHub Pages.
// Спрацьовує лише для прод-білду (де base — "/NTS_Sketch_map/"); localhost
// не займаємо, щоб не заважати dev-серверу.
if (!import.meta.env.DEV) {
  const { pathname, search, hash, origin } = window.location;
  if (!pathname.endsWith("/")) {
    window.location.replace(`${origin}${pathname}/${search}${hash}`);
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
