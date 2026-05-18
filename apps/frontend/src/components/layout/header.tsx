"use client";

import { MobileSidebar } from "./sidebar";
import { UserButton } from "@/components/auth/user-button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <MobileSidebar />
      <div className="flex flex-1 items-center justify-between gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
