import { Routes, Route, Navigate } from "react-router-dom";
import LenisScroll from "./components/lenis";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ProtectedRoute from "./components/protected-route";

// Landing page sections
import HeroSection from "./sections/hero-section";
import StatsSection from "./sections/stats-section";
import FeaturesSection from "./sections/features-section";
import HowItWorksSection from "./sections/how-it-works-section";
import FaqSection from "./sections/faq-section";
import CtaSection from "./sections/cta-section";

// App pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ScheduleForm from "./pages/ScheduleForm";
import Recommendation from "./pages/Recommendation";
import Profile from "./pages/Profile";

function LandingPage() {
    return (
        <>
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <HowItWorksSection />
            <FaqSection />
            <CtaSection />
        </>
    );
}

export default function App() {
    return (
        <div>
            <LenisScroll />
            <Navbar />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/schedule/new" element={<ProtectedRoute><ScheduleForm /></ProtectedRoute>} />
                <Route path="/recommendation/:scheduleId" element={<ProtectedRoute><Recommendation /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
        </div>
    )
}