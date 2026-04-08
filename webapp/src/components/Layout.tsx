import { NavLink, useLocation } from "react-router-dom";
import {
  Home, Calendar, Lightbulb, Users, User,
  MessageSquare, FolderKanban, BookOpen,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/community", label: "Connect", icon: MessageSquare },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/ai-hub", label: "AI Hub", icon: Lightbulb },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/network", label: "Network", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

// Only show 5 items in mobile bottom nav
const MOBILE_NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/community", label: "Connect", icon: MessageSquare },
  { to: "/network", label: "Network", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-circle">AOE</div>
          <div>
            <div className="sidebar-logo-text">Art of Entrepreneurship</div>
            <div className="sidebar-logo-sub">AFRICA</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`mobile-nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={22} />
                {label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}