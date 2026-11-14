import { Link, NavLink } from "react-router";
import { ArrowUpRight, BookOpen, Github, Activity } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "./ThemeToggle";
import { MobileSidebar } from "./MobileSidebar";
import { useAuth } from "./AuthProvider";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="relative z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-10">
          <div className="lg:hidden">
            <MobileSidebar />
          </div>
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
            aria-label="HSGS home"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              HSGS<span className="text-primary">.</span>
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 lg:flex"
          >
            {[
              { to: "/", label: "Home" },
              { to: "/problems", label: "Problems" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
                }
              >
                {label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
                }
              >
                Workspace
              </NavLink>
            )}
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-muted-foreground">
                    About
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-72 space-y-1 p-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="https://github.com/vuthanhtrung2010/hsgs-hackathon"
                            className="flex flex-row items-center gap-3 p-3"
                          >
                            <Github
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                            <div>
                              <span className="font-medium">GitHub</span>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Explore the project and source code
                              </p>
                            </div>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            href="https://status.trunghsgs.edu.vn"
                            className="flex flex-row items-center gap-3 p-3"
                          >
                            <Activity
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                            <div>
                              <span className="font-medium">System status</span>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Service availability and uptime
                              </p>
                            </div>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ModeToggle />
          <span
            className="mx-1 hidden h-5 w-px bg-border sm:block"
            aria-hidden="true"
          />
          {!user ? (
            <Button asChild>
              <Link to="/login">
                Log in{" "}
                <ArrowUpRight className="hidden sm:block" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <>
              <span
                className="hidden max-w-40 truncate text-sm font-medium sm:block"
                title={user.name || user.email}
              >
                {user.name || user.email}
              </span>
              <Button variant="outline" onClick={() => logout()}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
