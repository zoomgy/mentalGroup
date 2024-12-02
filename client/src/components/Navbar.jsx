import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGun } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { FaFingerprint } from "react-icons/fa";
import { GiMachineGunMagazine } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import { FaBars } from "react-icons/fa"; // For the hamburger menu
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../userSlice"; // Import logout action
import BACKEND_URL from "../BackendUrl";

function Navbar() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      // Clear token cookie from backend
      const response = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Ensures cookies are sent
      });

      if (!response.ok) {
        throw new Error("Failed to log out from server");
      }

      // Clear user state and navigate to login
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <nav className="bg-slate-600 text-white px-4 py-3">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Company Name */}
        <div className="text-2xl flex items-center justify-center gap-2">
          <FaGun />
          Mental Group
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-white">
            <FaBars size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`flex flex-col lg:flex-row space-x-4 lg:space-x-4 mt-4 lg:mt-0 lg:flex ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-2 text-slate-200 rounded-md hover:bg-slate-500 hover:text-white transition"
          >
            <FaHome />
            Home
          </Link>
          {!user && (
            <>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-4 py-2 text-slate-200 rounded-md hover:bg-slate-500 hover:text-white transition"
              >
                <FaFingerprint />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 px-4 py-2 text-slate-200 rounded-md hover:bg-slate-500 hover:text-white transition"
              >
                <GiMachineGunMagazine />
                Register
              </Link>
            </>
          )}
          {user && (
            <>
              <Link
                to="/crimes"
                className="flex items-center justify-center gap-2 px-4 py-2 text-slate-200 rounded-md hover:bg-slate-500 hover:text-white transition"
              >
                <GiMachineGunMagazine />
                Crimes
              </Link>
              <Link
                to="/profile"
                className="flex items-center justify-center gap-2 px-4 py-2 text-slate-200 rounded-md hover:bg-slate-500 hover:text-white transition"
              >
                <CgProfile />
                Profile
              </Link>
              {user.email === "ayush@gmail.com" && (
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-2 px-4 py-2 text-slate-200 rounded-md hover:bg-slate-500 hover:text-white transition"
                >
                  <CgProfile />
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 text-slate-200 rounded-md hover:bg-red-500 hover:text-white transition"
              >
                <IoIosLogOut></IoIosLogOut>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
