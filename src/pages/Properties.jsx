import { useEffect, useState } from "react";
import { connectWallet } from "../keplr";
import { motion } from "framer-motion";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

// --- Replace these with actual contract addresses ---
const RPC = "https://api.andromedaprotocol.io/rpc/testnet"; 
const CW721_CONTRACT = "andr1l53nmjzrl67kc8qqvwp7ux3a4ysgplhfy9lgwst829yuv4azd67stk4as0";   
const MARKETPLACE_CONTRACT = "andr1p9a008flp0xk5eu4ret4hmdqfxfd4cc7s5p7ed4mucqxmlryrf6s9nsf6d"; 

const CW20_CONTRACTS = {
  "building1": "andr15uwlykqlgzxgcrgvllrac88m9c9q6v9jyj33k4sp4metey7eycysfctwpp",
  "building2": "andr15uwlykqlgzxgcrgvllrac88m9c9q6v9jyj33k4sp4metey7eycysfctwpp",
  "building3": "andr15uwlykqlgzxgcrgvllrac88m9c9q6v9jyj33k4sp4metey7eycysfctwpp"
};

export default function Properties() {
  const [wallet, setWallet] = useState(null);
  const [isBuying, setIsBuying] = useState(false);
  const [properties, setProperties] = useState([]);

  const handleConnect = async () => {
    const res = await connectWallet();
    if (res) setWallet(res);
  };

  const fetchValuation = async (property) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/valuate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base_price: property.price, multiplier: 1.1 })
      });
      const data = await res.json();
      return data.valuation;
    } catch (err) {
      console.error("Valuation API error:", err);
      return property.price;
    }
  };

  const fetchTrustScore = async (property) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: property.id })
      });
      const data = await res.json();
      return data.trust_score;
    } catch (err) {
      console.error("Trust API error:", err);
      return 0.5;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const client = await CosmWasmClient.connect(RPC);

        const tokens = await client.queryContractSmart(CW721_CONTRACT, {
          all_tokens: { start_after: undefined, limit: 10 }
        });

        const props = await Promise.all(tokens.tokens.map(async (id) => {
          const nftInfo = await client.queryContractSmart(CW721_CONTRACT, { nft_info: { token_id: id } });
          const metaResp = await fetch(nftInfo.token_uri);
          const meta = await metaResp.json();

          const property = {
            id,
            name: meta.name,
            image: meta.image,
            price: meta.price || "1000000",
            cw20: CW20_CONTRACTS[id] || null
          };

          property.valuation = await fetchValuation(property);
          property.trust_score = await fetchTrustScore(property);

          return property;
        }));

        setProperties(props);
      } catch (err) {
        console.error("Failed to fetch NFTs:", err);
      }
    })();
  }, []);

  const handleBuy = async (property) => {
    if (!wallet) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      setIsBuying(true);
      const { client, address } = wallet;

      const msg = { buy: { cw20_address: property.cw20, amount: "1000000" } };
      const fee = { amount: [{ denom: "uado", amount: "5000" }], gas: "200000" };
      const result = await client.execute(address, MARKETPLACE_CONTRACT, msg, fee);

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
      className="bg-gray-900 min-h-screen p-6 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {!wallet && (
        <motion.button
          onClick={handleConnect}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white shadow-lg font-semibold transition"
        >
          Connect Wallet to Buy
        </motion.button>
      )}

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
        Available Properties
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((prop, index) => (
          <motion.div
            key={prop.id}
            className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <img src={prop.image} alt={prop.name} className="w-full h-56 object-cover" />
            <div className="p-6 text-white">
              <h3 className="text-2xl font-semibold mb-2">{prop.name}</h3>

              <div className="mb-4">
                <p className="text-gray-300 text-sm">Price: {prop.price / 1_000_000} ADO</p>
                <p className="text-gray-300 text-sm">Valuation: {prop.valuation / 1_000_000} ADO</p>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-1">Trust Score:</p>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prop.trust_score * 100}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-4 rounded-full ${prop.trust_score > 0.7 ? "bg-green-400" : prop.trust_score > 0.4 ? "bg-yellow-400" : "bg-red-400"}`}
                  />
                </div>
              </div>

              <motion.button
                onClick={() => handleBuy(prop)}
                disabled={isBuying}
                whileHover={!isBuying ? { scale: 1.05 } : {}}
                whileTap={!isBuying ? { scale: 0.95 } : {}}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
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
