import * as React from "react";
import { Link } from "react-router";
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
            <NavigationMenuList className="bg-zinc-900 text-zinc-100 justify-start">
              {/* Home */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={`${navigationMenuTriggerStyle()} bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100`}
                >
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Problems */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={`${navigationMenuTriggerStyle()} bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100`}
                >
                  <Link to="/problems">Problems</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Users */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={`${navigationMenuTriggerStyle()} bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100`}
                >
                  <Link to="/users">Users</Link>
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
                          href="/about"
                        >
                          <div className="mt-4 mb-2 text-lg font-bold">
                            About HSGS
                          </div>
                          <p className="text-muted-foreground text-sm leading-tight">
                            This is a hackathon project, not done yeet, sad.
                            😭😭😭
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
                      href="/status"
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
        <div className="ml-1 lg:ml-0">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
