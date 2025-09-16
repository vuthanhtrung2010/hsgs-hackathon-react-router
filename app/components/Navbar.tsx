import * as React from "react";
import { Link, useLocation } from "react-router";
import { ActivityIcon } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";

import { ModeToggle } from "./ThemeToggle";
import { MobileSidebar } from "./MobileSidebar";
import { useAuth } from "./AuthProvider";

function ListItem({
  title,
  children,
  href,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className="flex items-start gap-2 rounded-md p-3 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {icon && <span className="mt-1">{icon}</span>}
          <div>
            <div className="text-sm font-medium leading-none">{title}</div>
            {children && (
              <p className="text-muted-foreground text-xs leading-snug mt-1">
                {children}
              </p>
            )}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuth();

  // Indicator state for animated highlight
  const navListRef = React.useRef<HTMLUListElement | null>(null);
  const [indicator, setIndicator] = React.useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const updateIndicator = (el: HTMLElement | null) => {
    if (!el || !navListRef.current) {
      setIndicator((s) => ({ ...s, opacity: 0 }));
      return;
    }
    const container = navListRef.current as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    // account for horizontal scroll inside the container
    const left = Math.round(rect.left - containerRect.left + container.scrollLeft);
    const width = Math.round(rect.width);
    setIndicator({ left, width, opacity: 1 });
  };

  const computeActiveLink = () => {
    if (!navListRef.current) return null;
    const links = Array.from(navListRef.current.querySelectorAll<HTMLElement>('[data-nav]'));
    if (links.length === 0) return null;

    // pick the best matching href (longest prefix match)
    // special-case root ('/') so it only matches exactly
    let best: { el: HTMLElement | null; len: number } = { el: null, len: 0 };
    links.forEach((el) => {
      const href = el.getAttribute('data-href') || '';
      if (!href) return;
      if (href === '/') {
        // only match root exactly
        if (pathname === '/') {
          if (href.length > best.len) best = { el, len: href.length };
        }
      } else {
        if (pathname === href || pathname?.startsWith(href)) {
          if (href.length > best.len) best = { el, len: href.length };
        }
      }
    });
    if (best.el) return best.el;
    // fallback: if we have a link with href exactly matching pathname
    // otherwise return null (don't default to the first link) so we don't
    // highlight Home on unrelated routes like /accounts/security
    return links.find((el) => el.getAttribute('data-href') === pathname) || null;
  };

  React.useLayoutEffect(() => {
    // update on path change
    const active = computeActiveLink();
    // use rAF to avoid layout thrashing
    const raf = requestAnimationFrame(() => updateIndicator(active as HTMLElement | null));

    // update on resize
    const onResize = () => {
      const active2 = computeActiveLink();
      requestAnimationFrame(() => updateIndicator(active2 as HTMLElement | null));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const getGravatarURL = (email: string) => {
    const hash = btoa(email.toLowerCase().trim()).replace(/[^a-z0-9]/g, '');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=32`;
  };

  return (
    <div className="w-full bg-zinc-900 border-b border-zinc-800 relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile Sidebar Trigger */}
          <div className="px-3 py-4 lg:hidden">
            <MobileSidebar />
          </div>

          {/* Logo - hidden on mobile */}
          <div className="hidden lg:block px-6 py-4">
            <Link
              to="/"
              className="text-zinc-100 text-xl font-bold hover:text-zinc-300 transition-colors"
            >
              HSGS
            </Link>
          </div>

          {/* Separator - hidden on mobile */}
          <div className="hidden lg:block h-8 w-px bg-zinc-500 mx-6"></div>

          {/* Navigation Menu - hidden on mobile */}
          <NavigationMenu
            viewport={false}
            className="hidden lg:flex bg-zinc-900 text-zinc-100"
          >
            <NavigationMenuList
              ref={navListRef}
              className="bg-zinc-900 text-zinc-100 justify-start relative isolate z-0"
            >
              {/* Animated indicator - rounded rectangle behind links */}
              <div
                aria-hidden
                className="absolute top-1/2 -translate-y-1/2 h-9 rounded-md bg-white/10 dark:bg-white/10 transition-all duration-200 ease-out pointer-events-none shadow-sm"
                style={{
                  transform: `translate3d(${indicator.left}px, 0, 0)`,
                  width: `${indicator.width}px`,
                  opacity: indicator.opacity,
                  zIndex: 10, // sit above background but behind link content
                }}
              />

              {/* Home */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={`${navigationMenuTriggerStyle()} !bg-transparent !text-zinc-100 !hover:bg-transparent hover:text-zinc-100 focus:!text-zinc-100 data-[active=true]:!bg-transparent data-[active=true]:!hover:bg-transparent data-[active=true]:!text-zinc-100 data-[state=open]:!text-zinc-100`}
                >
                  <Link
                    to="/"
                    data-nav
                    data-href="/"
                    className="relative inline-block px-3 py-2 z-30 !text-zinc-100"
                    onMouseEnter={(e) => updateIndicator(e.currentTarget as HTMLElement)}
                    onMouseLeave={() => updateIndicator(computeActiveLink() as HTMLElement | null)}
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Problems */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={`${navigationMenuTriggerStyle()} !bg-transparent !text-zinc-100 !hover:bg-transparent hover:text-zinc-100 focus:!text-zinc-100 data-[active=true]:!bg-transparent data-[active=true]:!hover:bg-transparent data-[active=true]:!text-zinc-100 data-[state=open]:!text-zinc-100`}
                >
                  <Link
                    to="/problems"
                    data-nav
                    data-href="/problems"
                    className="relative inline-block px-3 py-2 z-30 !text-zinc-100"
                    onMouseEnter={(e) => updateIndicator(e.currentTarget as HTMLElement)}
                    onMouseLeave={() => updateIndicator(computeActiveLink() as HTMLElement | null)}
                  >
                    Problems
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Users */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={`${navigationMenuTriggerStyle()} !bg-transparent !text-zinc-100 !hover:bg-transparent hover:text-zinc-100 focus:!text-zinc-100 data-[active=true]:!bg-transparent data-[active=true]:!hover:bg-transparent data-[active=true]:!text-zinc-100 data-[state=open]:!text-zinc-100`}
                >
                  <Link
                    to="/users"
                    data-nav
                    data-href="/users"
                    className="relative inline-block px-3 py-2 z-30 !text-zinc-100"
                    onMouseEnter={(e) => updateIndicator(e.currentTarget as HTMLElement)}
                    onMouseLeave={() => updateIndicator(computeActiveLink() as HTMLElement | null)}
                  >
                    Users
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* About - with dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 data-[state=open]:bg-zinc-800">
                  About
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] p-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none select-none focus:shadow-md"
                          href="https://github.com/vuthanhtrung2010"
                        >
                          <div className="mt-4 mb-2 text-lg font-bold">
                            About this project
                          </div>
                          <p className="text-muted-foreground text-sm leading-tight">
                            This is a creative project. Idk what to say here.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem
                      href="https://github.com/vuthanhtrung2010/hsgs-hackathon"
                      title="GitHub"
                      icon={
                        <FontAwesomeIcon icon={faGithub} className="h-4 w-4" />
                      }
                    >
                      Source code and contributions.
                    </ListItem>
                    <ListItem
                      href="https://status.trunghsgs.edu.vn"
                      title="Status"
                      icon={<ActivityIcon size={16} />}
                    >
                      System status and uptime.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-2 px-3 lg:px-6">
          {!user ? (
            <Link
              to="/login"
              className="px-3 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 transition-colors text-sm font-medium"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {user.email && (
                <img
                  src={getGravatarURL(user.email)}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-zinc-400"
                />
              )}
              <span className="text-zinc-100 text-sm font-medium">
                {user.name || user.email}
              </span>
              <button
                onClick={() => logout()}
                className="px-3 py-2 bg-zinc-700 text-zinc-100 rounded-md hover:bg-zinc-600 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
          <div className="ml-1 lg:ml-0">
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
