"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  CheckSquare,
  Menu,
  FileSpreadsheet,
  ExternalLink,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserButton } from "@/components/auth/user-button";
import { GlobalSearch } from "./global-search";
import { useLocalStorage } from "@/lib/use-local-storage";
import { useAuth } from "@/providers/auth-provider";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Customers", href: "/customers", icon: Building2 },
  { name: "Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const spreadsheetId = useLocalStorage("crm_spreadsheet_id");
  const spreadsheetName = useLocalStorage("crm_spreadsheet_name");

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-background px-4 shadow-sm lg:px-8">
      {/* Mobile hamburger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
            <div className="flex h-16 items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xl font-bold italic tracking-tight"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutGrid className="h-5 w-5" />
                SalesCRM
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <item.icon
                        className="h-5 w-5 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link
        href="/dashboard"
        className="mr-8 flex items-center gap-2 text-xl font-bold italic tracking-tight shrink-0"
      >
        <LayoutGrid className="h-5 w-5" />
        SalesCRM
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-x-1 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-x-1.5 px-3 py-2 text-sm font-medium transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right side utilities */}
      <div className="flex items-center gap-x-3 lg:gap-x-4 ml-auto shrink-0">
        {isAuthenticated && (
          <>
            <GlobalSearch />

            <div className="hidden md:block h-6 w-px bg-border" />

            {spreadsheetId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-x-1 px-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Active Sheet
                      </p>
                      <p className="text-sm font-medium truncate">
                        {spreadsheetName || "Unnamed Sheet"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Sheets
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/select-sheet")}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Change Sheet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-x-1 px-2"
                onClick={() => router.push("/select-sheet")}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}

            <UserButton />
          </>
        )}
      </div>
    </header>
  );
}
