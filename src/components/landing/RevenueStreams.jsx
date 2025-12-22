function RevenueStreams() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://res.cloudinary.com/dijayprrw/image/upload/v1766006325/Screenshot_2025-12-18_041759_r3me1k.png"
              alt="Revenue Streams"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">Revenue Streams & Cash Flow</h2>
            <p className="text-lg font-bold mb-4">Revenue Sources:</p>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li>- Renewable energy production & sales</li>
              <li>- Carbon credit trading</li>
              <li>- BitNext exchange transaction fees</li>
              <li>- NovaWallet service fees</li>
              <li>- E-commerce platform</li>
            </ul>
            <p className="text-lg font-bold mb-4">Revenue Allocation:</p>
            <ul className="space-y-2 text-gray-300">
              <li>- 70% distributed to the community</li>
              <li>- 30% reinvested into project development</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RevenueStreams;

