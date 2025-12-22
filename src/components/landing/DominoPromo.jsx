function DominoPromo() {
  return (
    <section className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎯 X1 Domino – The Revolution of Traditional Gaming!
          </h1>
          <p className="text-xl text-gray-300">
            Genesis introduces X1 Domino, one of the most groundbreaking
            products. It completely changes how you enjoy, compete, and connect
            through classic dominoes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
              <div className="text-4xl text-cyan-400 mb-4">
                <i className="fas fa-gamepad"></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                🔷 What is X1 Domino?
              </h4>
              <p className="text-gray-300">
                A fast-paced, strategic, and thrilling 1v1 experience. With
                optimized rules, more dynamic matches, and a focus on individual
                skills, X1 takes dominoes to a new level.
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
              <div className="text-4xl text-cyan-400 mb-4">
                <i className="fas fa-users"></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Perfect for Everyone
              </h4>
              <p className="text-gray-300">
                Perfect for both casual players and serious competitors; X1
                Domino isn't just a game — it's a movement.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <img
              src="/img/domino-vn.png"
              alt="X1 Domino"
              className="w-full h-auto rounded-lg mb-6"
            />
            <a
              href="#"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg transition-colors duration-200"
            >
              Try Our Domino Now!
            </a>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
              <div className="text-4xl text-cyan-400 mb-4">
                <i className="fas fa-star"></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Key Features
              </h4>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>🔥 Blends tradition and innovation</li>
                <li>🔥 Enhances quick thinking and decision-making</li>
                <li>
                  🔥 Perfect for tournaments, events, online/offline competitions
                </li>
              </ul>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
              <div className="text-4xl text-cyan-400 mb-4">
                <i className="fas fa-clock"></i>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Coming Soon</h4>
              <p className="text-gray-300 mb-2">
                📲 Tournaments, leaderboards, digital versions, and much more!
              </p>
              <p className="text-gray-300">
                <strong>
                  👉 Master the game. Feel the revolution. Play X1 with Genesis.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DominoPromo;

