"use client";

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        <h1 className="text-lg md:text-xl font-bold tracking-wide">
         MGNREGA Dashboard
        </h1>
        <div className="space-x-4 hidden md:flex">
          <a href="/" className="hover:text-yellow-300 transition">Home</a>
          <a href="#about" className="hover:text-yellow-300 transition">About</a>
          <a href="#data" className="hover:text-yellow-300 transition">Data</a>
          <a href="#contact" className="hover:text-yellow-300 transition">Contact</a>
        </div>
      </div>
    </nav>
  );
}
