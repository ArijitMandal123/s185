import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-6 py-16 max-w-6xl">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
        About <span className="text-blue-600">Hackathon Teammate Finder</span>
      </h1>

      {/* Our Mission */}
      <section className="bg-gradient-to-r from-blue-50 to-white rounded-3xl shadow-lg p-8 mb-12 transition hover:shadow-2xl">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Hackathon Teammate Finder is designed to connect passionate developers, designers, and innovators 
          to form exceptional teams for hackathons. We believe that the right team can transform great ideas 
          into winning projects.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Our platform makes it easy to find teammates with complementary skills, shared interests, 
          and compatible working styles — helping you build the perfect team for your next hackathon challenge.
        </p>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-3xl shadow-lg p-8 mb-12 transition hover:shadow-2xl">
        <h2 className="text-3xl font-semibold mb-10 text-gray-800 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-md">
              <span className="text-3xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-700">Create Your Profile</h3>
            <p className="text-gray-500 leading-relaxed">
              Build your profile highlighting your skills, experience, and interests.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-md">
              <span className="text-3xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-700">Browse Hackathons</h3>
            <p className="text-gray-500 leading-relaxed">
              Discover upcoming hackathons and explore team opportunities.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-md">
              <span className="text-3xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-700">Connect with Teams</h3>
            <p className="text-gray-500 leading-relaxed">
              Join existing teams or create your own and invite others.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="bg-gradient-to-r from-white to-blue-50 rounded-3xl shadow-lg p-8 transition hover:shadow-2xl">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Contact Us</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Have questions, suggestions, or feedback? We'd love to hear from you!
        </p>
        <p className="text-gray-600 leading-relaxed">
          Email us at: <a 
            href="mailto:contact@hackathonteammatefinder.com" 
            className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition">
            susmita.sen1130@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
