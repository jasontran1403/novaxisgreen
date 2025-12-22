function Ecosystem() {
  const items = [
    {
      icon: 'fas fa-wallet',
      title: 'NovaWallet',
      description:
        'A multi-functional wallet supporting novaxisgreen and other tokens, with staking and payment features.'
    },
    {
      icon: 'fas fa-shopping-cart',
      title: 'E-commerce Crypto',
      description:
        'A commerce platform using novaxisgreen and stablecoins, generating real-world cash flows.'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Tap-to-Earn App',
      description:
        'A viral mobile app rewarding users with novaxisgreen tokens for engaging in eco-friendly actions.'
    },
    {
      icon: 'fas fa-store',
      title: 'GreenFi Marketplace',
      description:
        'A transparent marketplace for trading carbon credits and renewable energy assets.'
    },
    {
      icon: 'fas fa-cube',
      title: 'Metaverse Novaxis',
      description:
        'A virtual space connecting green energy, crypto assets, and the global community.'
    }
  ];

  return (
    <section id="ecosystem" className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Novaxis Ecosystem
          </h1>
          <p className="text-xl text-gray-300">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 text-center"
            >
              <div className="text-6xl text-cyan-400 mb-4">
                <i className={item.icon}></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">
                {item.title}
              </h4>
              <p className="text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Ecosystem;

