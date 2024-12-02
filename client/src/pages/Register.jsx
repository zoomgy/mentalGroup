import { useState } from "react";
import BACKEND_URL from "../BackendUrl.js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../userSlice.js";
import { useSelector } from "react-redux";

function Register() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: 18,
    profilePictureUrl: "",
    role: "",
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const defaultProfileImage =
    "https://media.istockphoto.com/id/1327592506/vector/default-avatar-photo-placeholder-icon-grey-profile-picture-business-man.jpg?s=612x612&w=0&k=20&c=BpR0FVaEa5F24GIw7K8nMWiiGmbb8qmhfkpXcp1dhQg=";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "autopreset");
    formData.append("cloud_name", "dgmru9fam");

    setUploading(true);

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgmru9fam/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          profilePictureUrl: data.secure_url,
        }));
        setMessage("Image uploaded successfully!");
      } else {
        throw new Error(data.error.message);
      }
    } catch (error) {
      setMessage(`Image upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register");
      }

      const data = await response.json();
      dispatch(login(data.user));
      setMessage(`Registration successful: ${data.user.name}`);
      setFormData({
        name: "",
        email: "",
        password: "",
        age: 18,
        profilePictureUrl: "",
        role: "",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setMessage("Registration failed: " + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {!user ? (
        <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
            Create Account
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6 text-center">
              <label className="block text-gray-600 font-medium mb-2">
                Profile Picture
              </label>
              <div className="relative w-32 h-32 mx-auto">
                <label htmlFor="file-input" className="cursor-pointer">
                  <img
                    src={formData.profilePictureUrl || defaultProfileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-2 border-indigo-500"
                  />
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploading && (
                  <p className="text-sm text-indigo-500 mt-2">
                    Uploading image...
                  </p>
                )}
              </div>
            </div>

            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Role", name: "role", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Password", name: "password", type: "password" },
              { label: "Age", name: "age", type: "number" },
            ].map(({ label, name, type }) => (
              <div className="mb-4" key={name}>
                <label
                  htmlFor={name}
                  className="block text-gray-600 font-medium mb-2"
                >
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  id={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:outline-none"
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
            >
              Register
            </button>
          </form>
          {message && (
            <p className="mt-4 text-center text-gray-600 font-medium">
              {message}
            </p>
          )}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-center text-xl font-bold">
            Welcome, {user?.name}!
          </p>
        </div>
      )}
    </div>
  );
}

export default Register;
