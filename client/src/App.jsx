import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";

console.log("✅ Hot reload test", new Date().toLocaleTimeString());

export default function App() {
  const token = useAuthStore((s) => s.token);
  return token ? <Chat /> : <Login />;

  
}
console.log("✅ App reloaded:", new Date().toLocaleTimeString());
