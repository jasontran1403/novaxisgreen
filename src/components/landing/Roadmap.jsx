function Roadmap() {
  const milestones = [
    {
      quarter: 'Q4/2025',
      description: 'Project launch, NovaWallet release, Seed & Public Sales.'
    },
    {
      quarter: 'Q1/2026',
      description:
        'Novaxis Chain launch, partnership with renewable energy firms, E-commerce beta testing'
    },
    {
      quarter: 'Q2/2026',
      description: 'Launch of Tap-to-Earn App and pilot solar energy tokenization.'
    },
    {
      quarter: 'Q3/2026',
      description:
        'GreenFi Marketplace, Metaverse Alpha, achieving 1 million global users'
    }
  ];

  return (
    <section id="roadmap" className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Roadmap
          </h1>
          <p className="text-xl text-gray-300">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-cyan-500/50"></div>

            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-2">
                      {milestone.quarter}
                    </h2>
                    <p className="text-gray-300">{milestone.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-cyan-500 rounded-full border-4 border-gray-900"></div>
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Roadmap;

