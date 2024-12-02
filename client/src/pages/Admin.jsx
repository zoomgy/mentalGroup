import { useEffect, useState } from "react";
import BACKEND_URL from "../BackendUrl";

function Admin() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch pending users from the backend
  const fetchPendingUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/pending-users`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch pending users");

      const data = await response.json();
      setPendingUsers(data.users);
    } catch (error) {
      console.error(error.message);
      setMessage("Error fetching pending users");
    }
  };

  // Approve a user
  const approveUser = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/approve/${userId}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to approve user");

      const data = await response.json();
      setMessage(`User ${data.user.name} approved successfully!`);
      setPendingUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error(error.message);
      setMessage("Error approving user");
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h2>

      {message && <p className="text-green-600 font-medium mb-4">{message}</p>}

      {pendingUsers.length > 0 ? (
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">
            Pending User Approvals
          </h3>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Role</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="border px-4 py-2">{user.name}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.role || "User"}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => approveUser(user._id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">
          No pending user approvals at the moment.
        </p>
      )}
    </div>
  );
}

export default Admin;
