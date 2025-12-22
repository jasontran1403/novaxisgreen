function NovaxisChain() {
  const features = [
    {
      icon: 'fas fa-microchip',
      title: 'Technology',
      description: 'Proof of Stake (PoS) + Green Nodes'
    },
    {
      icon: 'fas fa-tachometer-alt',
      title: 'Performance',
      description: '3,000+ TPS, block time < 2 seconds'
    },
    {
      icon: 'fas fa-dollar-sign',
      title: 'Transaction Cost',
      description: 'Low fees, approximately 0.001 novaxisgreen'
    },
    {
      icon: 'fas fa-plug',
      title: 'Compatibility',
      description: 'Fully EVM-compatible (Ethereum & BNB ecosystems).'
    },
    {
      icon: 'fas fa-leaf',
      title: 'Green Privilege',
      description: 'Validators powered by renewable energy are prioritized'
    },
    {
      icon: 'fas fa-recycle',
      title: 'Carbon Neutral Mechanism',
      description: 'A portion of gas fees is allocated to purchase carbon credits.'
    }
  ];

  return (
    <section id="novachain" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Novaxis Chain – The Green Blockchain
          </h1>
          <p className="text-xl text-gray-300">Every Block = A Greener Earth</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 text-center"
            >
              <div className="text-6xl text-cyan-400 mb-4">
                <i className={feature.icon}></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">
                {feature.title}
              </h4>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NovaxisChain;

