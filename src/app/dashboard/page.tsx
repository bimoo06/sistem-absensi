"use client"

import * as React from "react"
import {
    Users,
    UserX,
    UserCheck,
    TrendingUp,
    Calendar,
    Clock,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Bell,
    Check,
    HelpCircle,
    MapPin
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from "recharts"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import {
    getDetailedDashboardStats,
    getAttendanceHistory,
    getWeeklyAttendanceTrend,
    getSystemHistory
} from "@/lib/actions"

export default function DashboardPage() {
    const { isGuru, isAdmin, user } = useAuth()
    const isTeacher = isGuru()
    const isSuperAdmin = isAdmin()
    const router = useRouter()

    const [stats, setStats] = React.useState<any[]>([])
    const [attendanceData, setAttendanceData] = React.useState<any[]>([])
    const [history, setHistory] = React.useState<any[]>([])
    const [systemHistory, setSystemHistory] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [studentStats, setStudentStats] = React.useState<any>(null)

    const [now, setNow] = React.useState(new Date())

    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    React.useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setIsLoading(true)
            const role = user.role || ""
            const uid = user.id || ""

            const [statsRes, trendRes, historyRes, systemRes] = await Promise.all([
                getDetailedDashboardStats(role, uid),
                getWeeklyAttendanceTrend(isTeacher ? user.studyGroup : undefined),
                role === "murid" ? getAttendanceHistory(uid, role, 5) : Promise.resolve({ success: true, data: [] }),
                isSuperAdmin ? getSystemHistory(5) : Promise.resolve({ success: true, data: [] })
            ])

            if (statsRes.success && statsRes.data) {
                if (role === "murid") {
                    setStudentStats(statsRes.data)
                } else {
                    const iconMap: Record<string, any> = {
                        Users, UserCheck, UserX, TrendingUp, CheckCircle2
                    }
                    if (Array.isArray(statsRes.data)) {
                        setStats(statsRes.data.map((s: any) => ({
                            ...s,
                            icon: iconMap[s.icon] || HelpCircle
                        })))
                    }
                }
            }

            if (trendRes.success && trendRes.data) setAttendanceData(trendRes.data)
            if (historyRes.success && historyRes.data) setHistory(historyRes.data)
            if (systemRes.success && systemRes.data) setSystemHistory(systemRes.data)

            setIsLoading(false)
        }

        fetchData()
    }, [user])

    const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\./g, ':') + ' WIB'

    const dateString = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    }).format(now)

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Live Overview</span>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {isSuperAdmin ? "Administrator Dashboard" : isTeacher ? "Pusat Kendali Guru" : "Portal Akademik Anda"}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {isSuperAdmin
                            ? "Kelola sistem, basis data akun pengguna, dan konfigurasi portal."
                            : isTeacher
                                ? "Pantau dan kelola data operasional sekolah hari ini."
                                : "Selamat datang kembali! Tinjau performa dan riwayat kehadiran Anda."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!isTeacher && !isSuperAdmin && (
                        <div className="px-5 h-12 flex items-center gap-3 rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/20 text-sm font-bold border border-white/10 group cursor-default text-center">
                            Siswa Aktif
                        </div>
                    )}
                    <button className="h-12 w-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-brand-500 hover:bg-white/10 transition-all">
                        <Bell className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {isSuperAdmin ? (
                <div className="space-y-8">
                    {/* Admin Stats Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="relative overflow-hidden group border border-white/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-500 shadow-2xl p-8">
                                    <div className={cn("absolute -right-6 -top-6 h-28 w-28 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity", `bg-${stat.color}-500/60`)} />
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className={cn("p-4 rounded-3xl transition-transform group-hover:scale-110 duration-500 shadow-inner border border-white/5", `bg-${stat.color}-500/10`)}>
                                            <stat.icon className={cn("h-6 w-6", `text-${stat.color}-600 dark:text-${stat.color}-400`)} />
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-black px-3 py-1.5 rounded-xl shadow-sm border",
                                            stat.trendType === 'up' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                                                stat.trendType === 'down' ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                                                    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                                        )}>
                                            {stat.trend}
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative z-10">
                                        <div className="text-4xl font-black text-slate-900 dark:text-white leading-none tabular-nums tracking-tight">{stat.value}</div>
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Weekly Trend Chart for Admin */}
                        <div className="relative overflow-hidden border border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-8 group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Statistik Kehadiran Sekolah</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Akumulasi Seluruh Murid (7 Hari Terakhir)</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-brand-500" />
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                            contentStyle={{
                                                backgroundColor: 'rgba(2, 6, 23, 0.8)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '16px',
                                                backdropFilter: 'blur(12px)',
                                                padding: '12px 16px'
                                            }}
                                        />
                                        <Bar dataKey="hadir" fill="#10b981" radius={[12, 12, 12, 12]} barSize={8} />
                                        <Bar dataKey="sakit" fill="#f59e0b" radius={[12, 12, 12, 12]} barSize={8} />
                                        <Bar dataKey="alfa" fill="#f43f5e" radius={[12, 12, 12, 12]} barSize={8} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent System Activity for Admin */}
                        <div className="overflow-hidden border border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Aktivitas Sistem</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Update Log Terbaru</p>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                    Live
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {isLoading ? (
                                    <div className="flex justify-center p-8">
                                        <div className="h-8 w-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                                    </div>
                                ) : systemHistory.length === 0 ? (
                                    <div className="text-center p-8 text-slate-500 font-medium">Belum ada aktivitas tercatat.</div>
                                ) : (
                                    systemHistory.map((item, i) => {
                                        const date = new Date(item.createdAt);
                                        const diffMs = Date.now() - date.getTime();
                                        const diffMins = Math.floor(diffMs / 60000);
                                        const diffHours = Math.floor(diffMins / 60);
                                        const diffDays = Math.floor(diffHours / 24);

                                        let timeAgo = "Baru saja";
                                        if (diffDays > 0) timeAgo = `${diffDays} hari yang lalu`;
                                        else if (diffHours > 0) timeAgo = `${diffHours} jam yang lalu`;
                                        else if (diffMins > 0) timeAgo = `${diffMins} menit yang lalu`;

                                        return (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/item">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 group-hover/item:scale-110 transition-transform">
                                                        <Clock className="h-5 w-5 text-brand-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {item.account?.name || "System"}
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-medium">{item.message}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">{timeAgo}</span>
                                                    <span className="text-[8px] font-bold text-brand-500 opacity-60 uppercase">{item.account?.role || "system"}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                            <div className="p-8 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-brand-600/20 group">
                                <div className="absolute top-0 right-0 -m-20 h-64 w-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative space-y-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20 shadow-inner">
                                        <Users className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black">Manajemen Akun</h3>
                                        <p className="text-brand-100 font-medium">Kelola data login pengguna, tambah guru baru, atau edit akun murid yang bermasalah.</p>
                                    </div>
                                    <button
                                        onClick={() => router.push("/manage-accounts")}
                                        className="h-14 px-8 rounded-2xl bg-white text-brand-600 font-bold hover:bg-slate-50 flex items-center gap-3 transition-colors shadow-xl"
                                    >
                                        Buka Pengaturan Akun
                                        <ArrowUpRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            ) : isTeacher ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="relative overflow-hidden group border border-white/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-500 shadow-2xl">
                                    <div className={cn("absolute -right-6 -top-6 h-28 w-28 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity", stat.bg.replace('/10', '/60'))} />
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-6 relative z-10">
                                            <div className={cn("p-4 rounded-3xl transition-transform group-hover:scale-110 duration-500 shadow-inner border border-white/5", stat.bg)}>
                                                <stat.icon className={cn("h-6 w-6", stat.color.replace('-500', '-600 dark:text-') + stat.color.replace('text-', ''))} />
                                            </div>
                                            <div className={cn("text-[10px] font-black px-3 py-1.5 rounded-xl shadow-sm border",
                                                stat.trendType === 'up' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                                                    stat.trendType === 'down' ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                                                        "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                                            )}>
                                                {stat.trend}
                                            </div>
                                        </div>
                                        <div className="space-y-2 relative z-10">
                                            <div className="text-4xl font-black text-slate-900 dark:text-white leading-none tabular-nums tracking-tight">{stat.value}</div>
                                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid gap-8 lg:grid-cols-7">
                        <div className="lg:col-span-4 relative overflow-hidden rounded-[2.5rem] bg-white/50 dark:bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
                            <div className="absolute top-0 right-0 -m-20 h-80 w-80 bg-brand-500/5 rounded-full blur-[100px]" />
                            <div className="px-8 py-6 border-b border-white/5 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold">Tren Kehadiran Mingguan</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update Otomatis • Real-time</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-brand-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Siswa Hadir</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="h-[360px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={attendanceData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                                            <defs>
                                                <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="rgba(100,116,139,0.5)"
                                                fontSize={12}
                                                fontWeight={700}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={15}
                                            />
                                            <YAxis
                                                stroke="rgba(100,116,139,0.5)"
                                                fontSize={12}
                                                fontWeight={700}
                                                tickLine={false}
                                                axisLine={false}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '16px',
                                                    backdropFilter: 'blur(12px)',
                                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                                    padding: '12px 16px'
                                                }}
                                                cursor={{ stroke: 'rgba(34, 197, 94, 0.2)', strokeWidth: 2 }}
                                                itemStyle={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}
                                                labelStyle={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="hadir"
                                                stroke="#22c55e"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorHadir)"
                                                animationDuration={2000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 relative overflow-hidden rounded-[2.5rem] bg-white/50 dark:bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
                            <div className="absolute bottom-0 left-0 -m-20 h-60 w-60 bg-indigo-500/5 rounded-full blur-[80px]" />
                            <div className="px-8 py-6 border-b border-white/5">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold">Logistik Ketidakhadiran</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alasan Tidak Masuk Sekolah</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="h-[360px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={attendanceData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }} barGap={8}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="rgba(100,116,139,0.5)"
                                                fontSize={12}
                                                fontWeight={700}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={15}
                                            />
                                            <YAxis
                                                stroke="rgba(100,116,139,0.5)"
                                                fontSize={12}
                                                fontWeight={700}
                                                tickLine={false}
                                                axisLine={false}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '16px',
                                                    backdropFilter: 'blur(12px)',
                                                    padding: '12px 16px'
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="top"
                                                align="right"
                                                iconType="circle"
                                                iconSize={6}
                                                wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, opacity: 0.6 }}
                                            />
                                            <Bar dataKey="sakit" fill="#f59e0b" radius={[12, 12, 12, 12]} barSize={8} />
                                            <Bar dataKey="izin" fill="#3b82f6" radius={[12, 12, 12, 12]} barSize={8} />
                                            <Bar dataKey="alfa" fill="#f43f5e" radius={[12, 12, 12, 12]} barSize={8} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid lg:grid-cols-7 gap-8 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 space-y-6"
                    >
                        {/* Info Card */}
                        <div className="p-8 bg-white/50 dark:bg-white/5 border border-white/10 backdrop-blur-3xl overflow-hidden relative group rounded-[2.5rem] shadow-2xl">
                            <div className="absolute top-0 right-0 -m-8 h-32 w-32 bg-brand-600/10 rounded-full blur-[60px]" />

                            <div className="relative space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[9px] font-black text-brand-500 uppercase tracking-widest">
                                        Siswa Aktif
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-bold tabular-nums text-xs">
                                        <Clock className="h-3 w-3" />
                                        <span>{timeString}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white capitalize">{dateString}</h3>
                                    <p className="text-sm font-bold text-slate-500">Tahun Akademik 2025/2026</p>
                                </div>

                                <button
                                    onClick={() => router.push("/attendance/history")}
                                    className="w-full flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-white/10 active:scale-95 group relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                            <Calendar className="h-6 w-6 text-brand-500" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Lihat Detail</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">Riwayat Absensi</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-500 opacity-40 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Statistik Ringkas */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-brand-600 text-white relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
                            <div className="absolute top-0 right-0 -m-4 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Statistik Anda</p>
                                    <h5 className="text-3xl font-black mb-0.5">{studentStats?.attendanceRate || "0%"}</h5>
                                    <p className="text-xs font-bold opacity-80">Kehadiran Selama Ini</p>
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        {/* Riwayat Absensi Terakhir */}
                        <div className="overflow-hidden border border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold">Riwayat Absensi Terakhir</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data 5 Hari Sekolah Terakhir</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push("/attendance/history")}
                                    className="text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-400"
                                >
                                    Lihat Semua
                                </Button>
                            </div>
                            <div className="p-4">
                                <div className="space-y-3">
                                    {isLoading ? (
                                        <div className="flex justify-center p-8">
                                            <div className="h-8 w-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="text-center p-8 text-slate-500 font-medium">Belum ada riwayat aktivitas.</div>
                                    ) : (
                                        history.map((entry: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-2xl flex items-center justify-center border",
                                                        entry.status === 'Hadir' ? "bg-emerald-500/10 border-emerald-500/20" :
                                                            entry.status === 'Sakit' ? "bg-amber-500/10 border-amber-500/20" :
                                                                "bg-blue-500/10 border-blue-500/20"
                                                    )}>
                                                        {entry.status === 'Hadir' ? <UserCheck className={cn("h-5 w-5 text-emerald-500")} /> :
                                                            entry.status === 'Sakit' ? <Clock className={cn("h-5 w-5 text-amber-500")} /> :
                                                                <Calendar className={cn("h-5 w-5 text-blue-500")} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date(entry.date))}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{!entry.time || entry.time === '-' ? 'Tanpa Keterangan Waktu' : `Masuk pukul ${entry.time}`}</p>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                    entry.status === 'Hadir' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                                                        entry.status === 'Sakit' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                                                            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                                )}>
                                                    {entry.status}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tip/Info box */}
                        <div className="p-6 rounded-3xl bg-brand-500/5 border border-brand-500/10 flex items-start gap-4">
                            <div className="h-8 w-8 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                                <HelpCircle className="h-4 w-4 text-brand-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Informasi</p>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">Absensi Anda dicatat oleh guru pengajar. Anda dapat melihat riwayat kehadiran di halaman <span className="text-slate-900 dark:text-white font-bold">Riwayat Absensi</span>.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
