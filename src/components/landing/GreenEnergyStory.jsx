function GreenEnergyStory() {
  const items = [
    {
      icon: 'fas fa-globe',
      title: 'Global energy challenges',
      description:
        'Novaxis aims to address global energy challenges by promoting the widespread adoption of renewable energy sources such as solar, wind, and hydro power, combined with advanced storage technologies.'
    },
    {
      icon: 'fas fa-brain',
      title: 'AI',
      description:
        'Used to forecast energy output and optimize electricity distribution.'
    },
    {
      icon: 'fas fa-link',
      title: 'Blockchain',
      description:
        'Ensures transparency in peer-to-peer energy trading and carbon credit management.'
    },
    {
      icon: 'fas fa-leaf',
      title: 'The global Net Zero commitment',
      description:
        'Each transaction on Novaxis Chain is not only a financial action but also a green contribution toward the global Net Zero commitment.'
    }
  ];

  return (
    <section id="buy_sell" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Green Energy Story
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="space-y-6">
            {items.slice(0, 2).map((item, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30"
              >
                <div className="text-4xl text-cyan-400 mb-4">
                  <i className={item.icon}></i>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <img
              src="https://res.cloudinary.com/dijayprrw/image/upload/v1766006482/Screenshot_2025-12-18_042104_wcewgf.png"
              alt="Green Energy"
              className="max-w-full h-auto rounded-lg"
            />
          </div>

          <div className="space-y-6">
            {items.slice(2).map((item, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30"
              >
                <div className="text-4xl text-cyan-400 mb-4">
                  <i className={item.icon}></i>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GreenEnergyStory;

