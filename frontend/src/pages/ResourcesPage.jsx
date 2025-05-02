import React, { useState } from "react";
import { Search, BookOpen, Video, Code, Terminal, Database, Server, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    hackathonPrep: true,
    techStacks: true,
    apis: true,
    designResources: true,
    projectManagement: true,
    learning: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filter function for resource cards
  const filterResources = (resources) => {
    if (!searchQuery && selectedCategory === "all") return resources;
    
    return resources.filter(resource => {
      const matchesSearch = searchQuery === "" || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Reusable section component with toggle
  const ResourceSection = ({ id, title, children }) => (
    <section className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div 
        className="flex justify-between items-center p-6 cursor-pointer bg-gradient-to-r from-purple-50 to-indigo-50"
        onClick={() => toggleSection(id)}
      >
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {expandedSections[id] ? (
          <ChevronUp className="w-6 h-6 text-gray-600" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-600" />
        )}
      </div>
      {expandedSections[id] && (
        <div className="p-6">
          {children}
        </div>
      )}
    </section>
  );

  // Reusable card component for resources
  const ResourceCard = ({ title, description, icon, links, color, category }) => (
    <div className={`p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-l-4 ${color} border-t border-r border-b border-gray-100`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
          <p className="text-gray-600 mb-4 text-sm">{description}</p>
          
          <div className="space-y-2">
            {links.map((link, idx) => (
              <a 
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {link.icon} {link.text} <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Categories for filter
  const categories = [
    { id: "all", name: "All Resources" },
    { id: "frontend", name: "Frontend" },
    { id: "backend", name: "Backend" },
    { id: "database", name: "Database" },
    { id: "design", name: "Design" },
    { id: "tools", name: "Tools" },
    { id: "ai", name: "AI & ML" }
  ];

  // Hackathon prep resources data
  const hackathonPrepResources = [
    {
      title: "Hackathon Starter Kit",
      description: "Everything you need to know before your first hackathon",
      category: "tools",
      icon: <Terminal className="w-6 h-6 text-purple-600" />,
      color: "border-purple-600",
      links: [
        { 
          text: "MLH Hackathon Preparation Guide", 
          url: "https://mlh.io/prep",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        },
        { 
          text: "Hackathon Project Ideas Generator", 
          url: "https://github.com/Divide-By-0/ideas-for-projects-people-would-use",
          icon: <Code className="w-4 h-4 mr-1" />
        },
        { 
          text: "Hackathon Survival Guide", 
          url: "https://medium.com/hackathons-anonymous/hackathon-survival-guide-5-tips-to-make-the-most-out-of-a-hackathon-c4782b3ebb8f",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        }
      ]
    },
    {
      title: "Rapid Prototyping Tools",
      description: "Tools to build MVPs quickly for hackathons",
      category: "tools",
      icon: <Code className="w-6 h-6 text-blue-600" />,
      color: "border-blue-600",
      links: [
        { 
          text: "Figma for Rapid Prototyping", 
          url: "https://www.figma.com/",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        },
        { 
          text: "No-Code Tools for Hackathons", 
          url: "https://www.nocode.tech/",
          icon: <Video className="w-4 h-4 mr-1" />
        },
        { 
          text: "Quick Start Templates", 
          url: "https://github.com/topics/hackathon-starter",
          icon: <Code className="w-4 h-4 mr-1" />
        }
      ]
    },
    {
      title: "Presentation Skills",
      description: "How to effectively present your hackathon project",
      category: "tools",
      icon: <Video className="w-6 h-6 text-green-600" />,
      color: "border-green-600",
      links: [
        { 
          text: "Hackathon Presentation Tips", 
          url: "https://medium.com/hackathons-anonymous/how-to-crush-your-hackathon-demo-ede047d9c7a2",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        },
        { 
          text: "Demo Day Presentation Template", 
          url: "https://pitch.com/templates/Demo-Day-Pitch-Deck-Template-by-Pitch-v5yaqX",
          icon: <Terminal className="w-4 h-4 mr-1" />
        },
        { 
          text: "Public Speaking for Developers", 
          url: "https://www.youtube.com/watch?v=Jrbr88bY9lY",
          icon: <Video className="w-4 h-4 mr-1" />
        }
      ]
    }
  ];

  // React card with proper category
  const reactCard = {
    title: "React",
    description: "A JavaScript library for building user interfaces",
    category: "frontend",
    icon: <Code className="w-6 h-6 text-blue-600" />,
    color: "border-blue-600",
    links: [
      {
        text: "Official Docs",
        url: "https://react.dev/",
        icon: <BookOpen className="w-4 h-4 mr-1" />
      },
      {
        text: "Intro Video (YouTube)",
        url: "https://www.youtube.com/watch?v=SqcY0GlETPk",
        icon: <Video className="w-4 h-4 mr-1" />
      },
      {
        text: "Interactive Tutorial",
        url: "https://react.dev/learn",
        icon: <Terminal className="w-4 h-4 mr-1" />
      }
    ]
  };

  // Tailwind CSS card with proper category
  const tailwindCard = {
    title: "Tailwind CSS",
    description: "A utility-first CSS framework for rapidly building custom designs",
    category: "frontend",
    icon: <Code className="w-6 h-6 text-cyan-600" />,
    color: "border-cyan-600",
    links: [
      {
        text: "Official Docs",
        url: "https://tailwindcss.com/docs/installation",
        icon: <BookOpen className="w-4 h-4 mr-1" />
      },
      {
        text: "Crash Course (YouTube)",
        url: "https://www.youtube.com/watch?v=dFgzHOX84xQ",
        icon: <Video className="w-4 h-4 mr-1" />
      },
      {
        text: "Interactive Playground",
        url: "https://play.tailwindcss.com/",
        icon: <Terminal className="w-4 h-4 mr-1" />
      }
    ]
  };

  // Firebase card with proper category
  const firebaseCard = {
    title: "Firebase",
    description: "Platform for building web and mobile applications without server-side programming",
    category: "database",
    icon: <Database className="w-6 h-6 text-amber-600" />,
    color: "border-amber-600",
    links: [
      {
        text: "Official Docs",
        url: "https://firebase.google.com/docs",
        icon: <BookOpen className="w-4 h-4 mr-1" />
      },
      {
        text: "Basics Video (YouTube)",
        url: "https://www.youtube.com/watch?v=9kRgVxULbag",
        icon: <Video className="w-4 h-4 mr-1" />
      },
      {
        text: "Interactive Codelabs",
        url: "https://firebase.google.com/codelabs",
        icon: <Terminal className="w-4 h-4 mr-1" />
      }
    ]
  };

  // Tech stack resources all in one array
  const techStackResources = [
    reactCard,
    tailwindCard,
    firebaseCard
    // Add other tech stack resources here
  ];

  // Free APIs resources as array of objects
  const apiResources = [
    {
      title: "Public APIs Collection",
      description: "A collective list of more than 1000 free APIs for use in software and web development",
      category: "backend",
      icon: <Server className="w-6 h-6 text-purple-600" />,
      color: "border-purple-600",
      links: [
        {
          text: "Browse the collection",
          url: "https://github.com/public-apis/public-apis",
          icon: <Code className="w-4 h-4 mr-1" />
        }
      ]
    },
    {
      title: "JSONPlaceholder",
      description: "Free fake API for testing and prototyping. Perfect for creating demos without needing a backend",
      category: "backend",
      icon: <Server className="w-6 h-6 text-purple-600" />,
      color: "border-purple-600",
      links: [
        {
          text: "Try JSONPlaceholder",
          url: "https://jsonplaceholder.typicode.com/",
          icon: <Terminal className="w-4 h-4 mr-1" />
        }
      ]
    },
    {
      title: "OpenWeatherMap API",
      description: "Access current weather data, forecasts, historical data and more for any location on Earth",
      category: "backend",
      icon: <Server className="w-6 h-6 text-purple-600" />,
      color: "border-purple-600",
      links: [
        {
          text: "View documentation",
          url: "https://openweathermap.org/api",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        }
      ]
    },
    {
      title: "Lorem Picsum",
      description: "The Lorem Ipsum for photos. Easy to use placeholder images for your design mockups and prototypes",
      category: "design",
      icon: <Server className="w-6 h-6 text-purple-600" />,
      color: "border-purple-600",
      links: [
        {
          text: "Get placeholder images",
          url: "https://picsum.photos/",
          icon: <Terminal className="w-4 h-4 mr-1" />
        }
      ]
    },
    {
      title: "CoinGecko API",
      description: "Free API for real-time and historical cryptocurrency prices, market data, and more",
      category: "backend",
      icon: <Server className="w-6 h-6 text-purple-600" />,
      color: "border-purple-600",
      links: [
        {
          text: "View API docs",
          url: "https://www.coingecko.com/en/api/documentation",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        }
      ]
    },
    {
      title: "News API",
      description: "Search for news articles from over 80,000 sources worldwide. Great for news applications and dashboards",
      category: "backend",
      icon: <Server className="w-6 h-6 text-purple-600" />,
      color: "border-purple-600",
      links: [
        {
          text: "Check News API",
          url: "https://newsapi.org/",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        }
      ]
    }
  ];

  const designResources = [
    {
      title: "UI/UX Design Resources",
      description: "Tools and resources for creating beautiful user interfaces",
      category: "design",
      icon: <BookOpen className="w-6 h-6 text-pink-600" />,
      color: "border-pink-600",
      links: [
        { 
          text: "Dribbble - Design Inspiration", 
          url: "https://dribbble.com/",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        },
        { 
          text: "Figma Community Resources", 
          url: "https://www.figma.com/community",
          icon: <Terminal className="w-4 h-4 mr-1" />
        },
        { 
          text: "UI Design Basics", 
          url: "https://www.youtube.com/watch?v=0JCUH5daCCE",
          icon: <Video className="w-4 h-4 mr-1" />
        }
      ]
    },
    {
      title: "Free Design Assets",
      description: "Free icons, illustrations, and design assets for your projects",
      category: "design",
      icon: <BookOpen className="w-6 h-6 text-teal-600" />,
      color: "border-teal-600",
      links: [
        { 
          text: "Unsplash - Free Images", 
          url: "https://unsplash.com/",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        },
        { 
          text: "Undraw - Free Illustrations", 
          url: "https://undraw.co/illustrations",
          icon: <Terminal className="w-4 h-4 mr-1" />
        },
        { 
          text: "Iconify - Open Source Icons", 
          url: "https://iconify.design/",
          icon: <Code className="w-4 h-4 mr-1" />
        }
      ]
    }
  ];

  const projectManagementResources = [
    {
      title: "Project Management for Hackathons",
      description: "Tools to organize your hackathon team and project workflow",
      category: "tools",
      icon: <Server className="w-6 h-6 text-indigo-600" />,
      color: "border-indigo-600",
      links: [
        { 
          text: "Trello for Project Tracking", 
          url: "https://trello.com/",
          icon: <Terminal className="w-4 h-4 mr-1" />
        },
        { 
          text: "GitHub Project Management", 
          url: "https://github.com/features/project-management/",
          icon: <Code className="w-4 h-4 mr-1" />
        },
        { 
          text: "Discord for Team Communication", 
          url: "https://discord.com/",
          icon: <Video className="w-4 h-4 mr-1" />
        }
      ]
    }
  ];

  const aiMLResources = [
    {
      title: "AI & ML for Hackathons",
      description: "Resources for integrating AI/ML into your hackathon projects",
      category: "ai",
      icon: <Database className="w-6 h-6 text-rose-600" />,
      color: "border-rose-600",
      links: [
        { 
          text: "Hugging Face - NLP Models & Datasets", 
          url: "https://huggingface.co/",
          icon: <Code className="w-4 h-4 mr-1" />
        },
        { 
          text: "OpenAI API Documentation", 
          url: "https://platform.openai.com/docs/",
          icon: <BookOpen className="w-4 h-4 mr-1" />
        },
        { 
          text: "Google Cloud AI Tools", 
          url: "https://cloud.google.com/products/ai",
          icon: <Terminal className="w-4 h-4 mr-1" />
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 md:p-10 bg-gradient-to-br from-gray-50 via-stone-50 to-slate-100 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
        Hackathon Resource Hub
      </h1>
      
      <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
        Find all the resources you need to succeed in your next hackathon, from tech stacks and APIs 
        to design resources and project management tools.
      </p>
      
      {/* Search and filter section */}
      <div className="mb-12 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Hackathon Preparation Resources */}
      <ResourceSection id="hackathonPrep" title="Hackathon Preparation Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterResources(hackathonPrepResources).map((resource, index) => (
            <ResourceCard 
              key={index}
              {...resource}
            />
          ))}
        </div>
      </ResourceSection>
      
      {/* Tech Stack Resources */}
      <ResourceSection id="techStacks" title="Technology Stacks & Frameworks">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterResources(techStackResources).map((resource, index) => (
            <ResourceCard 
              key={index}
              {...resource}
            />
          ))}
        </div>
      </ResourceSection>
      
      {/* APIs Section - Enhanced with better descriptions */}
      <ResourceSection id="apis" title="Free APIs for Hackathon Projects">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <p className="text-gray-600 mb-6">
            Integrate these free APIs into your hackathon projects to add powerful functionality without building everything from scratch.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filterResources(apiResources).map((resource, index) => (
              <div key={index} className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-3 text-sm">{resource.description}</p>
                {resource.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    {link.icon} {link.text} <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </ResourceSection>
      
      {/* Design Resources Section */}
      <ResourceSection id="designResources" title="Design Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filterResources(designResources).map((resource, index) => (
            <ResourceCard 
              key={index}
              {...resource}
            />
          ))}
        </div>
      </ResourceSection>
      
      {/* Project Management Section */}
      <ResourceSection id="projectManagement" title="Project Management Tools">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filterResources(projectManagementResources).map((resource, index) => (
            <ResourceCard 
              key={index}
              {...resource}
            />
          ))}
        </div>
      </ResourceSection>
      
      {/* AI/ML Resources Section */}
      <ResourceSection id="learning" title="AI & Machine Learning Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filterResources(aiMLResources).map((resource, index) => (
            <ResourceCard 
              key={index}
              {...resource}
            />
          ))}
        </div>
      </ResourceSection>
    </div>
  );
}

export default ResourcesPage;
