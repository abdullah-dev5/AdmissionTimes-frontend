import { Routes, Route } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/404";
import StudentDashboard from "../pages/student/StudentDashboard";
import ProgramDetail from "../pages/ProgramDetail";
import Notifications from "../pages/student/Notifications";
import UniversityDashboard from "../pages/university/UniversityDashboard";
import ManageAdmissions from "../pages/university/ManageAdmissions";
import SearchAdmissions from "../pages/student/SearchAdmissions";
import ComparePage from "../pages/student/ComparePage";
import DeadlinePage from "../pages/student/DeadlinePage";
import WatchlistPage from "../pages/student/WatchlistPage";

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
            <Route path="/program/:id" element={<ProgramDetail />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRouter;