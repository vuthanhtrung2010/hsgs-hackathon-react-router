import { Outlet, Link, useLocation } from "react-router";
import { useAuth } from "../../components/AuthProvider";
import {
  Plus,
  Home,
  Megaphone,
  Calculator,
  Users,
  FileQuestion,
} from "lucide-react";

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

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
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome, {user.name}
          </p>
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
                  >
                    <Icon size={18} />
                    {item.label}
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
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Main Site
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
