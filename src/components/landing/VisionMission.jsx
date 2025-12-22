function VisionMission() {
  const items = [
    {
      icon: 'fas fa-bolt',
      title: 'Transform energy',
      description: 'Transform renewable energy into globally tradable digital assets.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Generate value',
      description: 'Generate sustainable profits from real economic flows.'
    },
    {
      icon: 'fas fa-network-wired',
      title: 'Ecosystem',
      description: 'Integrate Finance – Energy – Community within one transparent ecosystem.'
    }
  ];

  return (
    <section id="vision" className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Vision & Mission
          </h1>
          <p className="text-xl text-gray-300">
            To become the pioneering Green Blockchain, leading the global trend
            of sustainable finance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 text-center"
            >
              <div className="text-6xl text-cyan-400 mb-4">
                <i className={item.icon}></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {item.title}
              </h3>
              <p className="text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VisionMission;

