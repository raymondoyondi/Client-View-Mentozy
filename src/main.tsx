
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import "./styles/index.css";
import Intercom, { boot, shutdown, update } from "@intercom/messenger-js-sdk";
import { getSupabase } from "./lib/supabase";

const supabase = getSupabase();

// The core SDK script must be initialized first before boot/shutdown work
Intercom({
  app_id: "qvu6wbfn"
});

let isIntercomBooted = false;

if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;

    const intercomData = user ? {
       app_id: "qvu6wbfn",
       user_id: user.id,
       name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Mentozy User",
       email: user.email || "",
       created_at: Math.floor(new Date(user.created_at).getTime() / 1000)
    } : {
       app_id: "qvu6wbfn"
    };

    if (!isIntercomBooted) {
      // First time loading the app
      boot(intercomData);
      isIntercomBooted = true;
    } else {
      // Auth state changed (logged in or logged out)
      if (event === 'SIGNED_OUT' || !user) {
        // Only completely tear down the chat if logging out so we don't leak user info
        shutdown();
        boot(intercomData);
      } else {
        // If logging in, just update the existing widget to identify the user
        update(intercomData);
      }
    }
  });
} else {
  boot({
    app_id: "qvu6wbfn"
  });
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);