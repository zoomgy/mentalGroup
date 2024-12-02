import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BACKEND_URL from "../BackendUrl";

function Crimes() {
  const { user } = useSelector((state) => state.user);
  const [crimes, setCrimes] = useState([]);
  const [newCrime, setNewCrime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCrimes = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${BACKEND_URL}/user/${user.id}/crimes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch crimes");
        }

        const data = await response.json();
        setCrimes(data.crimes || []);
      } catch (error) {
        setMessage("Error fetching crimes: " + error.message);
      }
    };

    fetchCrimes();
  }, [user]);

  // Add a new crime
  const handleAddCrime = async (e) => {
    e.preventDefault();

    if (!newCrime.trim()) {
      setMessage("Crime description cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/user/${user.id}/crimes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ crime: newCrime }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add crime");
      }

      const updatedCrimes = await response.json();
      setCrimes(updatedCrimes.crimes);
      setNewCrime("");
      setMessage("Crime added successfully!");
    } catch (error) {
      setMessage("Error adding crime: " + error.message);
    }
  };

  // Remove a crime
  const handleRemoveCrime = async (crimeToRemove) => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/${user.id}/crimes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ crime: crimeToRemove }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove crime");
      }

      const updatedCrimes = await response.json();
      setCrimes(updatedCrimes.crimes);
      setMessage("Crime removed successfully!");
    } catch (error) {
      setMessage("Error removing crime: " + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Crimes List
        </h2>

        <form onSubmit={handleAddCrime} className="mb-6">
          <label
            htmlFor="crime"
            className="block text-gray-700 font-medium mb-2"
          >
            Add New Crime
          </label>
          <input
            type="text"
            id="crime"
            value={newCrime}
            onChange={(e) => setNewCrime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:outline-none mb-4"
            placeholder="Enter crime description"
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            Add Crime
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-600 font-medium">
            {message}
          </p>
        )}

        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Crimes</h3>
          {crimes.length === 0 ? (
            <p className="text-gray-600">No crimes found on your profile.</p>
          ) : (
            <ul className="space-y-4">
              {crimes.map((crime, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-lg shadow-sm"
                >
                  <span className="text-gray-800">{crime}</span>
                  <button
                    onClick={() => handleRemoveCrime(crime)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Crimes;
