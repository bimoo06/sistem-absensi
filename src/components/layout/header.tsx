"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Search, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface HeaderProps {
    collapsed?: boolean
    setCollapsed?: (collapsed: boolean) => void
}

export function Header({ collapsed, setCollapsed }: HeaderProps) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, isAdmin, isGuru } = useAuth()
    const role = user?.role

    const [searchValue, setSearchValue] = React.useState(searchParams.get("q") || "")

    const pageTitle = pathname === "/"
        ? "Beranda"
        : pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchValue.trim()) return

        if (isAdmin()) {
            router.push(`/manage-accounts?q=${encodeURIComponent(searchValue.trim())}`)
        } else if (isGuru()) {
            router.push(`/students?q=${encodeURIComponent(searchValue.trim())}`)
        }
    }

    // Update search value if URL param changes
    React.useEffect(() => {
        setSearchValue(searchParams.get("q") || "")
    }, [searchParams])

    return (
        <header className="sticky top-0 z-[100] flex h-20 shrink-0 items-center gap-x-4 border-b border-white/5 bg-white/80 dark:bg-slate-950/60 backdrop-blur-2xl px-6 sm:gap-x-8 sm:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-8">
                <div className="flex flex-1 items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                        onClick={() => setCollapsed?.(!collapsed)}
                    >
                        <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>

                    <div className="hidden sm:flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-none mb-1 capitalize">{pageTitle}</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portal Absensi</span>
                            <div className="h-1 w-1 rounded-full bg-slate-500" />
                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{role}</span>
                        </div>
                    </div>

                    {role !== "murid" && (
                        <form onSubmit={handleSearch} className="relative flex w-full max-w-sm ml-auto lg:ml-8 group">
                            <Search
                                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-brand-500 transition-colors"
                                aria-hidden="true"
                            />
                            <Input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="Cari siswa, kelas, atau berkas..."
                                className="w-full h-11 pl-11 pr-10 bg-slate-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 rounded-2xl transition-all text-sm"
                            />
                            {searchValue && (
                                <button
                                    type="button"
                                    onClick={() => setSearchValue("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </form>
                    )}
                </div>

                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <div className="hidden lg:block lg:h-8 lg:w-px lg:bg-slate-200 dark:lg:bg-white/5" aria-hidden="true" />

                    <button className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all group">
                        <div className="relative">
                            <img
                                className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 object-cover border border-white/10 ring-4 ring-brand-500/5"
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || role}&backgroundColor=dbeafe`}
                                alt="Profil"
                            />
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
                        </div>
                        <div className="hidden lg:flex flex-col items-start">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Akun Anda</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white capitalize group-hover:text-brand-600 transition-colors">
                                {user?.name || (role === 'guru' ? 'Guru' : 'Siswa')}
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    )
}
