import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Crimes from "./pages/Crimes";
import Admin from "./pages/Admin";

function App() {
  return (
    <div>
      {/* Navbar is persistent across pages */}
      <Navbar />

      {/* Define Routes */}
      <Routes>
        <Route path="/crimes" element={<Crimes />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
