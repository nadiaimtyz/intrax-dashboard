import { useState } from "react";
import IntraxDashboard from "./IntraxDashboard";
import LoginPage from "./LoginPage"; // <- bikin file ini dulu

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? (
        <IntraxDashboard onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

export default App;
