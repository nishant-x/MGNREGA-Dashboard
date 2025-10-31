"use client";

export default function Footer() {
  return (
    <footer className="bg-blue-800 text-white mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6 text-center md:text-left">
        <div>
          <h2 className="font-semibold text-lg mb-2">MGNREGA Dashboard</h2>
          <p className="text-sm text-blue-100">
            Helping every citizen understand MGNREGA performance easily.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="/" className="hover:text-yellow-300">Home</a></li>
            <li><a href="#about" className="hover:text-yellow-300">About</a></li>
            <li><a href="#data" className="hover:text-yellow-300">Dashboard</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p className="text-sm text-blue-100">
            📍 Rural Development Insights, India<br />
            ✉️ support@mgnrega.info
          </p>
        </div>
      </div>
      <div className="text-center py-3 border-t border-blue-700 text-xs text-blue-200">
        © {new Date().getFullYear()} MGNREGA Dashboard — Empowering Citizens
      </div>
    </footer>
  );
}
