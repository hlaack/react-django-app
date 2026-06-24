import { useEffect } from "react";
import Login from './components/Login.tsx';

function App() {
  useEffect(() => {
    const initializeCsrf = async () => {
      try {
        await fetch('/api/csrf/', { credentials: 'include' });
        console.log("CSRF cookie initialized");
      } catch (error) {
        console.error("Failed to fetch CSRF token", error);
      }
    };

    initializeCsrf();
  }, []);

  return (
    <div>
      <h1>My Application</h1>
      <Login />
    </div>
  );
}

export default App;