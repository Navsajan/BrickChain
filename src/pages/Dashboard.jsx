import { useState, useEffect } from "react";
import { connectWallet } from "../keplr";

export default function Dashboard() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const res = await connectWallet();
        if (res) {
          setWallet(res);
          const bal = await res.client.getBalance(res.address, "uado");
          setBalance(bal);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">Your Portfolio</h2>
      {!wallet ? (
        <p>Please connect your wallet to see your portfolio.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <p><span className="font-semibold">Wallet Address:</span> {wallet.address}</p>
            <p>
              <span className="font-semibold">Balance:</span>{" "}
              {isLoading
                ? "Loading..."
                : balance
                ? (balance.amount/1000000) + " ADO"
                : "0 ADO"}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <p><span className="font-semibold">Mock Holdings:</span> 10 tokens of Beachfront Villa</p>
          </div>
        </div>
      )}
    </div>
  );
}
