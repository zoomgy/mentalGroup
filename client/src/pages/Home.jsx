import { useState, useEffect } from "react";
import BACKEND_URL from "../BackendUrl";

function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/users`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">All Users</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col"
          >
            <div className="flex flex-col items-center mb-4">
              <img
                src={
                  user.profilePictureUrl || "https://via.placeholder.com/100"
                }
                alt={`${user.name}'s avatar`}
                className="w-full h-80 rounded-sm object-cover mb-4"
              />
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Role: {user.role || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Crimes:</h3>
              {user.crimes.length > 0 ? (
                <ul className="list-disc list-inside text-gray-600">
                  {user.crimes.map((crime, index) => (
                    <li key={index}>{crime}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No crimes Done.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
