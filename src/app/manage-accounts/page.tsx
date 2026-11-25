"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Plus,
    MoreHorizontal,
    Users,
    GraduationCap,
    UserCog,
    CheckCircle2,
    XCircle,
    ShieldAlert,
    Eye,
    Pencil,
    Trash2
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getAccountsByRole, createAccount, deleteAccount, updateAccount, getAccountById } from "@/lib/actions"

type BaseAccount = {
    id: string
    name: string
    username: string
    role: "guru" | "murid"
    status: string
    password?: string
    gender?: string
    nik?: string
    nip?: string
    nuptk?: string
    employmentStatus?: string
    birthDate?: string
    homeSchool?: string
    nikSiswa?: string
    nisn?: string
    motherName?: string
    gradeLevel?: string
    studyGroup?: string
    histories: { message: string, createdAt: Date }[]
}

export default function ManageAccountsPage() {
    const { isAdmin, user } = useAuth()
    const role = user?.role
    const router = useRouter()

    const [accounts, setAccounts] = React.useState<BaseAccount[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [activeTab, setActiveTab] = React.useState<"guru" | "murid">("guru")
    const [searchQuery, setSearchQuery] = React.useState("")

    // Modal state
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [modalMode, setModalMode] = React.useState<"create" | "edit" | "detail">("create")
    const [selectedAccount, setSelectedAccount] = React.useState<BaseAccount | null>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [newAccountRole, setNewAccountRole] = React.useState<"guru" | "murid">("murid")
    const [formData, setFormData] = React.useState<Record<string, string>>({})
    const [currentPage, setCurrentPage] = React.useState(1)
    const itemsPerPage = 10

    // Delete Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
    const [accountToDelete, setAccountToDelete] = React.useState<string | null>(null)

    const fetchAccounts = React.useCallback(async () => {
        setIsLoading(true)
        const res = await getAccountsByRole(activeTab)
        if (res.success && res.data) {
            setAccounts(res.data as BaseAccount[])
        }
        setIsLoading(false)
    }, [activeTab])

    const searchParams = useSearchParams()

    React.useEffect(() => {
        if (role === null) return
        if (!isAdmin()) {
            router.push("/dashboard")
        } else {
            fetchAccounts()
            const query = searchParams.get("q")
            if (query) {
                setSearchQuery(query)
            }
        }
    }, [isAdmin, role, router, activeTab, fetchAccounts, searchParams])

    React.useEffect(() => {
        setCurrentPage(1)
    }, [activeTab, searchQuery])

    if (role === null || !isAdmin()) return null

    const handleOpenModal = (mode: "create" | "edit" | "detail", account?: BaseAccount) => {
        setModalMode(mode)
        if (mode === "create") {
            setNewAccountRole(activeTab)
            setFormData({})
            setSelectedAccount(null)
        } else if (account) {
            setSelectedAccount(account)
            setNewAccountRole(account.role)
            setFormData({
                nama: account.name,
                username: account.username,
                password: account.password || "",
                jk: account.gender || "",
                status: account.status,
                // Unified NIK Handling - Comprehensive scan for any existing NIK data
                nik: String((account as any).nikSiswa ?? (account as any).nik ?? (account as any).nik_siswa ?? (account as any).niksiswa ?? "").trim(),
                nip: account.nip || "",
                nuptk: account.nuptk || "",
                status_pegawai: account.employmentStatus || "",
                ttl: account.birthDate || "",
                sekolah_induk: account.homeSchool || "",
                rombel: account.studyGroup || "",
                // Murid
                nisn: account.nisn || "",
                nama_ibu: account.motherName || "",
                tingkat: account.gradeLevel || "",
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setFormData({})
        setSelectedAccount(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (modalMode === "detail") return
        setIsSubmitting(true)

        let res;
        if (modalMode === "create") {
            res = await createAccount(formData, newAccountRole)
        } else {
            res = await updateAccount(selectedAccount!.id, formData)
        }

        if (res.success && res.data) {
            if (modalMode === "create") {
                setAccounts(prev => [(res.data as any) as BaseAccount, ...prev])
            } else {
                setAccounts(prev => prev.map(acc => acc.id === selectedAccount!.id ? (res.data as any) as BaseAccount : acc))
            }
            handleCloseModal()
        } else {
            alert(res.error || "Gagal memproses data")
        }

        setIsSubmitting(false)
    }

    const handleDelete = (id: string) => {
        setAccountToDelete(id)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!accountToDelete) return
        setIsSubmitting(true)
        const res = await deleteAccount(accountToDelete)
        if (res.success) {
            setAccounts(prev => prev.filter(acc => acc.id !== accountToDelete))
            setIsDeleteModalOpen(false)
            setAccountToDelete(null)
        } else {
            alert(res.error || "Gagal menghapus akun")
        }
        setIsSubmitting(false)
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const filteredAccounts = accounts.filter(acc =>
    (acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)
    const paginatedAccounts = filteredAccounts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-12 relative z-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Security & Access</span>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Manajemen Akun
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Kelola akses masuk, password, status, dan data profil pokok pengguna.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => handleOpenModal("create")} size="lg" className="rounded-2xl h-14 px-8 bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/20 group">
                        <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                        <span className="font-bold">Buat Akun Baru</span>
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center p-1.5 bg-slate-200/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 w-full md:w-auto overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("guru")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === "guru"
                                    ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <UserCog className="h-4 w-4" />
                            Akun Guru
                        </button>
                        <button
                            onClick={() => setActiveTab("murid")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === "murid"
                                    ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <GraduationCap className="h-4 w-4" />
                            Akun Murid
                        </button>
                    </div>

                    <div className="relative group w-full md:w-auto md:min-w-[320px]">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama, ID, atau username..."
                            className="w-full h-14 pl-12 pr-6 rounded-[1.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white/50 dark:bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-500/5 border-b border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 min-w-[120px]">ID Pengguna</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 min-w-[250px]">Kredensial Login</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 min-w-[150px]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 min-w-[150px]">Rombel</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 min-w-[250px]">Activity Log Terakhir</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-right min-w-[100px]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {paginatedAccounts.map((acc, index) => (
                                        <motion.tr
                                            key={acc.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                                        >
                                            <td className="px-8 py-6 font-bold text-slate-500 tabular-nums">{acc.id}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-11 w-11 rounded-2xl flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform shrink-0",
                                                        acc.role === "guru"
                                                            ? "bg-brand-500/10 border-brand-500/20 text-brand-500"
                                                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                                                    )}>
                                                        {acc.role === "guru" ? <UserCog className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-bold text-slate-800 dark:text-white mb-0.5 line-clamp-1">{acc.name}</span>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 tracking-wider">
                                                            <span className="uppercase">User:</span>
                                                            <span className="text-brand-600 dark:text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-md">{acc.username}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {acc.status === "Aktif" ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-rose-500" />
                                                    )}
                                                    <span className={cn(
                                                        "text-xs font-bold uppercase tracking-widest",
                                                        acc.status === "Aktif" ? "text-emerald-500" : "text-rose-500"
                                                    )}>
                                                        {acc.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        {acc.studyGroup || "-"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1 max-w-xs">
                                                    <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                                        {acc.histories?.[0]?.message || "-"}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest cursor-pointer hover:underline" onClick={() => handleOpenModal("detail", acc)}>Lihat Detail</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right w-[100px]">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal("detail", acc)}
                                                        className="p-2 rounded-xl text-slate-500 hover:text-brand-500 hover:bg-brand-500/10 transition-all border border-transparent hover:border-brand-500/20"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal("edit", acc)}
                                                        className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20"
                                                        title="Edit Akun"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(acc.id)}
                                                        className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                                                        title="Hapus Akun"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>

                                {paginatedAccounts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-16 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                                <Search className="h-10 w-10" />
                                                <p className="text-sm font-bold">Tidak ada akun yang ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {!isLoading && filteredAccounts.length > 0 && (
                        <div className="p-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-500/5">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Menampilkan <span className="text-slate-900 dark:text-white">
                                    {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAccounts.length)}
                                </span> dari <span className="text-slate-900 dark:text-white">{filteredAccounts.length} akun</span>
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

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto w-full h-full pt-12 sm:pt-20">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
                        />

                        {/* Modal Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                            className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col z-10 my-auto"
                        >
                            <div className="sticky top-0 z-20 px-8 py-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 flex items-center justify-between rounded-t-[2.5rem]">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {modalMode === "create" ? "Buat Entri Akun Baru" : modalMode === "edit" ? "Edit Data Akun" : "Detail Informasi Akun"}
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500">
                                        {modalMode === "detail" ? "Informasi lengkap mengenai profil pengguna ini." : "Lengkapi data pokok untuk registrasi ke sistem."}
                                    </p>
                                </div>
                                {modalMode !== "detail" && (
                                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            disabled={modalMode === "edit"}
                                            onClick={() => setNewAccountRole("guru")}
                                            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", newAccountRole === "guru" ? "bg-white dark:bg-slate-800 text-brand-600 shadow-sm" : "text-slate-500", modalMode === "edit" && "opacity-50 cursor-not-allowed")}
                                        >Guru</button>
                                        <button
                                            type="button"
                                            disabled={modalMode === "edit"}
                                            onClick={() => setNewAccountRole("murid")}
                                            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", newAccountRole === "murid" ? "bg-white dark:bg-slate-800 text-brand-600 shadow-sm" : "text-slate-500", modalMode === "edit" && "opacity-50 cursor-not-allowed")}
                                        >Murid</button>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 pt-4">
                                <form id="accountForm" onSubmit={handleSubmit} className="space-y-4">

                                    {/* COMMON FIELDS */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Nama Lengkap</label>
                                            <input
                                                required
                                                readOnly={modalMode === "detail"}
                                                value={formData.nama || ""}
                                                type="text"
                                                onChange={(e) => handleInputChange('nama', e.target.value)}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                placeholder="Penting untuk sertifikat"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Username</label>
                                            <input
                                                required={modalMode === "create" ? false : true}
                                                readOnly={modalMode === "detail"}
                                                value={formData.username || ""}
                                                type="text"
                                                onChange={(e) => handleInputChange('username', e.target.value)}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                placeholder={modalMode === "create" ? "Otomatis jika kosong" : ""}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Jenis Kelamin</label>
                                            <select
                                                required
                                                disabled={modalMode === "detail"}
                                                value={formData.jk || ""}
                                                onChange={(e) => handleInputChange('jk', e.target.value)}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                                            >
                                                <option value="" className="dark:bg-slate-800">Pilih Jenis Kelamin...</option>
                                                <option value="L" className="dark:bg-slate-800">Laki-laki</option>
                                                <option value="P" className="dark:bg-slate-800">Perempuan</option>
                                            </select>
                                        </div>
                                        {modalMode !== "create" && (
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Status Akun</label>
                                                <select
                                                    required
                                                    disabled={modalMode === "detail"}
                                                    value={formData.status || ""}
                                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                                                >
                                                    <option value="Aktif" className="dark:bg-slate-800">Aktif</option>
                                                    <option value="Nonaktif" className="dark:bg-slate-800">Nonaktif</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* GURU SPECIFIC FIELDS */}
                                    {newAccountRole === "guru" && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">NIK (Nomor Induk Kependudukan)</label>
                                                    <input
                                                        required
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.nik || ""}
                                                        type="text"
                                                        maxLength={16}
                                                        onChange={(e) => handleInputChange('nik', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="16 Digit NIK KTP"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">NIP <span className="text-slate-400 font-normal lowercase">(Opsional)</span></label>
                                                    <input
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.nip || ""}
                                                        type="text"
                                                        onChange={(e) => handleInputChange('nip', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="Nomor Induk Pegawai"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">NUPTK <span className="text-slate-400 font-normal lowercase">(Opsional)</span></label>
                                                    <input
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.nuptk || ""}
                                                        type="text"
                                                        onChange={(e) => handleInputChange('nuptk', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="Opsional"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Status Kepegawaian</label>
                                                    <select
                                                        required
                                                        disabled={modalMode === "detail"}
                                                        value={formData.status_pegawai || ""}
                                                        onChange={(e) => handleInputChange('status_pegawai', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                                                    >
                                                        <option value="" className="dark:bg-slate-800">Pilih Status...</option>
                                                        <option value="PNS" className="dark:bg-slate-800">Tenaga Kependidikan</option>
                                                        <option value="PPPK" className="dark:bg-slate-800">Guru</option>
                                                        <option value="Honorer" className="dark:bg-slate-800">Kepala Sekolah</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tanggal Lahir</label>
                                                    <input
                                                        required
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.ttl || ""}
                                                        type="date"
                                                        onChange={(e) => handleInputChange('ttl', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-700 dark:text-slate-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Sekolah Induk</label>
                                                    <input
                                                        required
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.sekolah_induk || ""}
                                                        type="text"
                                                        onChange={(e) => handleInputChange('sekolah_induk', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="Misal: Ya atau Tidak"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Password Akun</label>
                                                    <input
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.password || ""}
                                                        type="text"
                                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="Otomatis: NIP / NIK"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Rombongan Belajar (Rombel)</label>
                                                    <input
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.rombel || ""}
                                                        type="text"
                                                        onChange={(e) => handleInputChange('rombel', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="Misal: Kelompok A"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* MURID SPECIFIC FIELDS */}
                                    {newAccountRole === "murid" && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">NIK Siswa</label>
                                                    <input
                                                        required
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.nik || ""}
                                                        type="text"
                                                        maxLength={16}
                                                        onChange={(e) => handleInputChange('nik', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="Sesuai Kartu Keluarga"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">NISN</label>
                                                    <input
                                                        required
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.nisn || ""}
                                                        type="number"
                                                        onChange={(e) => handleInputChange('nisn', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="10 Digit NISN Nasional"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Nama Ibu Kandung</label>
                                                    <input
                                                        required
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.nama_ibu || ""}
                                                        type="text"
                                                        onChange={(e) => handleInputChange('nama_ibu', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="Sebagai lapis keamanan tambahan"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tingkat Kelas</label>
                                                    <select
                                                        required
                                                        disabled={modalMode === "detail"}
                                                        value={formData.tingkat || ""}
                                                        onChange={(e) => handleInputChange('tingkat', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
                                                    >
                                                        <option value="" className="dark:bg-slate-800">Pilih Tingkat...</option>
                                                        <option value="A" className="dark:bg-slate-800">Kelompok A</option>
                                                        <option value="B" className="dark:bg-slate-800">Kelompok B</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Rombongan Belajar (Rombel)</label>
                                                    <input
                                                        required
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.rombel || ""}
                                                        type="text"
                                                        onChange={(e) => handleInputChange('rombel', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="Misalnya: Kelompok A"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Password Akun</label>
                                                    <input
                                                        readOnly={modalMode === "detail"}
                                                        value={formData.password || ""}
                                                        type="text"
                                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-sm focus:ring-2 focus:ring-brand-500/20"
                                                        placeholder="Otomatis: NISN / NIK"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-3 p-8 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleCloseModal}
                                            className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm"
                                        >
                                            {modalMode === "detail" ? "Tutup" : "Batal"}
                                        </Button>
                                        {modalMode !== "detail" && (
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="h-12 px-8 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-lg shadow-brand-600/20 ring-2 ring-brand-500/20 disabled:opacity-50"
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                        <span>Menyimpan...</span>
                                                    </div>
                                                ) : modalMode === "create" ? "Buat Akun" : "Simpan Perubahan"}
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CUSTOM DELETE MODAL */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm rounded-[2.5rem] bg-slate-900 border border-white/10 p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 -m-8 h-32 w-32 bg-rose-500/10 rounded-full blur-3xl" />

                            <div className="relative text-center space-y-6">
                                <div className="mx-auto h-20 w-20 rounded-3xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-inner">
                                    <Trash2 className="h-10 w-10 text-rose-500" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white">Hapus Akun?</h3>
                                    <p className="text-slate-400 font-medium">Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="h-14 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all active:scale-95"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={isSubmitting}
                                        className="h-14 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "..." : "Ya, Hapus"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
