import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-center">About Hackathon Teammate Finder</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-4">
          Hackathon Teammate Finder is designed to connect passionate developers, designers, and innovators 
          to form exceptional teams for hackathons. We believe that the right team can transform great ideas 
          into winning projects.
        </p>
        <p className="text-gray-700">
          Our platform makes it easy to find teammates with complementary skills, shared interests, 
          and compatible working styles - helping you build the perfect team for your next hackathon challenge.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-medium mb-2">Create Your Profile</h3>
            <p className="text-gray-600">Build your profile highlighting your skills, experience, and interests</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-medium mb-2">Browse Hackathons</h3>
            <p className="text-gray-600">Discover upcoming hackathons and explore team opportunities</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-medium mb-2">Connect with Teams</h3>
            <p className="text-gray-600">Join existing teams or create your own and invite others</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="text-gray-700 mb-4">
          Have questions, suggestions, or feedback? We'd love to hear from you!
        </p>
        <p className="text-gray-700">
          Email us at: <a href="mailto:contact@hackathonteammatefinder.com" className="text-blue-600 hover:underline">contact@hackathonteammatefinder.com</a>
        </p>
      </div>
    </div>
  );
};

export default AboutPage; 