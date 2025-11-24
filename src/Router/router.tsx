import { Routes, Route } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/404";
import StudentDashboard from "../pages/student/StudentDashboard";
import ProgramDetail from "../pages/ProgramDetail";
import Notifications from "../pages/student/Notifications";
import UniversityDashboard from "../pages/university/UniversityDashboard";
import ManageAdmissions from "../pages/university/ManageAdmissions";
import VerificationCenter from "../pages/university/VerificationCenter";
import ChangeLogs from "../pages/university/ChangeLogs";
import NotificationsCenter from "../pages/university/NotificationsCenter";
import Settings from "../pages/university/Settings";
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

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/search" element={<SearchAdmissions />} />
            <Route path="/student/compare" element={<ComparePage />} />
            <Route path="/student/deadlines" element={<DeadlinePage />} />
            <Route path="/student/watchlist" element={<WatchlistPage />} />
            <Route path="/student/notifications" element={<Notifications />} />
            <Route path="/university/dashboard" element={<UniversityDashboard />} />
            <Route path="/university/manage-admissions" element={<ManageAdmissions />} />
            <Route path="/university/verification-center" element={<VerificationCenter />} />
            <Route path="/university/change-logs" element={<ChangeLogs />} />
            <Route path="/university/notifications-center" element={<NotificationsCenter />} />
            <Route path="/university/settings" element={<Settings />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/verification" element={<AdminVerificationCenter />} />
            <Route path="/admin/notifications" element={<AdminNotificationsCenter />} />
            <Route path="/admin/scraper-logs" element={<AdminScraperJobsMonitor />} />
            <Route path="/admin/change-logs" element={<AdminChangeLogs />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/program/:id" element={<ProgramDetail />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRouter;