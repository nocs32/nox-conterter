"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";

export function Header() {
    const scrolled = useScrollTop();
    return (
        <div className={cn("z-50 bg-background/20 fixed top-0 flex items-center w-full p-6 dark:bg-[#1F1F1F]/20 backdrop-blur-sm border-b", scrolled && "border-b shadow-sm")}>
            <Logo />
            <div className="md:ml-auto justify-end w-full flex items-center gap-x-2">
                <ModeToggle />
            </div>
        </div>
    )
}
