export const Contact = () => {
  return (
    <section className="w-full py-16 bg-black" id="contact">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Contact Us
          </h2>
          <p className="text-gray-600 mb-6">
            Got a question, partnership idea, or feedback about Quebec? 
            We'd love to hear from you. Fill out the form or reach us via email below.
          </p>
          <p className="text-gray-700">
            📧 <span className="font-medium">support@quebec.io</span>
          </p>
          <p className="text-gray-700 mt-2">
            📍 Ilorin, Kwara State, Nigeria
          </p>
        </div>

        <form className="rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full bg-[#424242] text-white py-3 px-5 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3333ff] transition duration-150"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Your email"
              className="w-full bg-[#424242] text-white py-3 px-5 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3333ff] transition duration-150"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Message</label>
            <textarea
              rows={4}
              placeholder="Write your message..."
              className="w-full bg-[#424242] text-white py-3 px-5 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3333ff] transition duration-150"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-[#3333ff] text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};
