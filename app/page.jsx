"use client";

import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

const STATES = [
  "UTTAR PRADESH","MADHYA PRADESH","BIHAR","ASSAM","MAHARASHTRA","GUJARAT",
  "RAJASTHAN","TAMIL NADU","CHHATTISGARH","KARNATAKA","TELANGANA","ODISHA",
  "ANDHRA PRADESH","PUNJAB","JHARKHAND","HARYANA","ARUNACHAL PRADESH",
  "JAMMU AND KASHMIR","MANIPUR","UTTARAKHAND","KERALA","HIMACHAL PRADESH",
  "MEGHALAYA","WEST BENGAL","MIZORAM","NAGALAND","TRIPURA","SIKKIM",
  "ANDAMAN AND NICOBAR","LADAKH","PUDUCHERRY","GOA","DN HAVELI AND DD","LAKSHADWEEP"
];

export default function Home() {
  const [stateName, setStateName] = useState("MADHYA PRADESH");
  const [district, setDistrict] = useState("");
  const [finYear, setFinYear] = useState("2024-2025");
  const [districts, setDistricts] = useState([]);
  const [data, setData] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [detecting, setDetecting] = useState(false);

  // Auto detect user location
 const handleDetectLocation = () => {
  if (!navigator.geolocation) {
    setError("Geolocation is not supported by your browser.");
    return;
  }

  setDetecting(true);
  setError("");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=4c191b812e934ce6b1e492acb63b2843`
        );
        const data = await response.json();
        const components = data.results[0]?.components;

        const detectedState = components?.state?.toUpperCase();
        const detectedDistrictRaw =
          components?.state_district?.toUpperCase() ||
          components?.district?.toUpperCase() ||
          components?.county?.toUpperCase() ||
          "";

        const cleanDistrict = detectedDistrictRaw.replace(/ DISTRICT| DIVISION/gi, "").trim();

        if (detectedState && STATES.includes(detectedState)) {
          setStateName(detectedState);
        }
        if (cleanDistrict) {
          setDistrict(cleanDistrict);
        }

        if (!detectedState || !cleanDistrict) {
          setError("Could not accurately detect your location.");
        }
      } catch (err) {
        setError("Failed to fetch location details.");
      } finally {
        setDetecting(false);
      }
    },
    () => {
      setError("Unable to retrieve your location. Please allow access.");
      setDetecting(false);
    }
  );
};


  // Fetch districts for selected state
  useEffect(() => {
    if (!stateName) return;
    setDistricts([]);
    setDistrict("");
    setError("");
    setLoadingDistricts(true);

    fetch(`/api/mgnrega?state=${encodeURIComponent(stateName)}&finYear=${encodeURIComponent(finYear)}&listDistricts=1&limit=500`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.districts)) {
          setDistricts(json.districts);
          if (json.districts.length > 0) setDistrict(json.districts[0]);
        } else setDistricts([]);
      })
      .catch(() => setError("Failed to load districts."))
      .finally(() => setLoadingDistricts(false));
  }, [stateName, finYear]);

  // Fetch data
  const handleGetData = async () => {
    if (!stateName) {
      setError("Please select a state.");
      return;
    }
    setError("");
    setData([]);
    setLoadingData(true);

    try {
      const res = await fetch(`/api/mgnrega?state=${encodeURIComponent(stateName)}&finYear=${encodeURIComponent(finYear)}${district ? `&district=${encodeURIComponent(district)}` : ""}&limit=200`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setData(json.data);
      } else {
        setData([]);
        setError("No data found for this selection.");
      }
    } catch {
      setError("Failed to fetch data.");
    } finally {
      setLoadingData(false);
    }
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  // Auto-detect numeric fields
  const numericFields = data.length > 0
    ? Object.keys(data[0]).filter(k => !isNaN(Number(data[0][k])) && Number(data[0][k]) !== 0)
    : [];

  const sampleMetric = numericFields.find(f =>
    f.toLowerCase().includes("person") ||
    f.toLowerCase().includes("expenditure") ||
    f.toLowerCase().includes("work")
  ) || numericFields[0];

  // 🧮 Summary calculations
  const summary = useMemo(() => {
    if (!data.length) return null;
    const totals = {};
    numericFields.forEach((field) => {
      totals[field] = data.reduce((acc, row) => acc + Number(row[field] || 0), 0);
    });
    return totals;
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
          MGNREGA: District Performance Dashboard
        </h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium">State</label>
              <select
                className="mt-1 block w-full border p-2 rounded"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Financial Year</label>
              <input
                className="mt-1 block w-full border p-2 rounded"
                value={finYear}
                onChange={(e) => setFinYear(e.target.value)}
                placeholder="e.g. 2024-2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">District</label>
              <select
                className="mt-1 block w-full border p-2 rounded"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={loadingDistricts}
              >
                <option value="">— All Districts —</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* 📍 Detect Location Button */}
          <div className="mt-3">
            <button
              onClick={handleDetectLocation}
              disabled={detecting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {detecting ? "Detecting location..." : "📍 Detect My Location"}
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleGetData}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loadingData}
            >
              {loadingData ? "Loading..." : "Get Data"}
            </button>
            <button
              onClick={() => { setData([]); setError(""); }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
          {error && <p className="text-red-500 mt-3">{error}</p>}
        </div>

        {/* 🧾 Summary Section */}
        {summary && (
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="font-semibold text-lg text-gray-700 mb-3">
              Summary — {district || stateName} ({finYear})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(summary)
                .slice(0, 8)
                .map(([key, value]) => (
                  <div key={key} className="bg-blue-50 p-3 rounded text-center">
                    <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, " ")}</p>
                    <p className="font-bold text-blue-700 text-sm">{Number(value).toLocaleString()}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Chart Section */}
        {data.length > 0 && sampleMetric && (
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="font-semibold mb-4 text-lg text-gray-700">
              Visual Overview — {sampleMetric.replace(/_/g, " ")}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={sampleMetric} fill="#2563eb" name={sampleMetric.replace(/_/g, " ")} />
              </BarChart>
            </ResponsiveContainer>

            <h3 className="mt-6 font-semibold mb-2">Trend Over Time (if applicable)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey={sampleMetric} stroke="#16a34a" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Table */}
        {data.length > 0 && (
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  {columns.map(col => (
                    <th key={col} className="p-2 border text-left capitalize">{col.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50">
                    {columns.map((col) => (
                      <td key={col} className="p-2 border">{String(row[col] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loadingData && data.length === 0 && !error && (
          <p className="text-center text-gray-500 mt-6">
            No data loaded yet. Select your state and district to begin.
          </p>
        )}
      </div>
    </div>
    <Footer />
  </div>
  );
}
