function ScratchPromo() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Genesis Scratch – Scratch to See the Future!
          </h1>
          <p className="text-xl text-gray-300">
            Genesis introduces Scratch, the latest innovation that transforms a
            simple scratching action into an exciting tech experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h5 className="text-2xl font-bold text-cyan-400 mb-4">
              🔷 What is Genesis Scratch?
            </h5>
            <p className="text-gray-300 mb-4">
              A modern, interactive scratch game. Each scratch not only reveals
              a prize — but also brings joy, connection, and a new perspective
              on the future.
            </p>
            <p className="text-gray-300 mb-4">
              Perfect for instant excitement or for collectors of unique
              experiences — Scratch isn't just a game; it's a gateway to
              discovery.
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
              <li>🔥 Tradition reimagined with technology</li>
              <li>🔥 Anticipation transformed into instant excitement</li>
            </ul>
            <p className="text-gray-300 mb-4">
              <strong>🚀 Genesis doesn't just produce products — we create experiences.</strong>{' '}
              With a portfolio combining physical and digital solutions, we blend
              technology, creativity, and passion to always lead the way.
            </p>
            <p className="text-gray-300 mb-4">
              📲 Coming soon: tournaments, leaderboards, digital versions, and
              much more!
            </p>
            <p className="text-gray-300 mb-4">
              👉 Own the game. Feel the revolution. Play Scratch with Genesis.
            </p>
            <p className="text-gray-300 mb-4">
              💡 Physical products? Yes.<br />
              🌐 Digital products? Absolutely.<br />
              ✨ Innovation? Always.
            </p>
            <p className="text-gray-300 mb-6">
              <strong>Genesis doesn't chase trends — we create the future.</strong>
            </p>
            <a
              href="#"
              className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg transition-colors duration-200"
            >
              Play Now
            </a>
          </div>
          <div>
            <img
              src="/img/scratchpromo.png"
              alt="Genesis Scratch"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScratchPromo;

