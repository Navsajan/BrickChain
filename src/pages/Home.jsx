export default function Home() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 min-h-screen flex flex-col justify-center items-center text-white px-6">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
        Fractional Real Estate on Blockchain
      </h1>
      <p className="text-lg md:text-xl mb-6 max-w-xl text-center">
        Own fractions of high-value properties securely using the Andromeda blockchain. Connect your wallet and start trading.
      </p>
      <a
        href="/properties"
        className="px-8 py-3 bg-green-500 rounded-lg font-semibold hover:bg-green-600 transition"
      >
        Explore Properties
      </a>
    </div>
  );
}
