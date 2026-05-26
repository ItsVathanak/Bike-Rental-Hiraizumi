import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

export default function App() {
  // Auth state
  const [adminAuth, setAdminAuth] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [bikes, setBikes] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedBikeId, setSelectedBikeId] = useState("bike-1");
  const [activeSection, setActiveSection] = useState("bikes");

  const [polling, setPolling] = useState(false);
  const [pollEveryMs, setPollEveryMs] = useState(2000);
  const [notifications, setNotifications] = useState([]);

  // Admin state
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [adminBike, setAdminBike] = useState({
    id: "bike-3",
    name: "Station B - Slot 1",
    station: "Station B",
    lockboxCode: "3333",
    bikeType: "non-electric",
  });
  const [editingBike, setEditingBike] = useState(null);
  const [editingLockboxCode, setEditingLockboxCode] = useState("");
  
  // Price configuration state
  const [prices, setPrices] = useState({
    electric: 1000,
    "non-electric": 500,
  });
  const [priceError, setPriceError] = useState("");
  const [priceSuccess, setPriceSuccess] = useState("");

  const selectedBike = useMemo(
    () => bikes.find((b) => b.id === selectedBikeId),
    [bikes, selectedBikeId]
  );

  async function fetchBikes() {
    const r = await fetch(`${API_BASE}/bikes`);
    const data = await r.json();
    setBikes(data);
    if (data?.[0]?.id && !data.find((b) => b.id === selectedBikeId)) {
      setSelectedBikeId(data[0].id);
    }
  }

  async function fetchRentals() {
    const r = await fetch(`${API_BASE}/rentals`);
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
    setRentals(data);
    return data;
  }

  useEffect(() => {
    fetchBikes();
    fetchRentals().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!polling) return;
    const t = setInterval(() => {
      fetchBikes();
      fetchRentals().catch(() => {});
    }, pollEveryMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling, pollEveryMs]);

  async function handleAdminLogin(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const formData = new FormData(e.target);
      const username = formData.get("username");
      const password = formData.get("password");

      const r = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Login failed");

      setAdminAuth(data.admin);
      localStorage.setItem("adminAuth", JSON.stringify(data.admin));
    } catch (err) {
      setAuthError(String(err.message || err));
    } finally {
      setAuthLoading(false);
    }
  }

  function handleAdminLogout() {
    setAdminAuth(null);
    localStorage.removeItem("adminAuth");
    setActiveSection("bikes");
  }

  async function adminSubmit(e) {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");
    try {
      const r = await fetch(`${API_BASE}/bikes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminBike),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      const message = `Bike ${data.id} created successfully!`;
      setNotifications(prev => [...prev, {message, timestamp: new Date().toISOString()}]);
      await fetchBikes();
    } catch (err) {
      const errorMsg = String(err.message || err);
      setAdminError(errorMsg);
      setNotifications(prev => [...prev, {message: `Error: ${errorMsg}`, timestamp: new Date().toISOString()}]);
    }
  }

  async function adminUpdateBike(bikeId, details) {
    setAdminError("");
    setAdminSuccess("");
    try {
      const r = await fetch(`${API_BASE}/bikes/${bikeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      const message = `Bike ${data.id} updated successfully!`;
      setNotifications(prev => [...prev, {message, timestamp: new Date().toISOString()}]);
      await fetchBikes();
      return data;
    } catch (err) {
      const errorMsg = String(err.message || err);
      setAdminError(errorMsg);
      setNotifications(prev => [...prev, {message: `Error: ${errorMsg}`, timestamp: new Date().toISOString()}]);
      throw err;
    }
  }

  async function adminDeleteBike(bikeId) {
    if (!window.confirm(`Are you sure you want to delete bike ${bikeId}? This cannot be undone.`)) {
      return;
    }
    setAdminError("");
    setAdminSuccess("");
    try {
      const r = await fetch(`${API_BASE}/bikes/${bikeId}`, { method: "DELETE" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      const message = data.message || `Bike ${bikeId} deleted.`;
      setNotifications(prev => [...prev, {message, timestamp: new Date().toISOString()}]);
      await fetchBikes();
    } catch (err) {
      const errorMsg = String(err.message || err);
      setAdminError(errorMsg);
      setNotifications(prev => [...prev, {message: `Error: ${errorMsg}`, timestamp: new Date().toISOString()}]);
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${API_BASE}/notifications/admin`);
        if (r.ok) {
          const newNotifications = await r.json();
          if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Login Screen */}
      {!adminAuth ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mb-6">Sign in to manage the bike rental system</p>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-xs text-slate-500 mt-6 text-center">
              Demo credentials will be created in Supabase
            </p>
          </div>
        </div>
      ) : (
        /* Dashboard */
        <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Welcome, {adminAuth.name}</p>
        </div>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveSection("notifications")}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition relative ${
              activeSection === "notifications" 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Notifications
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection("bikes")}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeSection === "bikes" 
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Bikes
          </button>
          <button
            onClick={() => setActiveSection("pricing")}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeSection === "pricing" 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => setActiveSection("fleet")}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeSection === "fleet" 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Bike Fleet
          </button>
          <button
            onClick={() => setActiveSection("rentals")}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeSection === "rentals" 
                ? "bg-blue-600 text-white" 
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Rental Sessions
          </button>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleAdminLogout}
          className="w-full mt-8 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <section className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-slate-800">Admin Notifications</h2>
                <button
                  onClick={() => setNotifications([])}
                  className="text-sm text-slate-600 hover:underline disabled:text-slate-400 disabled:no-underline"
                  disabled={notifications.length === 0}
                >
                  Dismiss All
                </button>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-900 h-96 overflow-y-auto border rounded-lg p-2 bg-slate-50">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <li key={i} className="p-2 bg-white rounded-md shadow-sm">
                      <span className="font-semibold">[{new Date(n.timestamp).toLocaleTimeString()}]</span> {n.message}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 text-center p-4">No new notifications</li>
                )}
              </ul>
            </section>
          )}

          {/* Bikes Section (separated bike details and add/edit) */}
          {activeSection === "bikes" && (
            <div className="space-y-6">
              {/* Bike Selection */}
              <section className="bg-white rounded-xl shadow p-5">
                <h2 className="text-lg font-semibold mb-4">Select Bike</h2>
                <select
                  value={selectedBikeId}
                  onChange={(e) => setSelectedBikeId(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full"
                >
                  {bikes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                </select>
              </section>

              {/* Bike Details */}
              <section className="bg-white rounded-xl shadow p-5">
                <h2 className="text-lg font-semibold mb-4">Bike Details</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-semibold">{selectedBike?.name ?? "-"}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-slate-600">Bike ID:</span>
                    <span className="font-mono font-semibold">{selectedBike?.id ?? "-"}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-slate-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedBike?.status === "available"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {selectedBike?.status ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-slate-600">Bike Type:</span>
                    <span className="font-semibold">{selectedBike?.bikeType ? (selectedBike.bikeType === 'electric' ? 'Electric' : 'Non-Electric') : "-"}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-slate-600">Lockbox Code:</span>
                    <span className="font-mono font-semibold">{selectedBike?.lockboxCode ?? "-"}</span>
                  </div>
                </div>
              </section>

              {/* Add/Edit Bike Form */}
              <section className="bg-white rounded-xl shadow p-5">
                <h2 className="text-lg font-semibold mb-4">Add/Edit Bike</h2>
                {adminError && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    {adminError}
                  </div>
                )}
                {adminSuccess && (
                  <div className="mt-3 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                    {adminSuccess}
                  </div>
                )}
                <form onSubmit={adminSubmit} className="mt-3 space-y-3 text-sm">
                  <input
                    type="text"
                    placeholder="ID (e.g., bike-3)"
                    value={adminBike.id}
                    onChange={(e) => setAdminBike({ ...adminBike, id: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Name (e.g., Station B - Slot 1)"
                    value={adminBike.name}
                    onChange={(e) => setAdminBike({ ...adminBike, name: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Station"
                    value={adminBike.station}
                    onChange={(e) => setAdminBike({ ...adminBike, station: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Lockbox Code (4 digits)"
                    value={adminBike.lockboxCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setAdminBike({ ...adminBike, lockboxCode: value });
                    }}
                    maxLength="4"
                    pattern="\d{4}"
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  <select
                    value={adminBike.bikeType}
                    onChange={(e) => setAdminBike({ ...adminBike, bikeType: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full"
                  >
                    <option value="non-electric">Non-Electric</option>
                    <option value="electric">Electric</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white w-full"
                  >
                    Add Bike
                  </button>
                </form>
              </section>
            </div>
          )}

          {/* Pricing Section */}
          {activeSection === "pricing" && (
            <section className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold">Pricing by Bike Type</h2>
              {priceError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {priceError}
                </div>
              )}
              {priceSuccess && (
                <div className="mt-3 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                  {priceSuccess}
                </div>
              )}
              <div className="mt-4 space-y-3">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Electric Bikes (¥)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={prices.electric}
                      onChange={(e) => setPrices({ ...prices, electric: Number(e.target.value) })}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Non-Electric Bikes (¥)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={prices["non-electric"]}
                      onChange={(e) => setPrices({ ...prices, "non-electric": Number(e.target.value) })}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        setPriceError("");
                        setPriceSuccess("");
                        
                        // Update electric bikes
                        const r1 = await fetch(`${API_BASE}/bikes/update-price-by-type`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ bikeType: 'electric', price: prices.electric }),
                        });
                        if (!r1.ok) throw new Error('Failed to update electric bike prices');
                        
                        // Update non-electric bikes
                        const r2 = await fetch(`${API_BASE}/bikes/update-price-by-type`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ bikeType: 'non-electric', price: prices["non-electric"] }),
                        });
                        if (!r2.ok) throw new Error('Failed to update non-electric bike prices');
                        
                        setPriceSuccess("✓ Prices updated for all bikes in Supabase!");
                        setTimeout(() => setPriceSuccess(""), 3000);
                        
                        // Refresh bikes to show updated prices
                        await fetchBikes();
                      } catch (err) {
                        setPriceError(`Error: ${err.message}`);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
                  >
                    Save Prices
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  These prices will be applied when creating or editing bikes. Electric: ¥{prices.electric} | Non-Electric: ¥{prices["non-electric"]}
                </div>
              </div>
            </section>
          )}

          {/* Bike Fleet Section */}
          {activeSection === "fleet" && (
            <section className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold">Bike Fleet</h2>

              <div className="mt-3 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={polling}
                    onChange={(e) => setPolling(e.target.checked)}
                  />
                  Poll
                </label>
                <label className="text-sm text-slate-600">
                  every{" "}
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={pollEveryMs}
                    onChange={(e) => setPollEveryMs(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-24"
                  />{" "}
                  ms
                </label>
              </div>

              <table className="mt-3 w-full text-sm text-left">
                <thead className="border-b">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Station</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Lockbox Code</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bikes.map((bike) => {
                    const isActiveRental = rentals.some(r => r.bikeId === bike.id && r.rentalStatus === 'active');
                    const status = isActiveRental ? 'in-use' : 'available';

                    return (
                      <tr key={bike.id} className="border-b">
                        <td className="p-2 font-mono">{bike.id}</td>
                        <td className="p-2">{bike.name}</td>
                        <td className="p-2">{bike.station}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              status === "available"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="p-2 font-mono">
                          {editingBike === bike.id ? (
                            <input
                              type="text"
                              value={editingLockboxCode}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setEditingLockboxCode(value);
                              }}
                              maxLength="4"
                              className="border rounded px-2 py-1 w-20"
                              autoFocus
                            />
                          ) : (
                            bike.lockboxCode
                          )}
                        </td>
                        <td className="p-2 space-x-2">
                          {editingBike === bike.id ? (
                            <>
                              <button
                                onClick={async () => {
                                  if (editingLockboxCode.length !== 4) {
                                    setAdminError('Lockbox code must be exactly 4 digits');
                                    return;
                                  }
                                  await adminUpdateBike(bike.id, { lockboxCode: editingLockboxCode });
                                  setEditingBike(null);
                                  setEditingLockboxCode("");
                                }}
                                className="text-green-600 hover:underline text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingBike(null);
                                  setEditingLockboxCode("");
                                }}
                                className="text-gray-600 hover:underline text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingBike(bike.id);
                                  setEditingLockboxCode(bike.lockboxCode);
                                }}
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => adminDeleteBike(bike.id)}
                                disabled={status !== 'available'}
                                className="text-red-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed text-sm"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          {/* Rental Sessions Section */}
          {activeSection === "rentals" && (
            <section className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold">Rental Sessions</h2>
              <table className="mt-3 w-full text-sm text-left">
                <thead className="border-b">
                  <tr>
                    <th className="p-2">Session ID</th>
                    <th className="p-2">Bike</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Started</th>
                    <th className="p-2">Ended</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((rental) => (
                    <tr key={rental.sessionId} className="border-b">
                      <td className="p-2 font-mono">{rental.sessionId}</td>
                      <td className="p-2">{rental.bikeName}</td>
                      <td className="p-2">{rental.customer.userId}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            rental.rentalStatus === "active"
                              ? "bg-blue-100 text-blue-800"
                              : rental.rentalStatus === "returned"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {rental.rentalStatus}
                        </span>
                      </td>
                      <td className="p-2">{new Date(rental.startedAt).toLocaleString()}</td>
                      <td className="p-2">
                        {rental.endedAt ? new Date(rental.endedAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </main>
    </div>
        )}
    </div>
  );
}
