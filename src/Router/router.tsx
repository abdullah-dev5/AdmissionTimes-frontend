import { Routes, Route } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/404";
import Contact from "../pages/Contact";
import Features from "../pages/Features";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import StudentDashboard from "../pages/student/StudentDashboard";
import ProgramDetail from "../pages/ProgramDetail";
import Notifications from "../pages/student/Notifications";
import UniversityDashboard from "../pages/university/UniversityDashboard";
import ManageAdmissions from "../pages/university/ManageAdmissions";
import ViewAllAdmissions from "../pages/university/ViewAllAdmissions";
import VerificationCenter from "../pages/university/VerificationCenter";
import ChangeLogs from "../pages/university/ChangeLogs";
import NotificationsCenter from "../pages/university/NotificationsCenter";
import Settings from "../pages/university/Settings";
import EditProfile from "../pages/university/EditProfile";
import SearchAdmissions from "../pages/student/SearchAdmissions";
import ComparePage from "../pages/student/ComparePage";
import DeadlinePage from "../pages/student/DeadlinePage";
import WatchlistPage from "../pages/student/WatchlistPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminVerificationCenter from "../pages/admin/AdminVerificationCenter";
import AdminNotificationsCenter from "../pages/admin/AdminNotificationsCenter";
import AdminScraperJobsMonitor from "../pages/admin/AdminScraperJobsMonitor";
import AdminChangeLogs from "../pages/admin/AdminChangeLogs";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/features" element={<Features />} />
            <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/search" element={<ProtectedRoute requiredRole="student"><SearchAdmissions /></ProtectedRoute>} />
            <Route path="/student/compare" element={<ProtectedRoute requiredRole="student"><ComparePage /></ProtectedRoute>} />
            <Route path="/student/deadlines" element={<ProtectedRoute requiredRole="student"><DeadlinePage /></ProtectedRoute>} />
            <Route path="/student/watchlist" element={<ProtectedRoute requiredRole="student"><WatchlistPage /></ProtectedRoute>} />
            <Route path="/student/notifications" element={<ProtectedRoute requiredRole="student"><Notifications /></ProtectedRoute>} />
            <Route path="/university/dashboard" element={<ProtectedRoute requiredRole="university"><UniversityDashboard /></ProtectedRoute>} />
            <Route path="/university/admissions" element={<ProtectedRoute requiredRole="university"><ViewAllAdmissions /></ProtectedRoute>} />
            <Route path="/university/manage-admissions" element={<ProtectedRoute requiredRole="university"><ManageAdmissions /></ProtectedRoute>} />
            <Route path="/university/verification-center" element={<ProtectedRoute requiredRole="university"><VerificationCenter /></ProtectedRoute>} />
            <Route path="/university/change-logs" element={<ProtectedRoute requiredRole="university"><ChangeLogs /></ProtectedRoute>} />
            <Route path="/university/notifications-center" element={<ProtectedRoute requiredRole="university"><NotificationsCenter /></ProtectedRoute>} />
            <Route path="/university/settings" element={<ProtectedRoute requiredRole="university"><Settings /></ProtectedRoute>} />
            <Route path="/university/settings/edit-profile" element={<ProtectedRoute requiredRole="university"><EditProfile /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/verification" element={<ProtectedRoute requiredRole="admin"><AdminVerificationCenter /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute requiredRole="admin"><AdminNotificationsCenter /></ProtectedRoute>} />
            <Route path="/admin/scraper-logs" element={<ProtectedRoute requiredRole="admin"><AdminScraperJobsMonitor /></ProtectedRoute>} />
            <Route path="/admin/change-logs" element={<ProtectedRoute requiredRole="admin"><AdminChangeLogs /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/program/:id" element={<ProgramDetail />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRouter;