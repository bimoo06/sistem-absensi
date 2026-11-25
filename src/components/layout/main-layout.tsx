"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
    const isAuthPage = pathname === "/" || pathname === "/login"

    if (isAuthPage) {
        return <main className="min-h-screen bg-background">{children}</main>
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "lg:pl-24" : "lg:pl-72"
            )}>
                <Header collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
                <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
