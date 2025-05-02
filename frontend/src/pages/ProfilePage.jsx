import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getProfilePicture, calculateGithubExperienceLevel } from '../utils/githubUtils';
import { useAuth } from '../contexts/AuthContext';
import ReviewProfile from './ReviewProfile';

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [githubExperience, setGithubExperience] = useState(null);
    const [showReview, setShowReview] = useState(false);
    const { userId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Check if the current user is the profile owner
    const isProfileOwner = currentUser && currentUser.uid === userId;

    const handleEditProfile = () => {
        navigate(`/edit-profile/${userId}`);
    };

    useEffect(() => {
        async function fetchProfile() {
            try {
                const docRef = doc(db, 'users', userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const profileData = docSnap.data();
                    setProfile(profileData);
                    
                    // Fetch profile picture
                    const picture = await getProfilePicture(profileData.github, profileData.linkedin);
                    setProfilePicture(picture);
                    
                    // Calculate GitHub experience level if GitHub URL is provided
                    if (profileData.github) {
                        const experience = await calculateGithubExperienceLevel(profileData.github);
                        setGithubExperience(experience);
                    }
                } else {
                    setError('Profile not found');
                }
            } catch (err) {
                setError('Error fetching profile: ' + err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#261FB3]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
                    <p className="font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
                    <p className="font-medium">No profile data available</p>
                </div>
            </div>
        );
    }

    // Extract GitHub username from GitHub URL
    const githubUsername = profile.github ? profile.github.split('/').pop() : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10 transform transition-all hover:shadow-2xl">
                    {/* Cover Photo - Gradient Background */}
                    <div className="h-48 bg-gradient-to-r from-[#261FB3] to-[#574EE2] relative">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                        
                        {/* Profile Picture */}
                        <div className="absolute -bottom-14 left-10 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            {profilePicture ? (
                                <img 
                                    src={profilePicture} 
                                    alt={`${profile.name}'s profile`} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-4xl">?</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="pt-16 pb-6 px-8">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                                <p className="text-[#574EE2] text-lg font-medium mt-1">{profile.role}</p>
                                
                                {/* Social Links */}
                                <div className="flex space-x-4 mt-3">
                                    {profile.github && (
                                        <a 
                                            href={profile.github} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-gray-600 hover:text-[#261FB3] transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                                                <path d="M9 18c-4.51 2-5-2-7-2"></path>
                                            </svg>
                                        </a>
                                    )}
                                    {profile.linkedin && (
                                        <a 
                                            href={profile.linkedin} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-gray-600 hover:text-[#261FB3] transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
                                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                                <rect width="4" height="12" x="2" y="9"></rect>
                                                <circle cx="4" cy="4" r="2"></circle>
                                            </svg>
                                        </a>
                                    )}
                                    <a 
                                        href={`mailto:${profile.email}`}
                                        className="text-gray-600 hover:text-[#261FB3] transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            
                            <div className="mt-4 md:mt-0">
                                {githubExperience && (
                                    <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full ${
                                        githubExperience === 'Pro' ? 'bg-[#FBE4D6] text-[#0C0950]' :
                                        githubExperience === 'Intermediate' ? 'bg-[#161179] text-white' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        GitHub: {githubExperience}
                                    </span>
                                )}
                                {isProfileOwner && (
                                    <button
                                        onClick={handleEditProfile}
                                        className="ml-2 bg-white text-[#261FB3] border border-[#261FB3] px-6 py-2 rounded-lg hover:bg-[#f8f9ff] transition-colors shadow-md hover:shadow-lg"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                        </svg>
                                        Edit Profile
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowReview(!showReview)}
                                    className="ml-2 bg-[#261FB3] text-white px-6 py-2 rounded-lg hover:bg-[#161179] transition-colors shadow-md hover:shadow-lg"
                                >
                                    {showReview ? 'Hide Review' : 'Review Profile'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-gray-100">
                        <div className="text-center p-6 hover:bg-gray-50 transition-colors border-r border-gray-100">
                            <p className="text-3xl font-bold text-[#261FB3]">{profile.points || 0}</p>
                            <p className="text-sm text-gray-500 mt-1">Points</p>
                        </div>
                        <div className="text-center p-6 hover:bg-gray-50 transition-colors border-r border-gray-100">
                            <p className="text-3xl font-bold text-[#261FB3]">{profile.totalProjects || 0}</p>
                            <p className="text-sm text-gray-500 mt-1">Projects</p>
                        </div>
                        <div className="text-center p-6 hover:bg-gray-50 transition-colors border-r border-gray-100">
                            <p className="text-3xl font-bold text-[#261FB3]">{profile.contributions || 0}</p>
                            <p className="text-sm text-gray-500 mt-1">Contributions</p>
                        </div>
                        <div className="text-center p-6 hover:bg-gray-50 transition-colors">
                            <p className="text-3xl font-bold text-[#261FB3]">
                                {new Date(profile.createdAt || new Date()).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Member Since</p>
                        </div>
                    </div>
                </div>

                {/* GitHub Profile Review Section */}
                {showReview && githubUsername && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all">
                        <div className="p-8">
                            <h2 className="text-2xl font-semibold mb-6 text-[#0C0950] border-b border-gray-100 pb-3">GitHub Profile Analysis</h2>
                            <ReviewProfile 
                                username={githubUsername}
                                userId={userId}
                                onPointsUpdate={(points) => {
                                    setProfile(prev => ({ ...prev, points }));
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {/* Technical Skills */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all hover:shadow-xl">
                            <div className="p-8">
                                <h2 className="text-2xl font-semibold mb-6 text-[#0C0950] border-b border-gray-100 pb-3">
                                    <span className="inline-block mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code-2">
                                            <path d="m18 16 4-4-4-4"></path>
                                            <path d="m6 8-4 4 4 4"></path>
                                            <path d="m14.5 4-5 16"></path>
                                        </svg>
                                    </span>
                                    Technical Skills
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-3">Tech Stack</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.techStack?.map((tech, index) => (
                                                <span key={index} className="bg-[#FBE4D6] text-[#0C0950] px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-3">Programming Languages</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.languages?.map((lang, index) => (
                                                <span key={index} className="bg-[#261FB3] text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Interests */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all hover:shadow-xl">
                            <div className="p-8">
                                <h2 className="text-2xl font-semibold mb-6 text-[#0C0950] border-b border-gray-100 pb-3">
                                    <span className="inline-block mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb">
                                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                                            <path d="M9 18h6"></path>
                                            <path d="M10 22h4"></path>
                                        </svg>
                                    </span>
                                    Project Interests
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-2">Preferred Project Categories</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.projectInterests?.map((interest, index) => (
                                                <span key={index} className="bg-[#261FB3] text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-2">Looking For</p>
                                        <p className="font-medium text-[#161179]">{profile.lookingFor || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        {/* Basic Information */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all hover:shadow-xl">
                            <div className="p-8">
                                <h2 className="text-2xl font-semibold mb-6 text-[#0C0950] border-b border-gray-100 pb-3">
                                    <span className="inline-block mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </span>
                                    About
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-1">Email</p>
                                        <p className="font-medium text-[#161179]">{profile.email}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-1">Experience Level</p>
                                        <p className="font-medium text-[#161179]">{profile.experience}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-1">Location</p>
                                        <p className="font-medium text-[#161179] flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin mr-1">
                                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            {profile.location}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-1">Timezone</p>
                                        <p className="font-medium text-[#161179] flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock mr-1">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <polyline points="12 6 12 12 16 14"></polyline>
                                            </svg>
                                            {profile.timezone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Work Preferences */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all hover:shadow-xl">
                            <div className="p-8">
                                <h2 className="text-2xl font-semibold mb-6 text-[#0C0950] border-b border-gray-100 pb-3">
                                    <span className="inline-block mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase">
                                            <rect width="20" height="14" x="2" y="7" rx="2"></rect>
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                        </svg>
                                    </span>
                                    Work Preferences
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-1">Work Mode</p>
                                        <p className="font-medium text-[#161179]">{profile.mode}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-1">Availability</p>
                                        <p className="font-medium text-[#161179]">{profile.availability}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-1">Communication Style</p>
                                        <p className="font-medium text-[#161179]">{profile.communicationStyle}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-gray-600 mb-1">Preferred Team Size</p>
                                        <p className="font-medium text-[#161179]">{profile.teamSize}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage; 