function Tokenomics() {
  return (
    <section id="about" className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://res.cloudinary.com/dijayprrw/image/upload/v1766005815/Screenshot_2025-12-18_040517_zbgpmc.png"
              alt="Tokenomics"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">Tokenomics – novaxisgreen Coin</h2>
            <p className="text-lg font-bold mb-2">Total Supply: 19,000,000 novaxisgreen</p>
            <p className="text-lg font-bold mb-2">
              Burn Rate: 45% → Circulating Supply: 10.45M novaxisgreen
            </p>
            <p className="text-lg font-bold mb-2">
              Token Standard: ERC-20 / BEP-20 → Migrating to Novaxis Chain
            </p>
            <p className="text-lg font-bold mb-4">Distribution:</p>
            <ul className="space-y-2 text-gray-300">
              <li>45% - Burn</li>
              <li>30% – Community & Staking</li>
              <li>10% – Liquidity & Operations Fund</li>
              <li>5% – Marketing & Promotion</li>
              <li>5% – Partners & Development Fund</li>
              <li>5% – Team & Advisors</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Tokenomics;

