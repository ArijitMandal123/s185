import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

function EditProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [role, setRole] = useState('');
    const [techStack, setTechStack] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [location, setLocation] = useState('');
    const [timezone, setTimezone] = useState('');
    const [experience, setExperience] = useState('');
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [portfolio, setPortfolio] = useState('');
    const [mode, setMode] = useState('');
    const [availability, setAvailability] = useState('');
    const [communicationStyle, setCommunicationStyle] = useState('');
    const [teamSize, setTeamSize] = useState('');
    const [projectInterests, setProjectInterests] = useState([]);

    // Check authorization
    useEffect(() => {
        if (!currentUser) {
            setError('You must be logged in to edit a profile.');
            navigate('/login');
            return;
        }

        if (currentUser.uid !== userId) {
            setError('You can only edit your own profile.');
            navigate(`/profile/${userId}`);
            return;
        }
    }, [currentUser, userId, navigate]);

    // Fetch existing profile data
    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                const docRef = doc(db, 'users', userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const profileData = docSnap.data();
                    setProfile(profileData);
                    
                    // Initialize form with existing data
                    setName(profileData.name || '');
                    setEmail(profileData.email || '');
                    setBio(profileData.bio || '');
                    setRole(profileData.role || '');
                    setTechStack(profileData.techStack || []);
                    setLanguages(profileData.languages || []);
                    setLocation(profileData.location || '');
                    setTimezone(profileData.timezone || '');
                    setExperience(profileData.experience || '');
                    setGithub(profileData.github || '');
                    setLinkedin(profileData.linkedin || '');
                    setPortfolio(profileData.portfolio || '');
                    setMode(profileData.mode || '');
                    setAvailability(profileData.availability || '');
                    setCommunicationStyle(profileData.communicationStyle || '');
                    setTeamSize(profileData.teamSize || '');
                    setProjectInterests(profileData.projectInterests || []);
                } else {
                    setError('Profile not found');
                    navigate('/');
                }
            } catch (err) {
                setError('Error fetching profile: ' + err.message);
            } finally {
                setLoading(false);
            }
        }

        if (currentUser && currentUser.uid === userId) {
            fetchProfile();
        }
    }, [userId, currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            setError('You must be logged in to update your profile.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const userDocRef = doc(db, 'users', userId);
            
            // Prepare the data to update
            const updatedData = {
                name,
                email,
                bio,
                role,
                techStack,
                languages,
                location,
                timezone,
                experience,
                github,
                linkedin,
                portfolio,
                mode,
                availability,
                communicationStyle,
                teamSize,
                projectInterests,
                updatedAt: new Date().toISOString()
            };

            // Update the document in Firestore
            await updateDoc(userDocRef, updatedData);
            
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                navigate(`/profile/${userId}`);
            }, 2000);

        } catch (err) {
            setError('Failed to update profile: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Convert comma-separated string to array for multi-select fields
    const handleArrayInputChange = (setter, value) => {
        // If it's already an array, convert to string for display in input
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        
        // If user is typing, convert the string to array for storage
        const array = value.split(',').map(item => item.trim()).filter(item => item !== '');
        setter(array);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#261FB3]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
                    <div className="px-8 py-6 bg-gradient-to-r from-[#261FB3] to-[#574EE2] text-white">
                        <h1 className="text-2xl font-bold">Edit Your Profile</h1>
                        <p className="mt-1 text-sm opacity-80">Update your information and preferences</p>
                    </div>

                    {error && (
                        <div className="mx-8 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mx-8 mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="space-y-8">
                            {/* Basic Information Section */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-[#0C0950] border-b border-gray-100 pb-2">
                                    Basic Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full h-24 focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                        placeholder="Tell others about yourself..."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Role *
                                        </label>
                                        <select
                                            id="role"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            <option value="Frontend Developer">Frontend Developer</option>
                                            <option value="Backend Developer">Backend Developer</option>
                                            <option value="Full Stack Developer">Full Stack Developer</option>
                                            <option value="UI/UX Designer">UI/UX Designer</option>
                                            <option value="Product Manager">Product Manager</option>
                                            <option value="Data Scientist">Data Scientist</option>
                                            <option value="DevOps Engineer">DevOps Engineer</option>
                                            <option value="QA Engineer">QA Engineer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                                            Experience Level *
                                        </label>
                                        <select
                                            id="experience"
                                            value={experience}
                                            onChange={(e) => setExperience(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Experience</option>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="Expert">Expert</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Skills Section */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-[#0C0950] border-b border-gray-100 pb-2">
                                    Technical Skills
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-1">
                                            Tech Stack (comma separated) *
                                        </label>
                                        <input
                                            type="text"
                                            id="techStack"
                                            value={Array.isArray(techStack) ? techStack.join(', ') : techStack}
                                            onChange={(e) => handleArrayInputChange(setTechStack, e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            placeholder="React, Node.js, Express, MongoDB"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-1">
                                            Programming Languages (comma separated) *
                                        </label>
                                        <input
                                            type="text"
                                            id="languages"
                                            value={Array.isArray(languages) ? languages.join(', ') : languages}
                                            onChange={(e) => handleArrayInputChange(setLanguages, e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            placeholder="JavaScript, Python, Java"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location & Availability */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-[#0C0950] border-b border-gray-100 pb-2">
                                    Location & Availability
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            id="location"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            placeholder="City, Country"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Timezone *
                                        </label>
                                        <input
                                            type="text"
                                            id="timezone"
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            placeholder="GMT+1, EST, etc."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <div>
                                        <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
                                            Work Mode *
                                        </label>
                                        <select
                                            id="mode"
                                            value={mode}
                                            onChange={(e) => setMode(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Mode</option>
                                            <option value="Remote">Remote</option>
                                            <option value="In-person">In-person</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                                            Availability *
                                        </label>
                                        <select
                                            id="availability"
                                            value={availability}
                                            onChange={(e) => setAvailability(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Availability</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Weekends only">Weekends only</option>
                                            <option value="Evenings only">Evenings only</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Social & Portfolio Links */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-[#0C0950] border-b border-gray-100 pb-2">
                                    Social & Portfolio Links
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                                            GitHub URL
                                        </label>
                                        <input
                                            type="url"
                                            id="github"
                                            value={github}
                                            onChange={(e) => setGithub(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            placeholder="https://github.com/username"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                                            LinkedIn URL
                                        </label>
                                        <input
                                            type="url"
                                            id="linkedin"
                                            value={linkedin}
                                            onChange={(e) => setLinkedin(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
                                            Portfolio URL
                                        </label>
                                        <input
                                            type="url"
                                            id="portfolio"
                                            value={portfolio}
                                            onChange={(e) => setPortfolio(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Project Preferences */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-[#0C0950] border-b border-gray-100 pb-2">
                                    Project Preferences
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="projectInterests" className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Interests (comma separated) *
                                        </label>
                                        <input
                                            type="text"
                                            id="projectInterests"
                                            value={Array.isArray(projectInterests) ? projectInterests.join(', ') : projectInterests}
                                            onChange={(e) => handleArrayInputChange(setProjectInterests, e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            placeholder="AI, Web Apps, Mobile, Blockchain"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">
                                            Preferred Team Size *
                                        </label>
                                        <select
                                            id="teamSize"
                                            value={teamSize}
                                            onChange={(e) => setTeamSize(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Team Size</option>
                                            <option value="Solo">Solo</option>
                                            <option value="Small (2-3)">Small (2-3)</option>
                                            <option value="Medium (4-6)">Medium (4-6)</option>
                                            <option value="Large (7+)">Large (7+)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="communicationStyle" className="block text-sm font-medium text-gray-700 mb-1">
                                            Communication Style *
                                        </label>
                                        <select
                                            id="communicationStyle"
                                            value={communicationStyle}
                                            onChange={(e) => setCommunicationStyle(e.target.value)}
                                            className="shadow-sm border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Style</option>
                                            <option value="Daily check-ins">Daily check-ins</option>
                                            <option value="Weekly sync-ups">Weekly sync-ups</option>
                                            <option value="Async communication">Async communication</option>
                                            <option value="Regular pair programming">Regular pair programming</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => navigate(`/profile/${userId}`)}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`px-8 py-2 bg-[#261FB3] text-white rounded-lg hover:bg-[#161179] transition-colors shadow-md flex items-center ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditProfilePage; 