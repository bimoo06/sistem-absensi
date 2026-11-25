"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Lock, User, Info, Eye, EyeOff, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassInput } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { verifyLogin } from "@/lib/actions"

export default function LoginPage() {
    const { login } = useAuth()
    const router = useRouter()
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [error, setError] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [rememberMe, setRememberMe] = React.useState(false)

    // Load saved credentials on mount
    React.useEffect(() => {
        const savedUsername = localStorage.getItem("saved_username")
        const savedPassword = localStorage.getItem("saved_password")
        if (savedUsername && savedPassword) {
            setUsername(savedUsername)
            setPassword(savedPassword)
            setRememberMe(true)
        }
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")

        try {
            const res = await verifyLogin(username, password)
            if (res.success && res.data) {
                // Handle "Remember Me"
                if (rememberMe) {
                    localStorage.setItem("saved_username", username)
                    localStorage.setItem("saved_password", password)
                } else {
                    localStorage.removeItem("saved_username")
                    localStorage.removeItem("saved_password")
                }

                login(res.data)
                router.push("/dashboard")
            } else {
                setError(res.error || "Username atau password salah")
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] h-[40vh] w-[40vh] rounded-full bg-brand-500/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[40vh] w-[40vh] rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-[420px] flex flex-col items-center"
            >
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center justify-center h-20 w-20 mb-4 bg-white border border-slate-200 dark:border-white/20 p-1.5 rounded-[1.25rem] overflow-hidden shadow-xl"
                    >
                        <Image src="/logo-pgri.jpg" alt="PGRI Logo" width={80} height={80} className="object-contain" />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Portal Absensi Sekolah</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest leading-none">TKS PGRI 05 KLABANG</p>
                </div>

                <div className="w-full bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl">
                    <form className="space-y-8" onSubmit={handleLogin}>
                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-white ml-1">
                                    Username
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-300 dark:text-white group-focus-within:text-brand-600 transition-colors" />
                                    </div>
                                    <GlassInput
                                        type="text"
                                        placeholder="Masukkan username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-12 h-14 bg-slate-50/50 dark:bg-white/5 border-slate-200/50 dark:border-white/5 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-brand-500/5 transition-all text-base rounded-2xl dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-white">Password</label>
                                    <a href="#" className="text-xs font-bold text-brand-600 hover:text-brand-500 transition-colors">Lupa?</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-300 dark:text-white group-focus-within:text-brand-600 transition-colors" />
                                    </div>
                                    <GlassInput
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-12 pr-12 h-14 bg-slate-50/50 dark:bg-white/5 border-slate-200/50 dark:border-white/5 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-brand-500/5 transition-all text-base rounded-2xl dark:text-white"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2.5 px-1 -mt-4">
                            <button
                                type="button"
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-300 ${rememberMe
                                    ? "bg-brand-600 border-brand-600 shadow-lg shadow-brand-600/20"
                                    : "border-slate-300 dark:border-white/10 bg-transparent hover:border-brand-500"
                                    }`}
                            >
                                <AnimatePresence>
                                    {rememberMe && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                        >
                                            <Check className="h-3.5 w-3.5 text-white stroke-[4]" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                            <label
                                className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none"
                                onClick={() => setRememberMe(!rememberMe)}
                            >
                                Ingat Saya
                            </label>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-xl text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 text-base font-bold shadow-xl shadow-brand-600/20 hover:shadow-2xl hover:shadow-brand-600/30 transition-all rounded-2xl group relative overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                {isSubmitting ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        Memproses...
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="normal"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center"
                                    >
                                        Masuk Sekarang
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </form>

                    {/* Info Card for Dummy Accounts
                    <div className="mt-10 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-start gap-4">
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-brand-500/10 flex items-center justify-center">
                            <Info className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div className="space-y-1.5 flex-1 text-left">
                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Akun Dummy</p>
                            <div className="grid grid-cols-1 gap-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Guru: <span className="text-brand-600 dark:text-brand-400 font-bold ml-1">guru / guru123</span></p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Murid: <span className="text-brand-600 dark:text-brand-400 font-bold ml-1">murid / murid123</span></p>
                            </div>
                        </div>
                    </div> */}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-600"
                >
                    Butuh bantuan akses?
                    <a href="#" className="ml-1 text-slate-900 dark:text-slate-300 hover:text-brand-600 transition-colors">Hubungi Admin</a>
                </motion.p>
            </motion.div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 dark:text-slate-800">
                &copy; 2026 TKS PGRI 05 KLABANG
            </div>
        </div>
    )
}
