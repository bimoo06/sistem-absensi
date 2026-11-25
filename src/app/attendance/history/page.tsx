"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Calendar,
    Filter,
    Search,
    ChevronDown,
    Users,
    Check,
    X,
    Clock,
    HelpCircle,
    ArrowLeft,
    FileDown,
    FileSpreadsheet,
    Printer
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getFilteredAttendanceHistory, getAllRombels } from "@/lib/actions"
import Link from "next/link"

export default function AttendanceHistoryPage() {
    const { user, isGuru, isAdmin } = useAuth()
    const [history, setHistory] = React.useState<any[]>([])
    const [rombels, setRombels] = React.useState<string[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    // Filters
    const [selectedRombel, setSelectedRombel] = React.useState<string>("")
    const [selectedDate, setSelectedDate] = React.useState<string>(new Date().toLocaleDateString('en-CA'))
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

    const fetchHistory = React.useCallback(async () => {
        if (!user) return
        setIsLoading(true)
        const res = await getFilteredAttendanceHistory({
            role: user.role as string,
            userId: user.id,
            rombel: selectedRombel,
            date: selectedDate
        })
        if (res.success && res.data) {
            setHistory(res.data)
        }
        setIsLoading(false)
    }, [user, selectedRombel, selectedDate])

    React.useEffect(() => {
        if (user && isAdmin()) {
            getAllRombels().then(res => {
                if (res.success && res.data) setRombels(res.data as string[])
            })
        }
    }, [user, isAdmin])

    React.useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    const filteredHistory = history.filter(item =>
        item.account.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "hadir": return <Check className="h-4 w-4 text-emerald-500" />
            case "sakit": return <Clock className="h-4 w-4 text-amber-500" />
            case "izin": return <HelpCircle className="h-4 w-4 text-blue-500" />
            case "alfa": return <X className="h-4 w-4 text-rose-500" />
            default: return null
        }
    }

    const exportToCSV = () => {
        const headers = ["Tanggal", "Nama Siswa", "Rombel", "Status", "Catatan"]
        const rows = filteredHistory.map(item => [
            new Date(item.date).toLocaleDateString('id-ID'),
            `"${item.account.name}"`,
            `"${item.account.studyGroup}"`,
            item.status,
            `"${(item.note || "-").replace(/"/g, '""')}"`
        ])

        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `Riwayat_Absensi_${selectedRombel || 'Semua'}_${selectedDate || 'Semua'}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportToPDF = () => {
        window.print()
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-brand-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">History Archives</span>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Riwayat Absensi
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {isAdmin() ? "Tinjau riwayat kehadiran seluruh rombel." : "Tinjau riwayat kehadiran rombel Anda."}
                    </p>
                </div>

                {isAdmin() && (
                    <div className="flex gap-3 no-print">
                        <Button
                            onClick={exportToCSV}
                            variant="outline"
                            className="rounded-2xl border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 font-bold"
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                        </Button>
                        <Button
                            onClick={exportToPDF}
                            variant="outline"
                            className="rounded-2xl border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-bold"
                        >
                            <FileDown className="mr-2 h-4 w-4" /> PDF
                        </Button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center no-print">
                {isAdmin() && (
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="h-12 pl-10 pr-6 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold flex items-center gap-3 transition-all hover:border-brand-500/50 min-w-[180px]"
                        >
                            <Filter className="absolute left-4 h-4 w-4 text-slate-400" />
                            {selectedRombel || "Semua Rombel"}
                            <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 mt-2 w-full z-50 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl"
                                >
                                    <button
                                        onClick={() => { setSelectedRombel(""); setIsDropdownOpen(false) }}
                                        className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-sm"
                                    >
                                        Semua Rombel
                                    </button>
                                    {rombels.map(r => (
                                        <button
                                            key={r}
                                            onClick={() => { setSelectedRombel(r); setIsDropdownOpen(false) }}
                                            className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-sm"
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-12 pl-10 pr-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                </div>

                <div className="relative flex-1 max-w-sm ml-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama siswa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden shadow-2xl min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <div className="h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Riwayat...</p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
                        <Users className="h-12 w-12 text-slate-700 mb-2" />
                        <h4 className="text-xl font-bold">Tidak ada data riwayat</h4>
                        <p className="text-slate-500 text-sm max-w-xs">Coba ubah filter tanggal atau rombel untuk melihat data lainnya.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tanggal</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Siswa</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Rombel</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Catatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((item, idx) => (
                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6 font-bold tabular-nums">
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6 font-bold">{item.account.name}</td>
                                        <td className="px-8 py-6 text-slate-400 font-medium">{item.account.studyGroup}</td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                                item.status.toLowerCase() === 'hadir' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                    item.status.toLowerCase() === 'sakit' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        item.status.toLowerCase() === 'izin' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                            "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                            )}>
                                                {getStatusIcon(item.status)}
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 italic text-slate-500 text-xs">{item.note || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
                    .max-w-\[1400px\] { max-width: 100% !important; margin: 0 !important; padding: 20px !important; }
                    .rounded-\[2\.5rem\], .bg-white\/5, .border-white\/10 { 
                        border-radius: 0 !important; 
                        background: white !important; 
                        border: none !important; 
                        box-shadow: none !important; 
                        border-bottom: 2px solid #000 !important;
                    }
                    table { width: 100% !important; color: black !important; border-collapse: collapse !important; }
                    th { 
                        color: #000 !important; 
                        border-bottom: 2px solid #000 !important; 
                        font-weight: 800 !important; 
                        background: #f8fafc !important; 
                        -webkit-print-color-adjust: exact;
                    }
                    td { 
                        color: #000 !important; 
                        border-bottom: 1px solid #ddd !important; 
                        font-weight: 500 !important; 
                        padding: 12px 0 !important;
                    }
                    .text-slate-900, .dark\:text-white, .text-slate-600, .dark\:text-slate-400 { color: black !important; }
                }
            ` }} />
        </div>
    )
}
