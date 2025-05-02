import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  useEffect(() => {
    // Initialize animation for elements with data-aos
    const animateOnScroll = () => {
      const elements = document.querySelectorAll("[data-aos]");
      const triggerBottom = window.innerHeight * 0.8;
      
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < triggerBottom) {
          element.classList.add("aos-animate");
        }
      });
    };
    
    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", animateOnScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Enhanced Gradient Background */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-700 to-purple-800">
        {/* Animated patterns in background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute w-full h-full">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full mix-blend-multiply filter blur-3xl animate-blob"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 40 + 40}rem`,
                  height: `${Math.random() * 40 + 40}rem`,
                  background: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 255)}, 0.${Math.floor(Math.random() * 5 + 3)})`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${Math.random() * 15 + 10}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0 text-center lg:text-left" data-aos="fade-right">
              {/* <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 bg-opacity-20 text-indigo-100 text-sm font-medium mb-5">
                Find Your Dream Team
              </span> */}
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
                Find Your Perfect{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400 animate-text-shimmer">
                  Hackathon Team
                </span>
              </h1>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect with talented developers, designers, and innovators.
                Build something amazing together and take your ideas to the next
                level.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/create-profile"
                  className="inline-block bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-medium py-3 px-8 rounded-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 shadow-indigo-500/30"
                >
                  Get Started
                </Link>
                <Link
                  to="/hackathons"
                  className="inline-block bg-transparent border-2 border-white text-white font-medium py-3 px-8 rounded-md hover:bg-white hover:text-indigo-700 transition-colors duration-300"
                >
                  Explore Hackathons
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative" data-aos="fade-left" data-aos-delay="200">
              <div className="w-full h-96 relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-full filter blur-md"></div>
                  <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full filter blur-md"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-900 rounded-xl shadow-inner flex items-center justify-center overflow-hidden">
                    <div className="relative z-10 text-center p-6">
                      <div className="text-5xl font-bold text-white mb-2 animate-pulse">
                        &lt;/&gt;
                      </div>
                      <p className="text-gray-300 text-sm">
                        Build your dream team today
                      </p>
                    </div>
                    {/* Code lines animation */}
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(15)].map((_, i) => (
                        <div 
                          key={i}
                          className="h-px bg-white/50"
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${i * 10 + 10}%`,
                            width: `${Math.random() * 40 + 60}%`,
                            marginLeft: `${Math.random() * 20}%`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="w-full h-12 md:h-24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              className="fill-white"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              className="fill-white"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20" data-aos="fade-up">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mb-3">
              How It Works
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Find. Connect. <span className="text-indigo-600">Create.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy to find the perfect team for your next
              hackathon project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 group" data-aos="fade-up" data-aos-delay="0">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-md group-hover:scale-110 transition-all duration-300">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 group-hover:text-indigo-600 transition-colors">
                Find Teammates
              </h3>
              <p className="text-gray-600 text-center">
                Connect with developers who share your interests and complement
                your skills. Build a diverse team with the exact expertise you
                need.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 group" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-gradient-to-br from-pink-500 to-red-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-md group-hover:scale-110 transition-all duration-300">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.5 1.5L15 0h7.5L24 1.5V9l-1.5 1.5H15L13.5 9V1.5zM0 15V6l1.5-1.5H9L10.5 6v7.5H18l1.5 1.5v7.5L18 24h-7.5L9 22.5H1.5L0 21v-6z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 group-hover:text-pink-600 transition-colors">
                Join Hackathons
              </h3>
              <p className="text-gray-600 text-center">
                Browse and participate in exciting hackathons from around the
                world. Find the perfect event to showcase your skills.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 group" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-md group-hover:scale-110 transition-all duration-300">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                  <path d="M6.5 17.5l7.5-3.5v-6.5l-7.5 3.5z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 group-hover:text-yellow-600 transition-colors">
                Build Together
              </h3>
              <p className="text-gray-600 text-center">
                Collaborate with your team remotely or in-person to create
                innovative solutions and bring your ideas to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50 opacity-70"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mb-3">
              Success Stories
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              From Our <span className="text-indigo-600">Community</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our platform has helped people build amazing teams and win
              hackathons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="0">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-xl font-bold text-indigo-600">A</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Alex Johnson</h4>
                  <p className="text-indigo-600 text-sm">Frontend Developer</p>
                </div>
              </div>
              <div className="text-4xl text-indigo-300 mb-2">"</div>
              <p className="text-gray-700 italic">
                I found an amazing team through this platform and we ended up
                winning our first hackathon together! The skills matching
                algorithm is spot on.
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-xl font-bold text-pink-600">S</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Sarah Chen</h4>
                  <p className="text-pink-600 text-sm">UX Designer</p>
                </div>
              </div>
              <div className="text-4xl text-pink-300 mb-2">"</div>
              <p className="text-gray-700 italic">
                As a designer, I was looking for developers who could bring my
                ideas to life. Within days I found the perfect teammates for my
                project.
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-xl font-bold text-yellow-600">M</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Michael Taylor</h4>
                  <p className="text-yellow-600 text-sm">Backend Developer</p>
                </div>
              </div>
              <div className="text-4xl text-yellow-300 mb-2">"</div>
              <p className="text-gray-700 italic">
                The platform made it incredibly easy to join hackathons and
                find teammates with complementary skills. Our team has now done
                three hackathons together!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white mix-blend-overlay"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                opacity: Math.random() * 0.5 + 0.2
              }}
            ></div>
          ))}
        </div>
        <div className="container mx-auto px-4 text-center relative z-10" data-aos="fade-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to find your dream team?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of developers, designers, and innovators already
            building amazing projects together.
          </p>
          <Link
            to="/create-profile"
            className="inline-block bg-white text-indigo-600 font-bold py-3 px-10 rounded-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
          >
            Create Your Profile
          </Link>
        </div>
      </section>

      {/* Add animations to tailwind.css via style tag */}
      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        [data-aos] {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        [data-aos].aos-animate {
          opacity: 1;
          transform: translateY(0);
        }
        .animate-text-shimmer {
          background-size: 200% 100%;
          animation: textShimmer 2s linear infinite;
        }
        @keyframes textShimmer {
          0% { background-position: 100%; }
          100% { background-position: 0%; }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;