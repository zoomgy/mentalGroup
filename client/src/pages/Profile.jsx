import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../../userSlice.js";
import BACKEND_URL from "../BackendUrl.js";

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    profilePictureUrl: "",
    role: "",
  });

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const defaultProfileImage =
    "https://media.istockphoto.com/id/1327592506/vector/default-avatar-photo-placeholder-icon-grey-profile-picture-business-man.jpg?s=612x612&w=0&k=20&c=BpR0FVaEa5F24GIw7K8nMWiiGmbb8qmhfkpXcp1dhQg=";

  // Fetch user info from backend when component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${BACKEND_URL}/user/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch user data");
        }
        const userData = await response.json();
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          password: "",
          age: userData.age || "",
          profilePictureUrl: userData.profilePictureUrl || defaultProfileImage,
          role: userData.role || "",
        });
      } catch (error) {
        setMessage("Error fetching user data: " + error.message);
      }
    };

    fetchUserDetails();
  }, [user]);

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

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("upload_preset", "autopreset");
    uploadFormData.append("cloud_name", "dgmru9fam");

    setUploading(true);

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgmru9fam/image/upload",
        {
          method: "POST",
          body: uploadFormData,
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
      const response = await fetch(`${BACKEND_URL}/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, id: user.id }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }
      const updatedUser = await response.json();
      console.log(updatedUser);
      dispatch(updateProfile(updatedUser));
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      setMessage("Update failed: " + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      {user ? (
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
            My Profile
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6 text-center">
              <label className="block text-gray-700 font-medium mb-2">
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
                  <p className="text-sm text-indigo-500 mt-2">Uploading...</p>
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
                  className="block text-gray-700 font-medium mb-2"
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
                  readOnly={!editing && name !== "password"}
                  placeholder={editing ? "" : "Click Edit to update"}
                />
              </div>
            ))}

            {editing ? (
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
              >
                Save Changes
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setEditing(true);
                }}
                className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
              >
                Edit Profile
              </button>
            )}
          </form>
          {message && (
            <p className="mt-4 text-center text-gray-600 font-medium">
              {message}
            </p>
          )}
        </div>
      ) : (
        <div>Login To View Profile</div>
      )}
    </div>
  );
}

export default Profile;
