import { Outlet, Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useIsMobile } from "../../hooks/use-mobile";
import {
  Plus,
  Home,
  Megaphone,
  Calculator,
  Users,
  FileQuestion,
  Menu,
  X,
} from "lucide-react";
import Loading from "~/components/Loading";

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Default to collapsed on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  if (isLoading) {
    return <Loading />;
  }

  // For now, we'll allow any authenticated user to access admin
  // In a real app, you'd check for admin role
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to access the admin panel.
          </p>
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Home,
      exact: true,
    },
    {
      href: "/admin/announcements",
      label: "Announcements",
      icon: Megaphone,
      exact: false,
    },
    {
      href: "/admin/courses",
      label: "Courses",
      icon: FileQuestion,
      exact: false,
    },
    {
      href: "/admin/gen",
      label: "Quiz Generation",
      icon: Calculator,
      exact: false,
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: Users,
      exact: false,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {user.name}
              </p>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-accent rounded-md transition-colors ml-auto"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <Icon size={18} />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-accent transition-colors"
            title={!isOpen ? "Back to Main Site" : undefined}
          >
            {isOpen ? "← Back to Main Site" : <Plus size={18} />}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
