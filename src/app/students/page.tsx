"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Plus,
    MoreHorizontal,
    Download,
    Filter,
    Users,
    ChevronDown,
    GraduationCap
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { GlassCard } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const students = [
    { id: "1001", name: "Ahmad Yudi", class: "X MIPA 1", status: "Aktif", renderHadir: "98%" },
    { id: "1002", name: "Bunga Citra", class: "X MIPA 1", status: "Aktif", renderHadir: "95%" },
    { id: "1003", name: "Candra Wijaya", class: "X MIPA 2", status: "Aktif", renderHadir: "100%" },
    { id: "1004", name: "Dina Mariana", class: "X MIPA 2", status: "Cuti", renderHadir: "-" },
    { id: "1005", name: "Eko Pratama", class: "XI IPS 1", status: "Aktif", renderHadir: "92%" },
    { id: "1006", name: "Fajar Nugraha", class: "XI IPS 1", status: "Aktif", renderHadir: "88%" },
    { id: "1007", name: "Gita Savitri", class: "XII MIPA 1", status: "Aktif", renderHadir: "99%" },
]

import { getStudentsByGuruRombel } from "@/lib/actions"

export default function StudentsPage() {
    const { isGuru, user } = useAuth()
    const router = useRouter()
    const [isFilterOpen, setIsFilterOpen] = React.useState(false)
    const [selectedClass, setSelectedClass] = React.useState("Semua Kelas")
    const [students, setStudents] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const searchParams = useSearchParams()

    const classes = ["Semua Kelas", "X MIPA 1", "X MIPA 2", "XI IPS 1", "XII MIPA 1"]

    React.useEffect(() => {
        if (!isGuru()) {
            router.push("/dashboard")
            return
        }

        const fetchStudents = async () => {
            setIsLoading(true)
            if (user?.id) {
                const res = await getStudentsByGuruRombel(user.id)
                if (res.success && res.data) {
                    setStudents(res.data)
                    // If guru has a rombel, set it as selected class display
                    if (res.data.length > 0 && res.data[0].studyGroup) {
                        setSelectedClass(res.data[0].studyGroup)
                    } else if (res.message) {
                        setSelectedClass("Rombel Tidak Ada")
                    }
                }
            }
            setIsLoading(false)
        }

        fetchStudents()
        const query = searchParams.get("q")
        if (query) {
            setSearchQuery(query)
        }
    }, [isGuru, router, user?.id, searchParams])

    const [currentPage, setCurrentPage] = React.useState(1)
    const itemsPerPage = 10

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.nisn || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const handleExportCSV = () => {
        if (filteredStudents.length === 0) return

        // Headers
        const headers = ["ID/NIS", "Nama Siswa", "NISN", "NIK", "Jenis Kelamin", "Tanggal Lahir", "Nama Ibu", "Tingkat", "Rombel", "Status"]

        // Rows
        const rows = filteredStudents.map(s => [
            s.id,
            s.name,
            s.nisn || "-",
            s.nikSiswa || s.nik || "-",
            s.gender || "-",
            s.birthDate || "-",
            s.motherName || "-",
            s.gradeLevel || "-",
            s.studyGroup || "-",
            s.status
        ])

        // Create CSV content
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n")

        // Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `data_murid_${selectedClass.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (!isGuru()) return null

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Database Siswa</span>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Kelola Data Siswa
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Administrasi basis data siswa dan pantau performa kehadiran mereka secara global.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        size="lg"
                        className="rounded-2xl h-14 px-6 border-slate-200 dark:border-white/10 hover:bg-white/5 group transition-all"
                    >
                        <Download className="mr-2 h-5 w-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                        <span className="font-bold">Ekspor .CSV</span>
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative group flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama atau NIS siswa..."
                            className="w-full h-14 pl-12 pr-6 rounded-[1.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                        />
                    </div>

                    <div className="relative z-20">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="h-14 pl-12 pr-6 rounded-[1.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3 transition-all hover:border-brand-500/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 min-w-[200px] shadow-sm group cursor-default"
                        >
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                            </div>
                            <span className="flex-1 text-left">{selectedClass}</span>
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white/50 dark:bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <div className="h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Data Siswa...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
                            <div className="h-20 w-20 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                                <Users className="h-10 w-10 text-slate-300" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Tidak Ada Murid</h4>
                            <p className="text-slate-500 max-w-xs font-medium">
                                {searchQuery ? `Tidak ada murid yang cocok dengan pencarian "${searchQuery}"` : `Daftar murid untuk rombel (${selectedClass}) saat ini masih kosong atau belum terdaftar.`}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-500/5 border-b border-white/5">
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">ID / NIS</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Informasi Siswa</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Kelas / Rombel</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {paginatedStudents.map((student, index) => (
                                            <motion.tr
                                                key={student.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                                            >
                                                <td className="px-8 py-6 font-bold text-slate-500 tabular-nums">{student.id}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                                                            <Users className="h-5 w-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-base font-bold text-slate-800 dark:text-white mb-0.5">{student.name}</span>
                                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Terverifikasi</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-white/5 w-fit">
                                                        <GraduationCap className="h-3.5 w-3.5 text-brand-500" />
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{student.studyGroup}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                                        student.status === "Aktif"
                                                            ? "bg-brand-500/10 text-brand-500 border-brand-500/20"
                                                            : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                    )}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right flex justify-center">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Footer (Visible if data exists) */}
                    {!isLoading && filteredStudents.length > 0 && (
                        <div className="p-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-500/5">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Menampilkan <span className="text-slate-900 dark:text-white">
                                    {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
                                </span> dari <span className="text-slate-900 dark:text-white">{filteredStudents.length} siswa</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="h-10 px-4 rounded-xl border-white/5 dark:bg-white/5 font-bold disabled:opacity-50"
                                >
                                    Prev
                                </Button>
                                <div className="flex items-center px-4 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-white">
                                    Halaman {currentPage} / {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="h-10 px-4 rounded-xl border-white/5 dark:bg-white/5 font-bold disabled:opacity-50"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
