import { Outlet, Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useIsMobile } from "../../hooks/use-mobile";
import {
  Home,
  Megaphone,
  Calculator,
  Users,
  FileQuestion,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Trophy,
  ArrowLeft,
  Layers,
  LockKeyhole,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import Loading from "~/components/Loading";

const sidebarItems = [
  { href: "/admin", label: "Overview", icon: Home, exact: true },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/courses", label: "Courses", icon: FileQuestion },
  { href: "/admin/sub-leaderboards", label: "Sub-Leaderboards", icon: Trophy },
  { href: "/admin/gen", label: "Quiz Generation", icon: Calculator },
  { href: "/admin/users", label: "User Management", icon: Users },
];

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isLoading) return <Loading />;
  if (!user)
    return (
      <div className="flex min-h-[65svh] items-center justify-center px-5 py-12">
        <div className="max-w-sm text-center">
          <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            Your workspace awaits
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sign in to manage your courses, students, and learning materials.
          </p>
          <Button asChild className="mt-6">
            <Link
              to={`/login?callbackUrl=${encodeURIComponent(location.pathname)}`}
            >
              Sign in to continue
            </Link>
          </Button>
        </div>
      </div>
    );

  const navigation = (expanded: boolean) => (
    <nav aria-label="Workspace navigation" className="flex-1 space-y-1 p-3">
      {expanded && (
        <p className="px-3 pb-3 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Manage your classroom
        </p>
      )}
      {sidebarItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? location.pathname === href
          : location.pathname.startsWith(href);
        return (
          <Link
            key={href}
            to={href}
            aria-current={active ? "page" : undefined}
            title={!expanded ? label : undefined}
            aria-label={!expanded ? label : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${expanded ? "" : "justify-center"} ${active ? "bg-secondary font-medium text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {expanded && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="mx-auto flex min-h-[calc(100svh-10rem)] max-w-[1600px] flex-col md:flex-row">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Layers className="size-4 text-primary" aria-hidden="true" />
          Workspace
        </span>
        <Button variant="outline" size="sm" onClick={() => setMobileOpen(true)}>
          <Menu aria-hidden="true" />
          Navigation
        </Button>
      </div>
      <Sheet open={mobileOpen && isMobile} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
          <SheetHeader className="border-b border-border p-6">
            <SheetTitle className="text-lg">Workspace</SheetTitle>
            <SheetDescription className="truncate">
              {user.name || user.email}
            </SheetDescription>
          </SheetHeader>
          {navigation(true)}
        </SheetContent>
      </Sheet>
      <aside
        className={`hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex ${isOpen ? "w-60" : "w-20"}`}
      >
        <div
          className={`flex min-h-24 items-center gap-3 border-b border-border p-4 ${isOpen ? "justify-between" : "justify-center"}`}
        >
          {isOpen && (
            <div className="min-w-0">
              <p className="text-sm font-semibold">Workspace</p>
              <p
                className="mt-1 truncate text-xs text-muted-foreground"
                title={user.name || user.email}
              >
                {user.name || user.email}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="shrink-0 text-muted-foreground"
          >
            {isOpen ? (
              <PanelLeftClose aria-hidden="true" />
            ) : (
              <PanelLeftOpen aria-hidden="true" />
            )}
          </Button>
        </div>
        {navigation(isOpen)}
        <div className="border-t border-border p-3">
          <Link
            to="/"
            title="Back to main site"
            aria-label="Back to main site"
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground ${isOpen ? "" : "justify-center"}`}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            {isOpen && "Back to main site"}
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
