import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

function HackathonListingsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'upcoming', 'ongoing', 'past'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterIsVirtual, setFilterIsVirtual] = useState("");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchHackathons() {
      setLoading(true);
      setError(null);
      try {
        const hackathonsCollection = collection(db, "hackathons");
        let hackathonQuery = query(
          hackathonsCollection,
          orderBy("startDate", "desc")
        );

        // Get all hackathons first
        const hackathonSnapshot = await getDocs(hackathonQuery);
        let hackathonList = hackathonSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamps to ISO strings for display
            startDate:
              data.startDate?.toDate?.()?.toISOString() || data.startDate,
            endDate: data.endDate?.toDate?.()?.toISOString() || data.endDate,
          };
        });

        setHackathons(hackathonList);
      } catch (err) {
        console.error("Error fetching hackathons:", err);
        setError("Failed to fetch hackathons: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHackathons();
  }, []);

  const handleAddTag = () => {
    if (newTag.trim() && !filterTags.includes(newTag.trim())) {
      setFilterTags([...filterTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFilterTags(filterTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getStatusBadge = (startDate, endDate) => {
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (now < start) {
        return (
          <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
            Upcoming
          </span>
        );
      } else if (now >= start && now <= end) {
        return (
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Ongoing
          </span>
        );
      } else {
        return (
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            Past
          </span>
        );
      }
    } catch (error) {
      console.error("Error determining status:", error);
      return (
        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
          Unknown
        </span>
      );
    }
  };

  const filteredAndSortedHackathons = hackathons
    .filter((hackathon) => {
      // Filter by status (all, upcoming, ongoing, past)
      const now = new Date();
      const startDate = new Date(hackathon.startDate);
      const endDate = new Date(hackathon.endDate);

      let matchesStatus = true;
      if (filter === "upcoming") {
        matchesStatus = startDate > now;
      } else if (filter === "ongoing") {
        matchesStatus = startDate <= now && endDate >= now;
      } else if (filter === "past") {
        matchesStatus = endDate < now;
      }

      // Filter by search term
      const matchesSearch =
        hackathon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        hackathon.location?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by tags if any tags are selected
      const matchesTags =
        filterTags.length === 0 ||
        filterTags.every((tag) =>
          hackathon.tags?.some((hackathonTag) =>
            hackathonTag.toLowerCase().includes(tag.toLowerCase())
          )
        );

      // Filter by location
      const matchesLocation =
        !filterLocation ||
        hackathon.location
          ?.toLowerCase()
          .includes(filterLocation.toLowerCase());

      // Filter by virtual status
      const matchesVirtual =
        filterIsVirtual === "" ||
        (filterIsVirtual === "true" && hackathon.isVirtual) ||
        (filterIsVirtual === "false" && !hackathon.isVirtual);

      return (
        matchesStatus &&
        matchesSearch &&
        matchesTags &&
        matchesLocation &&
        matchesVirtual
      );
    })
    .sort((a, b) => {
      let valueA = a[sortBy] || "";
      let valueB = b[sortBy] || "";

      // Handle date fields
      if (sortBy === "startDate" || sortBy === "endDate") {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      // Handle string comparison
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Handle numeric comparison
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });

  // Get unique locations and tags for filter dropdowns
  const uniqueLocations = [
    ...new Set(
      hackathons.map((hackathon) => hackathon.location).filter(Boolean)
    ),
  ];
  const allTags = hackathons
    .flatMap((hackathon) => hackathon.tags || [])
    .filter(Boolean);
  const uniqueTags = [...new Set(allTags)];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 px-4 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-1/4 right-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Hackathon Events
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl">
                Discover exciting hackathon events, connect with teams, and
                showcase your skills.
              </p>
            </div>
            {/* <Link
              to="/add-hackathon"
              className="mt-6 md:mt-0 bg-white text-indigo-600 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium flex items-center shadow-md"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Add Hackathon
            </Link> */}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="w-full h-8 md:h-16"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              className="fill-gray-50"
            ></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-4 relative z-10">
        {/* Search and quick filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="relative w-full md:w-2/3 mb-4 md:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or location"
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  ></path>
                </svg>
                {showFilters ? "Hide Filters" : "Advanced Filters"}
              </button>
            </div>
          </div>

          {/* Status filter buttons always visible */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "upcoming"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("ongoing")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "ongoing"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "past"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Past
            </button>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Location
                  </label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Virtual/In-person filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={filterIsVirtual}
                    onChange={(e) => setFilterIsVirtual(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="true">Virtual</option>
                    <option value="false">In-person</option>
                  </select>
                </div>

                {/* Sort options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="startDate">Start Date</option>
                      <option value="name">Name</option>
                      <option value="location">Location</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="bg-gray-100 px-3 border-y border-r border-gray-300 rounded-r-md hover:bg-gray-200"
                      title={sortOrder === "asc" ? "Ascending" : "Descending"}
                    >
                      {sortOrder === "asc" ? (
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                          ></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {filterTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center">
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a tag...</option>
                    {uniqueTags
                      .filter((tag) => !filterTags.includes(tag))
                      .map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredAndSortedHackathons.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-1">
              No hackathons found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedHackathons.map((hackathon) => (
              <div
                key={hackathon.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                {hackathon.imageUrl ? (
                  <div className="h-48 w-full relative">
                    <img
                      src={hackathon.imageUrl}
                      alt={hackathon.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(hackathon.startDate, hackathon.endDate)}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-r from-indigo-500 to-purple-600 relative flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {hackathon.name?.substring(0, 1) || "H"}
                    </span>
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(hackathon.startDate, hackathon.endDate)}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-gray-900">
                    {hackathon.name}
                  </h3>

                  <div className="flex items-center mb-4">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span className="text-gray-600 text-sm">
                      {formatDate(hackathon.startDate)} -{" "}
                      {formatDate(hackathon.endDate)}
                    </span>
                  </div>

                  <div className="flex items-start mb-4">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    <span className="text-gray-600 text-sm">
                      {hackathon.isVirtual
                        ? "Virtual Event"
                        : hackathon.location || "Location not specified"}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {hackathon.description || "No description available."}
                  </p>

                  {hackathon.tags && hackathon.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {hackathon.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {hackathon.tags.length > 3 && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                            +{hackathon.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/hackathon/${hackathon.id}`}
                    className="block text-center w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HackathonListingsPage;
