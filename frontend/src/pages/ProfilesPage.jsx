import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfilePicture } from '../utils/githubUtils';

function ProfilesPage() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSkills, setFilterSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterExperience, setFilterExperience] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterMode, setFilterMode] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        async function fetchProfiles() {
            try {
                setLoading(true);
                const profilesQuery = query(
                    collection(db, 'users'),
                    orderBy('name')
                );
                const profilesSnapshot = await getDocs(profilesQuery);
                
                const profilesData = await Promise.all(profilesSnapshot.docs.map(async doc => {
                    const data = doc.data();
                    // Fetch profile picture for each user
                    let profilePicture = null;
                    if (data.github || data.linkedin) {
                        try {
                            profilePicture = await getProfilePicture(data.github, data.linkedin);
                        } catch (err) {
                            console.error('Error fetching profile picture:', err);
                        }
                    }
                    
                    return {
                        id: doc.id,
                        userId: doc.id,
                        profilePicture,
                        ...data
                    };
                }));
                
                setProfiles(profilesData);
            } catch (err) {
                console.error('Error fetching profiles:', err);
                setError('Failed to load profiles: ' + err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfiles();
    }, []);

    const handleAddSkill = () => {
        if (newSkill.trim() && !filterSkills.includes(newSkill.trim())) {
            setFilterSkills([...filterSkills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFilterSkills(filterSkills.filter(skill => skill !== skillToRemove));
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const filteredAndSortedProfiles = profiles
        .filter(profile => {
            // Filter by search term
            const matchesSearch = 
                profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                profile.role?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Filter by skills if any skills are selected
            const matchesSkills = filterSkills.length === 0 || 
                                filterSkills.every(skill => 
                                    profile.techStack?.some(tech => 
                                        tech.toLowerCase().includes(skill.toLowerCase())
                                    ) || 
                                    profile.languages?.some(lang => 
                                        lang.toLowerCase().includes(skill.toLowerCase())
                                    )
                                );
            
            // Filter by role
            const matchesRole = !filterRole || profile.role === filterRole;
            
            // Filter by experience
            const matchesExperience = !filterExperience || profile.experience === filterExperience;
            
            // Filter by location
            const matchesLocation = !filterLocation || 
                                  profile.location?.toLowerCase().includes(filterLocation.toLowerCase());
            
            // Filter by work mode
            const matchesMode = !filterMode || profile.mode === filterMode;
            
            return matchesSearch && matchesSkills && matchesRole && 
                   matchesExperience && matchesLocation && matchesMode;
        })
        .sort((a, b) => {
            let valueA = a[sortBy] || '';
            let valueB = b[sortBy] || '';
            
            // Handle array fields
            if (Array.isArray(valueA) && Array.isArray(valueB)) {
                valueA = valueA.length;
                valueB = valueB.length;
            }
            
            // Handle string comparison
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return sortOrder === 'asc' 
                    ? valueA.localeCompare(valueB) 
                    : valueB.localeCompare(valueA);
            }
            
            // Handle numeric comparison
            return sortOrder === 'asc' 
                ? valueA - valueB 
                : valueB - valueA;
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
                    <p className="text-center text-[#0C0950] mt-4">Loading profiles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
                        <p className="font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Get unique roles, experiences, and modes for filter dropdowns
    const uniqueRoles = [...new Set(profiles.map(profile => profile.role).filter(Boolean))];
    const uniqueExperiences = [...new Set(profiles.map(profile => profile.experience).filter(Boolean))];
    const uniqueModes = [...new Set(profiles.map(profile => profile.mode).filter(Boolean))];
    const allSkills = [
        ...new Set([
            ...profiles.flatMap(profile => profile.techStack || []),
            ...profiles.flatMap(profile => profile.languages || [])
        ].filter(Boolean))
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-4 relative overflow-hidden">
                {/* Abstract shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                    <div className="absolute top-1/4 right-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                    <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
                </div>

                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Developer Profiles</h1>
                            <p className="text-xl text-indigo-100 max-w-2xl">
                                Find talented developers with the right skills to join your hackathon team or project.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter Controls */}
                <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
                    <div className="p-6">
                        <div className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, bio, or role"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                            >
                                {showFilters ? (
                                    <>
                                        <span>Hide Filters</span>
                                        <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        <span>Show Filters</span>
                                        <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {showFilters && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                                        <select
                                            value={filterRole}
                                            onChange={(e) => setFilterRole(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="">All Roles</option>
                                            {uniqueRoles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Experience</label>
                                        <select
                                            value={filterExperience}
                                            onChange={(e) => setFilterExperience(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="">All Experience Levels</option>
                                            {uniqueExperiences.map(exp => (
                                                <option key={exp} value={exp}>{exp}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Location</label>
                                        <input
                                            type="text"
                                            value={filterLocation}
                                            onChange={(e) => setFilterLocation(e.target.value)}
                                            placeholder="Enter location"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Work Mode</label>
                                        <select
                                            value={filterMode}
                                            onChange={(e) => setFilterMode(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="">All Work Modes</option>
                                            {uniqueModes.map(mode => (
                                                <option key={mode} value={mode}>{mode}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Skills</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {filterSkills.map(skill => (
                                            <span 
                                                key={skill} 
                                                className="bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm flex items-center"
                                            >
                                                {skill}
                                                <button 
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                                                >
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path 
                                                            fillRule="evenodd" 
                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                                                            clipRule="evenodd" 
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex">
                                        <input
                                            list="skill-options"
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="Add a skill (e.g. React, Python)"
                                            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <datalist id="skill-options">
                                            {allSkills.map(skill => (
                                                <option key={skill} value={skill} />
                                            ))}
                                        </datalist>
                                        <button
                                            onClick={handleAddSkill}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-md transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium text-gray-700">Sort By</h3>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => handleSort('name')}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    sortBy === 'name' 
                                                        ? 'bg-purple-100 text-purple-800 font-medium'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </button>
                                            
                                            <button
                                                onClick={() => handleSort('experience')}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    sortBy === 'experience'
                                                        ? 'bg-purple-100 text-purple-800 font-medium'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                Experience {sortBy === 'experience' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </button>
                                            
                                            <button
                                                onClick={() => handleSort('techStack')}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    sortBy === 'techStack'
                                                        ? 'bg-purple-100 text-purple-800 font-medium'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                Tech Stack {sortBy === 'techStack' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Results Information */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-700">
                        Found <span className="font-semibold">{filteredAndSortedProfiles.length}</span> profiles
                    </p>
                </div>
                
                {/* Profile Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedProfiles.map(profile => (
                        <Link 
                            to={`/profile/${profile.userId}`} 
                            key={profile.id}
                            className="group"
                        >
                            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full transition-all duration-300 hover:shadow-lg border border-gray-100 group-hover:border-purple-200">
                                {/* Colored Header Based on Experience Level */}
                                <div className={`h-2 ${
                                    profile.experience === 'Expert' ? 'bg-purple-600' :
                                    profile.experience === 'Advanced' ? 'bg-indigo-600' :
                                    profile.experience === 'Intermediate' ? 'bg-blue-500' :
                                    'bg-green-500'
                                }`}></div>
                                
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                                                {profile.profilePicture ? (
                                                    <img 
                                                        src={profile.profilePicture} 
                                                        alt={`${profile.name}'s avatar`} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                                                {profile.name}
                                            </h2>
                                            <p className="text-sm text-purple-600 font-medium">
                                                {profile.role || 'Developer'}
                                            </p>
                                            <div className="flex items-center mt-1 text-sm text-gray-500">
                                                <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span>{profile.location || 'Remote'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-500">Experience</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                profile.experience === 'Expert' ? 'bg-purple-100 text-purple-800' :
                                                profile.experience === 'Advanced' ? 'bg-indigo-100 text-indigo-800' :
                                                profile.experience === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {profile.experience || 'Beginner'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {profile.techStack?.slice(0, 3).map((tech, index) => (
                                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {tech}
                                                </span>
                                            ))}
                                            {profile.techStack?.length > 3 && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    +{profile.techStack.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {filteredAndSortedProfiles.length === 0 && (
                    <div className="bg-white rounded-lg p-8 text-center shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" 
                            />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No profiles found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Try adjusting your search or filter criteria to find what you're looking for.
                        </p>
                        {(filterSkills.length > 0 || filterRole || filterExperience || filterLocation || filterMode) && (
                            <button
                                onClick={() => {
                                    setFilterSkills([]);
                                    setFilterRole('');
                                    setFilterExperience('');
                                    setFilterLocation('');
                                    setFilterMode('');
                                    setSearchTerm('');
                                }}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilesPage; 