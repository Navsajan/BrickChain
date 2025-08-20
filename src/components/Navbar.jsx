import { useState } from "react";
import { connectWallet } from "../keplr";

export default function Navbar() {
  const [wallet, setWallet] = useState(null);

  const handleConnect = async () => {
    const res = await connectWallet();
    if (res) setWallet(res.address);
  };

  const handleLogout = () => setWallet(null);

  return (
    <nav className="bg-gray-900 px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-4xl font-playfair font-bold text-white tracking-wide drop-shadow-lg cursor-pointer">
        BrickChain
        </h1>

      <div className="flex items-center gap-4">
        <a href="/" className="text-gray-300 hover:text-white">Home</a>
        <a href="/properties" className="text-gray-300 hover:text-white">Properties</a>
        <a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a>

        {wallet ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-200">{wallet.slice(0, 10)}...</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-white"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white font-semibold"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
