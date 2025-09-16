import * as React from "react";
import { Link } from "react-router";
import {
  ActivityIcon,
  Menu,
  Home,
  Code,
  FileText,
  Users,
  ChevronDown,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Problems",
    url: "/problems",
    icon: Code,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
];

const aboutItems = [
  {
    title: "Status",
    url: "https://status.trunghsgs.edu.vn",
    icon: ActivityIcon,
    description: "System status and uptime",
  },
  {
    title: "GitHub",
    url: "https://github.com/Trung-Development/online-judge",
    icon: () => <FontAwesomeIcon icon={faGithub} className="h-4 w-4" />,
    description: "Source code and contributions",
  },
];

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b px-6">
            <Link
              to="/"
              className="text-xl font-bold"
              onClick={() => setOpen(false)}
            >
              HSGS
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto py-4">
            <div className="space-y-4 px-3">
              {/* Main Navigation */}
              <div>
                <h4 className="mb-2 px-4 text-sm font-semibold tracking-tight">
                  Navigation
                </h4>
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* About Section with Collapsible */}
              <div>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-3 py-2 text-sm font-semibold tracking-tight hover:bg-accent"
                    >
                      <span>About</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {aboutItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 rounded-lg px-6 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground"
                        target={
                          item.url.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          item.url.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        <span className="mt-0.5">
                          {React.createElement(item.icon, {
                            className: "h-4 w-4",
                          })}
                        </span>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
