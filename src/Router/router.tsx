import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { RouteLoader } from "../components/common/RouteLoader";

const App = lazy(() => import("../App"));
const NotFound = lazy(() => import("../pages/404"));
const Contact = lazy(() => import("../pages/Contact"));
const Features = lazy(() => import("../pages/Features"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const About = lazy(() => import("../pages/About"));
const SignIn = lazy(() => import("../pages/SignIn"));
const SignUp = lazy(() => import("../pages/SignUp"));
const StudentDashboard = lazy(() => import("../pages/student/StudentDashboard"));
const ProgramDetail = lazy(() => import("../pages/ProgramDetail"));
const Notifications = lazy(() => import("../pages/student/Notifications"));
const UniversityDashboard = lazy(() => import("../pages/university/UniversityDashboard"));
const ManageAdmissions = lazy(() => import("../pages/university/ManageAdmissions"));
const ViewAllAdmissions = lazy(() => import("../pages/university/ViewAllAdmissions"));
const VerificationCenter = lazy(() => import("../pages/university/VerificationCenter"));
const ChangeLogs = lazy(() => import("../pages/university/ChangeLogs"));
const NotificationsCenter = lazy(() => import("../pages/university/NotificationsCenter"));
const Settings = lazy(() => import("../pages/university/Settings"));
const EditProfile = lazy(() => import("../pages/university/EditProfile"));
const SearchAdmissions = lazy(() => import("../pages/student/SearchAdmissions"));
const ComparePage = lazy(() => import("../pages/student/ComparePage"));
const DeadlinePage = lazy(() => import("../pages/student/DeadlinePage"));
const WatchlistPage = lazy(() => import("../pages/student/WatchlistPage"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminVerificationCenter = lazy(() => import("../pages/admin/AdminVerificationCenter"));
const AdminNotificationsCenter = lazy(() => import("../pages/admin/AdminNotificationsCenter"));
const AdminScraperJobsMonitor = lazy(() => import("../pages/admin/AdminScraperJobsMonitor"));
const AdminChangeLogs = lazy(() => import("../pages/admin/AdminChangeLogs"));
const AdminAnalytics = lazy(() => import("../pages/admin/AdminAnalytics"));
const AdminCreateUniversityRep = lazy(() => import("../pages/admin/AdminCreateUniversityRep"));
const AdminEmailDeliveryLogs = lazy(() => import("../pages/admin/AdminEmailDeliveryLogs"));
const AdminDeadlineSystem = lazy(() => import("../pages/admin/AdminDeadlineSystem"));

const AppRouter = () => {
    return (
        <Suspense fallback={<RouteLoader message="Loading page..." />}>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/features" element={<Features />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/about" element={<About />} />
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
                <Route path="/admin/create-university-rep" element={<ProtectedRoute requiredRole="admin"><AdminCreateUniversityRep /></ProtectedRoute>} />
                <Route path="/admin/email-logs" element={<ProtectedRoute requiredRole="admin"><AdminEmailDeliveryLogs /></ProtectedRoute>} />
                <Route path="/admin/deadline-system" element={<ProtectedRoute requiredRole="admin"><AdminDeadlineSystem /></ProtectedRoute>} />
                <Route path="/program/:id" element={<ProgramDetail />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    )
}

export default AppRouter;