import { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    if (!state || !district) {
      setError("Please enter both state and district.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`/api/mgnrega?state=${state}&district=${district}`);
      setData(res.data.data || []);
      if (!res.data.data.length) setError("No data found for this district.");
    } catch (err) {
      setError("Failed to fetch data. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        MGNREGA Dashboard
      </h1>

      {/* Input Section */}
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow mb-6">
        <label className="block mb-2 font-semibold text-gray-600">
          Enter State:
        </label>
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="e.g. Madhya Pradesh"
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2 font-semibold text-gray-600">
          Enter District:
        </label>
        <input
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="e.g. Bhopal"
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={handleFetch}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Get Data"}
        </button>

        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
      </div>

      {/* Data Display */}
      {data.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-4">
            {district} District – {state}
          </h2>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl shadow text-center">
              <p className="text-gray-500">Households Worked</p>
              <p className="text-2xl font-bold text-green-600">
                {data[0]?.households_worked || "N/A"}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow text-center">
              <p className="text-gray-500">Persondays Generated</p>
              <p className="text-2xl font-bold text-blue-600">
                {data[0]?.persondays_generated || "N/A"}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow text-center">
              <p className="text-gray-500">Average Wage</p>
              <p className="text-2xl font-bold text-orange-500">
                ₹{data[0]?.avg_wage || "N/A"}
              </p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="persondays_generated" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
