import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateProfilePage from "./pages/CreateProfilePage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage"; // Import LandingPage
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage"; // Import EditProfilePage
import HackathonListingsPage from "./pages/HackathonListingsPage";
import HackathonDetailsPage from "./pages/HackathonDetailsPage";
import AddHackathonPage from "./pages/AddHackathonPage"; // Import AddHackathonPage
import HackathonTeamsPage from "./pages/HackathonTeamsPage";
import ProfilesPage from "./pages/ProfilesPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage"; // Import ProfileSettingsPage
import TeamJoinRequestsPage from "./pages/TeamJoinRequestsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import TeamChat from "./components/chat/TeamChat";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LeaderboardPage from "./pages/LeaderboardPage";
import ResourcesPage from "./pages/ResourcesPage"; // Import ResourcesPage
import AdminPage from "./pages/AdminPage"; // Import AdminPage
import TeamInvitePage from "./pages/TeamInvitePage";
import NotificationBell from "./components/notifications/NotificationBell";

function AppContent() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/"); // Redirect to landing page after logout
    } catch (error) {
      console.error("Failed to logout", error);
      alert("Failed to logout");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-[#261FB3] font-bold text-xl flex items-center"
          >
            <span className="text-[#261FB3] mr-2 font-mono">&lt;/&gt;</span>
            Hackathon Teammate Finder
          </Link>
          
          <div className="flex items-center space-x-6">
            {currentUser ? (
              <>
                <Link
                  to="/hackathons"
                  className="text-gray-700 hover:text-[#261FB3] transition-colors duration-300"
                >
                  Hackathons
                </Link>
                <Link
                  to="/profiles"
                  className="text-gray-700 hover:text-[#261FB3] transition-colors duration-300"
                >
                  Browse Profiles
                </Link>
                <Link
                  to={`/profile/${currentUser.uid}`}
                  className="text-gray-700 hover:text-[#261FB3] transition-colors duration-300"
                >
                  My Profile
                </Link>
                <Link
                  to="/resources"
                  className="text-gray-700 hover:text-[#261FB3] transition-colors duration-300"
                >
                  Resources
                </Link>
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="ml-4 bg-[#261FB3] hover:bg-[#161179] text-white px-4 py-2 rounded transition-colors duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/create-profile"
                  className="text-gray-700 hover:text-[#261FB3] transition-colors duration-300"
                >
                  Create Profile
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-[#261FB3] transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/hackathons"
                  className="text-gray-700 hover:text-[#261FB3] transition-colors duration-300"
                >
                  Hackathons
                </Link>
                <Link
                  to="/about"
                  className="text-gray-700 hover:text-[#261FB3] transition-colors duration-300"
                >
                  About
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={currentUser ? <HomePage /> : <LandingPage />}
        />
        <Route path="/create-profile" element={<CreateProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/edit-profile/:userId" element={currentUser ? <EditProfilePage /> : <LoginPage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/settings"
          element={currentUser ? <ProfileSettingsPage /> : <LoginPage />}
        />
        <Route path="/hackathons" element={<HackathonListingsPage />} />
        <Route
          path="/hackathon/:hackathonId"
          element={<HackathonDetailsPage />}
        />
        <Route
          path="/hackathon/:hackathonId/teams"
          element={<HackathonTeamsPage />}
        />
        <Route path="/team/:teamId" element={<TeamDetailPage />} />
        <Route
          path="/team/:teamId/requests"
          element={<TeamJoinRequestsPage />}
        />
        <Route
          path="/team/:teamId/invite"
          element={<TeamInvitePage />}
        />
        <Route path="/team/:teamId/chat" element={<TeamChat />} />
        <Route
          path="/add-hackathon"
          element={currentUser ? <AddHackathonPage /> : <LoginPage />}
        />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
