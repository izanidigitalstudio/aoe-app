import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useState } from "react";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import AIHubPage from "./pages/AIHubPage";
import NetworkPage from "./pages/NetworkPage";
import ProfilePage from "./pages/ProfilePage";
import CommunityPage from "./pages/CommunityPage";
import ProjectsPage from "./pages/ProjectsPage";
import ResourcesPage from "./pages/ResourcesPage";
import RegisterPage from "./pages/RegisterPage";

export const DemoContext = {
  isDemo: false,
  setDemo: (_v: boolean) => {},
  exitDemo: () => {},
};

export default function App() {
  const [isDemo, setIsDemo] = useState(false);
  const location = useLocation();

  const ctx = {
    isDemo,
    setDemo: setIsDemo,
    exitDemo: () => setIsDemo(false),
  };

  // Registration page is always public
  if (location.pathname === "/register") {
    return (
      <DemoProvider value={ctx}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </DemoProvider>
    );
  }

  if (isDemo) {
    return (
      <DemoProvider value={ctx}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/ai-hub" element={<AIHubPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </DemoProvider>
    );
  }

  return (
    <DemoProvider value={ctx}>
      <AuthLoading>
        <LoadingScreen />
      </AuthLoading>

      <Unauthenticated>
        <LandingPage onDemoAccess={() => setIsDemo(true)} />
      </Unauthenticated>

      <Authenticated>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/ai-hub" element={<AIHubPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Authenticated>
    </DemoProvider>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", background: "#060D1A",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", background: "#C8932E",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, fontWeight: 900, color: "#000",
      }}>AOE</div>
      <p style={{ color: "#666", fontSize: 13, marginTop: 12 }}>
        Art of Entrepreneurship Africa
      </p>
    </div>
  );
}

// Simple context
import { createContext, useContext, type ReactNode } from "react";
type DemoCtx = { isDemo: boolean; setDemo: (v: boolean) => void; exitDemo: () => void };
const DemoCtxReact = createContext<DemoCtx>({ isDemo: false, setDemo: () => {}, exitDemo: () => {} });
export function useDemoContext() { return useContext(DemoCtxReact); }
function DemoProvider({ value, children }: { value: DemoCtx; children: ReactNode }) {
  return <DemoCtxReact.Provider value={value}>{children}</DemoCtxReact.Provider>;
}