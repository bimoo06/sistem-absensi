"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    LogOut,
    User,
    ChevronLeft,
    Settings,
    UserCog
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["guru", "murid", "admin"] },
    { title: "Students", href: "/students", icon: Users, roles: ["guru"] },
    { title: "Attendance", href: "/attendance", icon: CalendarCheck, roles: ["guru", "murid"] },
    { title: "Riwayat Absensi", href: "/attendance/history", icon: CalendarCheck, roles: ["guru", "admin"] },
    { title: "Kelola Akun", href: "/manage-accounts", icon: UserCog, roles: ["admin"] },
]

interface SidebarProps {
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const role = user?.role
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)

    const filteredLinks = navItems.filter(item => item.roles.includes(role || "murid"))
    const userRole = role === "admin" ? "Administrator" : role === "guru" ? "Guru / Pengajar" : "Murid / Siswa"

    const handleLogout = () => {
        logout()
        window.location.href = "/login"
    }

    return (
        <>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
                    collapsed ? "w-24" : "w-72"
                )}
            >
                <div className="h-full flex flex-col bg-slate-950 dark:bg-[#050507]/80 backdrop-blur-3xl border-r border-white/5 shadow-[20px_0_40px_rgba(0,0,0,0.2)]">
                    {/* Branding Area */}
                    <div className={cn(
                        "h-20 flex items-center border-b border-white/5",
                        collapsed ? "justify-center px-0" : "px-8"
                    )}>
                        <Link href="/dashboard" className={cn("flex items-center group", !collapsed && "gap-4")}>
                            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-brand-600/40 p-1 overflow-hidden border border-white/10 shadow-lg">
                                <Image src="/logo-pgri.jpg" alt="PGRI Logo" width={40} height={40} className="object-contain" />
                            </div>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col"
                                >
                                    <span className="text-xl font-bold tracking-tight text-white">Portal Absensi</span>
                                    <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-slate-500 leading-none mt-1">TKS PGRI 05 KLABANG</span>
                                </motion.div>
                            )}
                        </Link>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
                        <div className={cn("px-4 mb-4 flex flex-col items-center", !collapsed && "items-start")}>
                            <p className={cn("text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]", collapsed && "text-center")}>
                                {collapsed ? (
                                    <>
                                        <span>Menu</span>
                                        <br />
                                        <span>Utama</span>
                                    </>
                                ) : (
                                    "Menu Utama"
                                )}
                            </p>
                        </div>
                        {filteredLinks.map((link) => {
                            const active = pathname === link.href
                            const Icon = link.icon
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative group flex items-center rounded-2xl transition-all duration-300 py-4",
                                        collapsed ? "justify-center px-0" : "gap-4 px-4",
                                        active
                                            ? "text-white"
                                            : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="active-nav-glow"
                                            className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <div className={cn(
                                        "relative flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-300",
                                        active
                                            ? "bg-brand-500 text-white shadow-[0_0_20px_rgba(var(--brand-500),0.3)]"
                                            : "bg-white/0 text-slate-500 dark:text-slate-400 group-hover:text-brand-400 dark:group-hover:text-brand-300 group-hover:scale-110"
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    {!collapsed && (
                                        <span className={cn(
                                            "font-bold text-sm tracking-wide transition-all",
                                            active ? "translate-x-0" : "group-hover:translate-x-1"
                                        )}>
                                            {link.title}
                                        </span>
                                    )}
                                    {active && !collapsed && (
                                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500 shadow-[0_0_10px_#22c55e]" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer Area */}
                    <div className="mt-auto p-4 space-y-6">
                        {!collapsed && (
                            <div className="px-5 py-5 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 shadow-xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-white/5 shadow-inner">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Status Anda</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white leading-tight">{userRole}</span>
                                            {role === "murid" && (
                                                <span className="text-[10px] font-medium text-brand-400 uppercase tracking-wider">
                                                    {user?.studyGroup || "Belum ada Rombel"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-green-500 flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Aktif Sekarang
                                    </span>
                                    <button className="text-slate-500 hover:text-white transition-colors">
                                        <Settings className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className={cn(
                                "group w-full flex items-center rounded-2xl transition-all duration-300 py-4",
                                collapsed ? "justify-center px-0" : "gap-4 px-4",
                                "hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-transparent"
                            )}
                        >
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-900 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-red-500/20">
                                <LogOut className="h-5 w-5" />
                            </div>
                            {!collapsed && (
                                <span className="font-bold text-sm tracking-wide">Keluar Sistem</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutConfirm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm rounded-[2.5rem] bg-slate-900 border border-white/10 p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 -m-8 h-32 w-32 bg-red-500/10 rounded-full blur-3xl" />

                            <div className="relative text-center space-y-6">
                                <div className="mx-auto h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                                    <LogOut className="h-10 w-10 text-red-500" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white">Konfirmasi Keluar</h3>
                                    <p className="text-slate-400 font-medium">Apakah Anda yakin ingin keluar dari sistem Absensi?</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="h-14 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all active:scale-95"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="h-14 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                    >
                                        Ya, Keluar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
