function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Message sent!');
  };

  return (
    <section id="contact" className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h4 className="text-3xl font-bold text-white mb-4">
              Write Your Message
            </h4>
            <p className="text-gray-300 mb-6">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  className="bg-gray-800/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="bg-gray-800/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                required
                className="w-full bg-gray-800/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
              <textarea
                rows="6"
                name="message"
                placeholder="Your Message"
                required
                className="w-full bg-gray-800/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              ></textarea>
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg transition-colors duration-200"
              >
                Submit Message
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
              <div className="flex items-center mb-4">
                <span className="text-cyan-400 text-2xl mr-4">📍</span>
                <h4 className="text-xl font-bold text-white">Address</h4>
              </div>
              <p className="text-gray-300">3481 Melrose Place, Beverly Hills</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
              <div className="flex items-center mb-4">
                <span className="text-cyan-400 text-2xl mr-4">📞</span>
                <h4 className="text-xl font-bold text-white">Phone</h4>
              </div>
              <p className="text-gray-300">+512 513 96324</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
              <div className="flex items-center mb-4">
                <span className="text-cyan-400 text-2xl mr-4">✉️</span>
                <h4 className="text-xl font-bold text-white">Email</h4>
              </div>
              <p className="text-gray-300">example@example.com</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
              <div className="flex items-center mb-4">
                <span className="text-cyan-400 text-2xl mr-4">🕐</span>
                <h4 className="text-xl font-bold text-white">Working Hours</h4>
              </div>
              <p className="text-gray-300">Mon to Sat 9:00am to 5:00pm</p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-lg overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.957183635167!2d-74.00402768559431!3d40.71895904512855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2598a1316e7a7%3A0x47bb20eb6074b3f0!2sNew%20Work%20City%20-%20(CLOSED)!5e0!3m2!1sbn!2sbd!4v1600305497356!5m2!1sbn!2sbd"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

export default Contact;

