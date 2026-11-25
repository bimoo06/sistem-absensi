"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Check,
    X,
    Clock,
    HelpCircle,
    Save,
    MapPin,
    Calendar,
    Filter,
    Users,
    Search,
    ChevronRight,
    ChevronDown
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getStudentsByGuruRombel, getDetailedDashboardStats, getAttendanceHistory, saveAttendance, getAttendanceByDateAndRombel } from "@/lib/actions"

export default function AttendancePage() {
    const { isGuru, user } = useAuth()
    const isTeacher = isGuru()
    const [students, setStudents] = React.useState<any[]>([])
    const [attendance, setAttendance] = React.useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = React.useState(true)
    const [stats, setStats] = React.useState<any>(null)
    const [history, setHistory] = React.useState<any[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [notes, setNotes] = React.useState<Record<string, string>>({})
    const [isSaving, setIsSaving] = React.useState(false)
    const [toast, setToast] = React.useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
        show: false,
        message: "",
        type: 'success'
    })

    const [selectedClass, setSelectedClass] = React.useState("Pilih Rombel")
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
    const [attendanceDate, setAttendanceDate] = React.useState(new Date().toISOString().split('T')[0])

    const classes = [selectedClass]

    React.useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setIsLoading(true)
            const role = user.role || ""
            const uid = user.id || ""

            if (isTeacher) {
                const res = await getStudentsByGuruRombel(uid)
                if (res.success && res.data) {
                    setStudents(res.data)

                    if (res.data.length > 0 && res.data[0].studyGroup) {
                        const rombel = res.data[0].studyGroup
                        setSelectedClass("Kelas " + rombel)

                        // Fetch existing attendance for this date and rombel
                        const attRes = await getAttendanceByDateAndRombel(attendanceDate, rombel)
                        if (attRes.success && attRes.data) {
                            const initialAttendance: Record<string, string> = {}
                            const initialNotes: Record<string, string> = {}

                            // Set defaults for all students first
                            res.data.forEach((s: any) => {
                                initialAttendance[s.id] = "hadir"
                                initialNotes[s.id] = ""
                            })

                            // Override with existing data
                            attRes.data.forEach((record: any) => {
                                initialAttendance[record.accountId] = record.status.toLowerCase()
                                initialNotes[record.accountId] = record.note || ""
                            })

                            setAttendance(initialAttendance)
                            setNotes(initialNotes)
                        } else {
                            const initialAttendance = res.data.reduce((acc: any, curr: any) => ({
                                ...acc,
                                [curr.id]: "hadir"
                            }), {})
                            setAttendance(initialAttendance)
                            setNotes({})
                        }
                    } else if (res.message) {
                        setSelectedClass("Rombel Tidak Ada")
                    }
                }
            } else {
                // Student role
                const [statsRes, historyRes] = await Promise.all([
                    getDetailedDashboardStats(role, uid),
                    getAttendanceHistory(uid, role)
                ])
                if (statsRes.success && statsRes.data) setStats(statsRes.data)
                if (historyRes.success && historyRes.data) setHistory(historyRes.data)
            }
            setIsLoading(false)
        }

        fetchData()
    }, [isTeacher, user, attendanceDate])

    const [now, setNow] = React.useState(new Date())

    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const handleStatusChange = (id: string, status: string) => {
        setAttendance(prev => ({ ...prev, [id]: status }))
    }

    const getStatusStyle = (status: string, current: string) => {
        const isActive = status === current
        if (!isActive) return "text-slate-500 hover:text-slate-300 hover:bg-white/5"

        switch (status) {
            case "hadir": return "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            case "sakit": return "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            case "izin": return "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            case "alfa": return "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            default: return ""
        }
    }

    const handleSave = async () => {
        if (students.length === 0) return;

        setIsSaving(true)
        const attendanceData = students.map(student => ({
            accountId: student.id,
            status: attendance[student.id].charAt(0).toUpperCase() + attendance[student.id].slice(1),
            note: notes[student.id] || "",
            date: attendanceDate
        }))

        const res = await saveAttendance(attendanceData)
        if (res.success) {
            setToast({ show: true, message: "Absensi berhasil disimpan!", type: 'success' })
            // Return to initial look / reload early as requested
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        } else {
            setToast({ show: true, message: "Gagal menyimpan absensi: " + res.error, type: 'error' })
        }
        setIsSaving(false)
    }

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Live Attendance</span>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {isTeacher ? "Manajemen Absensi" : "Riwayat Absensi"}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {isTeacher
                            ? "Atur dan tinjau kehadiran siswa secara real-time."
                            : "Lihat riwayat dan rekap data kehadiran Anda."}
                    </p>
                </div>

                {isTeacher && (
                    <Button
                        size="lg"
                        onClick={handleSave}
                        disabled={isSaving || students.length === 0}
                        className="rounded-2xl h-14 px-8 bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/20 group"
                    >
                        {isSaving ? (
                            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                        ) : (
                            <Save className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        )}
                        <span className="font-bold">{isSaving ? "Menyimpan..." : "Simpan Absensi"}</span>
                    </Button>
                )}
            </div>

            {isTeacher ? (
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-wrap items-center gap-4 w-full">
                            {/* Custom Modern Dropdown */}
                            <div className="relative z-50">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="h-14 pl-12 pr-6 rounded-[1.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3 transition-all hover:border-brand-500/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 min-w-[200px] shadow-sm"
                                >
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Filter className="h-4 w-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                                    </div>
                                    <span className="flex-1 text-left">{selectedClass}</span>
                                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", isDropdownOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-[-1]" onClick={() => setIsDropdownOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full left-0 mt-3 w-full min-w-[220px] rounded-3xl bg-slate-900/90 dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-2 shadow-2xl overflow-hidden shadow-brand-500/5"
                                            >
                                                {classes.map((cls) => (
                                                    <button
                                                        key={cls}
                                                        onClick={() => {
                                                            setSelectedClass(cls)
                                                            setIsDropdownOpen(false)
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                                            selectedClass === cls
                                                                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "h-1.5 w-1.5 rounded-full transition-all",
                                                            selectedClass === cls ? "bg-white" : "bg-transparent"
                                                        )} />
                                                        {cls}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Modern Date Input */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-200 group-focus-within:text-brand-500 transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    className="h-14 pl-11 pr-6 rounded-[1.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all cursor-pointer hover:border-brand-500/50 shadow-sm"
                                />
                            </div>

                            <div className="relative group flex-1 max-w-sm ml-auto">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari nama siswa..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-14 pl-11 pr-6 rounded-[1.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white/50 dark:bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl min-h-[400px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-20 gap-4">
                                <div className="h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Daftar Murid...</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
                                <div className="h-20 w-20 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                                    <Users className="h-10 w-10 text-slate-300" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Tidak Ada Murid</h4>
                                <p className="text-slate-500 max-w-xs font-medium">
                                    {searchQuery
                                        ? `Tidak ada hasil untuk "${searchQuery}"`
                                        : `Daftar murid untuk rombel (${selectedClass}) saat ini masih kosong atau belum terdaftar.`
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-500/5 border-b border-white/5">
                                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">No</th>
                                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Detail Siswa</th>
                                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center">Kehadiran</th>
                                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Catatan Khusus</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student, index) => (
                                            <motion.tr
                                                key={student.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                                            >
                                                <td className="px-8 py-6 font-bold text-slate-500 tabular-nums">{(index + 1).toString().padStart(2, '0')}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                                                            <Users className="h-5 w-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-base font-bold text-slate-800 dark:text-white mb-0.5">{student.name}</span>
                                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">ID: {student.id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center p-1.5 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 border border-white/5 max-w-fit mx-auto shadow-inner">
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, "hadir")}
                                                            className={cn("px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2", getStatusStyle("hadir", attendance[student.id]))}
                                                        >
                                                            <Check className="h-3.5 w-3.5" /> <span>Hadir</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, "sakit")}
                                                            className={cn("px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2", getStatusStyle("sakit", attendance[student.id]))}
                                                        >
                                                            <Clock className="h-3.5 w-3.5" /> <span>Sakit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, "izin")}
                                                            className={cn("px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2", getStatusStyle("izin", attendance[student.id]))}
                                                        >
                                                            <HelpCircle className="h-3.5 w-3.5" /> <span>Izin</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, "alfa")}
                                                            className={cn("px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2", getStatusStyle("alfa", attendance[student.id]))}
                                                        >
                                                            <X className="h-3.5 w-3.5" /> <span>Alfa</span>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Klik untuk menulis..."
                                                            value={notes[student.id] || ""}
                                                            onChange={(e) => setNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                                                            className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 placeholder:text-slate-600 dark:placeholder:text-slate-500 italic"
                                                        />
                                                        <div className="absolute bottom-0 left-0 w-8 h-[1px] bg-brand-500/30 group-hover:w-full transition-all duration-700" />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Statistik Ringkas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Hadir", value: stats?.hadir?.toString() || "0", color: "emerald", icon: Check },
                            { label: "Sakit", value: stats?.sakit?.toString() || "0", color: "amber", icon: Clock },
                            { label: "Izin", value: stats?.izin?.toString() || "0", color: "blue", icon: HelpCircle },
                            { label: "Alfa", value: stats?.alfa?.toString() || "0", color: "rose", icon: X },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <GlassCard className="p-6 border-white/5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center border",
                                            `bg-${stat.color}-500/10 border-${stat.color}-500/20`
                                        )}>
                                            <stat.icon className={cn("h-5 w-5", `text-${stat.color}-500`)} />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{stat.value}</div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Tabel Riwayat Absensi */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/50 dark:bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold">Riwayat Kehadiran Lengkap</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bulan Februari 2026</p>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold tabular-nums text-xs">
                                    <Calendar className="h-4 w-4" />
                                    <span>Tahun Akademik 2025/2026</span>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                                        <div className="h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Riwayat...</p>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center p-20 text-slate-500 font-medium">Belum ada data riwayat absensi.</div>
                                ) : (
                                    history.map((entry: any, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm font-black text-slate-500 tabular-nums w-8 text-center">{(idx + 1).toString().padStart(2, '0')}</div>
                                                <div className={cn(
                                                    "h-10 w-10 rounded-2xl flex items-center justify-center border",
                                                    entry.status === 'Hadir' ? "bg-emerald-500/10 border-emerald-500/20" :
                                                        entry.status === 'Sakit' ? "bg-amber-500/10 border-amber-500/20" :
                                                            entry.status === 'Izin' ? "bg-blue-500/10 border-blue-500/20" :
                                                                "bg-rose-500/10 border-rose-500/20"
                                                )}>
                                                    {entry.status === 'Hadir' ? <Check className="h-5 w-5 text-emerald-500" /> :
                                                        entry.status === 'Sakit' ? <Clock className="h-5 w-5 text-amber-500" /> :
                                                            entry.status === 'Izin' ? <HelpCircle className="h-5 w-5 text-blue-500" /> :
                                                                <X className="h-5 w-5 text-rose-500" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date(entry.date))}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        {!entry.time || entry.time === '-' ? 'Tanpa Keterangan Waktu' : `Masuk pukul ${entry.time}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                entry.status === 'Hadir' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                                                    entry.status === 'Sakit' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                                                        entry.status === 'Izin' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" :
                                                            "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                            )}>
                                                {entry.status}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Statistik Footer */}
                            <div className="px-8 py-6 border-t border-white/5">
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-brand-600 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -m-4 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                    <div className="relative flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Kehadiran Selama Ini</p>
                                            <h5 className="text-3xl font-black mb-0.5">{stats?.attendanceRate || "0%"}</h5>
                                            <p className="text-xs font-bold opacity-80">{stats?.hadir || 0} dari {stats?.totalDays || 0} hari sekolah</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="text-center">
                                                <div className="text-lg font-black">{stats?.hadir || 0}</div>
                                                <div className="text-[8px] font-bold uppercase tracking-widest opacity-60">Hadir</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-black">{stats?.sakit || 0}</div>
                                                <div className="text-[8px] font-bold uppercase tracking-widest opacity-60">Sakit</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-black">{stats?.izin || 0}</div>
                                                <div className="text-[8px] font-bold uppercase tracking-widest opacity-60">Izin</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-black">{stats?.alfa || 0}</div>
                                                <div className="text-[8px] font-bold uppercase tracking-widest opacity-60">Alfa</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Premium Toast Notification */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <div className={cn(
                            "px-6 py-4 rounded-3xl border backdrop-blur-2xl shadow-2xl flex items-center gap-4 min-w-[300px]",
                            toast.type === 'success'
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        )}>
                            <div className={cn(
                                "h-10 w-10 rounded-2xl flex items-center justify-center border",
                                toast.type === 'success' ? "bg-emerald-500/20 border-emerald-500/30" : "bg-rose-500/20 border-rose-500/30"
                            )}>
                                {toast.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-widest">{toast.type === 'success' ? 'Sukses' : 'Gagal'}</span>
                                <span className="text-xs font-bold opacity-80">{toast.message}</span>
                            </div>
                            <button
                                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                                className="ml-auto p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="h-4 w-4 opacity-50" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
