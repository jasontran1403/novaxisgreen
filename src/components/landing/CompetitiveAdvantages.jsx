function CompetitiveAdvantages() {
  const advantages = [
    {
      title: 'Scarcity',
      description:
        '45% of total supply burned → only 10.45M novaxisgreen in circulation.'
    },
    {
      title: 'Green Blockchain',
      description:
        'Every transaction contributes to environmental sustainability.'
    },
    {
      title: 'BitNext Partnership',
      description: 'Guarantees liquidity and global listing.'
    },
    {
      title: 'Super App Ecosystem',
      description:
        'Seamlessly integrates wallet, e-commerce, marketplace, and metaverse.'
    },
    {
      title: 'Aligned with ESG & Net Zero Trends',
      description:
        'Perfectly positioned for global sustainability initiatives..'
    }
  ];

  return (
    <section id="team" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Meet our Professionals
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {advantage.title}
              </h3>
              <span className="text-gray-300">{advantage.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompetitiveAdvantages;

