import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSystems } from "./lib/init";

// Initialize collective systems in background
initializeSystems().then(status => {
  console.log('[MAIN] Systems initialized:', status);
}).catch(err => {
  console.error('[MAIN] System init error:', err);
});

createRoot(document.getElementById("root")!).render(<App />);
