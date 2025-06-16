// src/LoginPage.jsx
export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6C5CE7] text-white font-['Poppins'] px-4">
        <h1 className="text-3xl font-bold mb-4">Selamat Datang di INTRAX</h1>
      <div className="bg-white text-[#2d3436] rounded-md shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Login INTRAX</h1>

        {/* Username - tidak bisa diketik */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            disabled
            placeholder="Masukkan username"
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Password - tidak bisa diketik */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            disabled
            placeholder="Masukkan password"
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <button
          onClick={onLogin}
          className="w-full bg-[#6C5CE7] text-white py-2 rounded hover:bg-[#5f27cd] transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
