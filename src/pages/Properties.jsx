import { useState } from "react";
import { connectWallet } from "../keplr";
import { motion } from "framer-motion";
import properties from "../data/properties.json";

export default function Properties() {
  const [wallet, setWallet] = useState(null);
  const [isBuying, setIsBuying] = useState(false);

  const handleConnect = async () => {
    const res = await connectWallet();
    if (res) setWallet(res);
  };

  const handleBuy = async (property) => {
    if (!wallet) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      setIsBuying(true);
      const { client, address } = wallet;
      const recipient = "andromeda1xxxxxxxxxxxxxxxxxxxxxx"; 
      const amount = { denom: "uado", amount: property.price };
      const fee = { amount: [{ denom: "uado", amount: "5000" }], gas: "200000" };

      const result = await client.sendTokens(
        address,
        recipient,
        [amount],
        fee,
        "Buying fraction of " + property.name
      );

      alert("Transaction successful! TxHash: " + result.transactionHash);
    } catch (err) {
      console.error(err);
      alert("Transaction failed: " + err.message);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <motion.div
      className="bg-gray-900 min-h-screen p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {!wallet && (
        <motion.button
          onClick={handleConnect}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white shadow-lg transition"
        >
          Connect Wallet to Buy
        </motion.button>
      )}

      <h2 className="text-3xl font-bold text-white mb-6">Available Properties</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop, index) => (
          <motion.div
            key={prop.id}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <img src={prop.image} alt={prop.name} className="w-full h-48 object-cover" />
            <div className="p-4 text-white">
              <h3 className="text-xl font-semibold">{prop.name}</h3>
              <p className="mb-4">{prop.price / 1000000} ADO</p>
              <motion.button
                onClick={() => handleBuy(prop)}
                disabled={isBuying}
                whileHover={!isBuying ? { scale: 1.05 } : {}}
                whileTap={!isBuying ? { scale: 0.95 } : {}}
                className={`w-full px-4 py-2 rounded-md font-semibold transition ${
                  isBuying
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isBuying ? "Processing..." : "Buy Fraction"}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
