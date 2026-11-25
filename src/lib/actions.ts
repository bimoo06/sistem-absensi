"use server"

import { prisma } from "./db"

// Fetch all accounts by role
export async function getAccountsByRole(role: "guru" | "murid") {
    try {
        const accounts = await prisma.account.findMany({
            where: { role },
            orderBy: { createdAt: "desc" },
            include: {
                histories: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                }
            }
        })
        return { success: true, data: accounts }
    } catch (error) {
        console.error("Error fetching accounts:", error)
        return { success: false, error: "Gagal mengambil data akun" }
    }
}

// Create a new Guru or Murid account
export async function createAccount(data: any, role: "guru" | "murid") {
    try {
        // Generate prefix
        const idPrefix = role === "guru" ? "G-" : "M-"
        const newId = `${idPrefix}${Math.floor(Math.random() * 9000) + 1000}`

        // Priority-based identifier generation
        let identifier = "";
        if (role === "guru") {
            // Priority for Guru: NIP > NIK > Random ID
            identifier = data.nip || data.nik || newId;
        } else {
            // Priority for Murid: NISN > NIK > Random ID
            identifier = data.nisn || data.nik || newId;
        }

        const username = data.username || identifier;
        const password = data.password || identifier;

        const newDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())

        const account = await prisma.account.create({
            data: {
                id: newId,
                username: username,
                password: password,
                name: data.nama || "Tanpa Nama",
                role: role,
                gender: data.jk,
                status: "Aktif",

                // Guru Specific (Redundant storage for transition safety)
                nik: data.nik || null,
                nip: role === "guru" ? data.nip : null,
                nuptk: role === "guru" ? data.nuptk : null,
                employmentStatus: role === "guru" ? data.status_pegawai : null,
                birthDate: role === "guru" ? data.ttl : null,
                homeSchool: role === "guru" ? data.sekolah_induk : null,
                studyGroup: data.rombel,

                // Murid Specific (Redundant storage for transition safety)
                nikSiswa: data.nik || null,
                nisn: role === "murid" ? data.nisn : null,
                motherName: role === "murid" ? data.nama_ibu : null,
                gradeLevel: role === "murid" ? data.tingkat : null,

                histories: {
                    create: {
                        message: `Akun divalidasi dan dibuat pada ${newDate}`
                    }
                }
            },
            include: {
                histories: true
            }
        })

        return { success: true, data: account }
    } catch (error) {
        console.error("Error creating account:", error)
        return { success: false, error: "Gagal membuat akun. Pastikan data unik." }
    }
}

// Delete an account
export async function deleteAccount(id: string) {
    try {
        await prisma.account.delete({
            where: { id }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "Gagal menghapus akun" }
    }
}

export async function updateAccount(id: string, data: any) {
    try {
        // Fetch current role to determine which NIK to update
        const currentAccount = await prisma.account.findUnique({ where: { id }, select: { role: true } })
        const role = currentAccount?.role

        const account = await prisma.account.update({
            where: { id },
            data: {
                name: data.nama,
                username: data.username,
                password: data.password, // Allow password update
                gender: data.jk,
                status: data.status,
                // Guru Specific fields (Use nik for both for safety during transition)
                nik: data.nik || undefined,
                nip: role === "guru" ? data.nip : undefined,
                nuptk: role === "guru" ? data.nuptk : undefined,
                employmentStatus: role === "guru" ? data.status_pegawai : undefined,
                birthDate: role === "guru" ? data.ttl : undefined,
                homeSchool: role === "guru" ? data.sekolah_induk : undefined,

                // Murid Specific fields (Use nik for both for safety during transition)
                nikSiswa: data.nik || undefined,
                nisn: role === "murid" ? data.nisn : undefined,
                motherName: role === "murid" ? data.nama_ibu : undefined,
                gradeLevel: role === "murid" ? data.tingkat : undefined,

                // Common / Shared
                studyGroup: data.rombel,

                histories: {
                    create: {
                        message: `Data akun diperbarui pada ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}`
                    }
                }
            },
            include: {
                histories: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            }
        })
        return { success: true, data: account }
    } catch (error) {
        console.error("Error updating account:", error)
        return { success: false, error: "Gagal memperbarui akun" }
    }
}

// Get single account detail
export async function getAccountById(id: string) {
    try {
        const account = await prisma.account.findUnique({
            where: { id },
            include: { histories: true }
        })
        return { success: true, data: account }
    } catch (error) {
        return { success: false, error: "Gagal mengambil detail akun" }
    }
}

export async function getDetailedDashboardStats(role: string, userId: string) {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)

        if (role === "admin") {
            const totalSiswa = await prisma.account.count({ where: { role: "murid", status: "Aktif" } })

            const hadirToday = await prisma.attendance.count({
                where: { status: "Hadir", date: { gte: today, lt: tomorrow } }
            })
            const alfaToday = await prisma.attendance.count({
                where: { status: "Alfa", date: { gte: today, lt: tomorrow } }
            })

            const hadirYesterday = await prisma.attendance.count({
                where: { status: "Hadir", date: { gte: yesterday, lt: today } }
            })
            const alfaYesterday = await prisma.attendance.count({
                where: { status: "Alfa", date: { gte: yesterday, lt: today } }
            })

            const presenceRate = totalSiswa > 0 ? Math.round((hadirToday / totalSiswa) * 100) : 0
            const presenceRateYesterday = totalSiswa > 0 ? Math.round((hadirYesterday / totalSiswa) * 100) : 0

            const trendHadir = hadirToday - hadirYesterday
            const trendAlfa = alfaToday - alfaYesterday
            const trendRate = presenceRate - presenceRateYesterday

            return {
                success: true,
                data: [
                    { label: "Total Siswa", value: totalSiswa.toString(), icon: "Users", color: "brand", trend: "+0", trendType: "neutral" },
                    { label: "Hadir Hari Ini", value: hadirToday.toString(), icon: "UserCheck", color: "emerald", trend: (trendHadir >= 0 ? "+" : "") + trendHadir, trendType: trendHadir >= 0 ? "up" : "down" },
                    { label: "Alpha/Bolos", value: alfaToday.toString(), icon: "UserX", color: "rose", trend: (trendAlfa >= 0 ? "+" : "") + trendAlfa, trendType: trendAlfa <= 0 ? "up" : "down" }, // Alfa down is "good"
                    { label: "Kehadiran", value: `${presenceRate}%`, icon: "TrendingUp", color: "indigo", trend: (trendRate >= 0 ? "+" : "") + trendRate + "%", trendType: trendRate >= 0 ? "up" : "down" },
                ]
            }
        }

        if (role === "guru") {
            const guru = await prisma.account.findUnique({ where: { id: userId }, select: { studyGroup: true } })
            const rombel = guru?.studyGroup || ""

            const totalSiswa = await prisma.account.count({
                where: { role: "murid", studyGroup: rombel, status: "Aktif" }
            })

            const hadirToday = await prisma.attendance.count({
                where: {
                    status: "Hadir",
                    date: { gte: today, lt: tomorrow },
                    account: { studyGroup: rombel }
                }
            })
            const alfaToday = await prisma.attendance.count({
                where: {
                    status: "Alfa",
                    date: { gte: today, lt: tomorrow },
                    account: { studyGroup: rombel }
                }
            })

            const hadirYesterday = await prisma.attendance.count({
                where: {
                    status: "Hadir",
                    date: { gte: yesterday, lt: today },
                    account: { studyGroup: rombel }
                }
            })
            const alfaYesterday = await prisma.attendance.count({
                where: {
                    status: "Alfa",
                    date: { gte: yesterday, lt: today },
                    account: { studyGroup: rombel }
                }
            })

            const presenceRate = totalSiswa > 0 ? Math.round((hadirToday / totalSiswa) * 100) : 0
            const presenceRateYesterday = totalSiswa > 0 ? Math.round((hadirYesterday / totalSiswa) * 100) : 0

            const trendHadir = hadirToday - hadirYesterday
            const trendAlfa = alfaToday - alfaYesterday
            const trendRate = presenceRate - presenceRateYesterday

            return {
                success: true,
                data: [
                    { label: "Total Siswa", value: totalSiswa.toString(), icon: "Users", trend: "+0", trendType: "neutral", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "Hadir Hari Ini", value: hadirToday.toString(), icon: "UserCheck", trend: (trendHadir >= 0 ? "+" : "") + trendHadir, trendType: trendHadir >= 0 ? "up" : "down", color: "text-brand-500", bg: "bg-brand-500/10", border: "border-brand-500/20" },
                    { label: "Alpha/Bolos", value: alfaToday.toString(), icon: "UserX", trend: (trendAlfa >= 0 ? "+" : "") + trendAlfa, trendType: trendAlfa <= 0 ? "up" : "down", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                    { label: "Tingkat Kehadiran", value: `${presenceRate}%`, icon: "TrendingUp", trend: (trendRate >= 0 ? "+" : "") + trendRate + "%", trendType: trendRate >= 0 ? "up" : "down", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                ]
            }
        }

        if (role === "murid") {
            const attendances = await prisma.attendance.findMany({
                where: { accountId: userId }
            })

            const stats = {
                hadir: attendances.filter(a => a.status === 'Hadir').length,
                sakit: attendances.filter(a => a.status === 'Sakit').length,
                izin: attendances.filter(a => a.status === 'Izin').length,
                alfa: attendances.filter(a => a.status === 'Alfa').length,
            }

            const total = attendances.length
            const rate = total > 0 ? ((stats.hadir / total) * 100).toFixed(1) + "%" : "0%"

            return {
                success: true,
                data: {
                    ...stats,
                    attendanceRate: rate,
                    totalDays: total
                }
            }
        }

        return { success: false, error: "Role tidak valid" }
    } catch (error) {
        console.error("Dashboard Stats Error:", error)
        return { success: false, error: "Gagal memuat statistik" }
    }
}

// Get Attendance History
export async function getAttendanceHistory(userId: string, role: string, limit?: number) {
    try {
        if (role === "murid") {
            const history = await prisma.attendance.findMany({
                where: { accountId: userId },
                orderBy: { date: "desc" },
                ...(limit ? { take: limit } : {})
            })
            return { success: true, data: history }
        }
        // Teachers might want to see recent logs for their class
        return { success: true, data: [] }
    } catch (error) {
        return { success: false, error: "Gagal memuat riwayat" }
    }
}

// Get Overall System History (UpdateHistory) for Admins
export async function getSystemHistory(limit: number = 5) {
    try {
        const history = await prisma.updateHistory.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                account: {
                    select: { name: true, role: true }
                }
            }
        })
        return { success: true, data: history }
    } catch (error) {
        console.error("System History Error:", error)
        return { success: false, error: "Gagal memuat riwayat sistem" }
    }
}

// Get Weekly Attendance Trend (Real Data)
export async function getWeeklyAttendanceTrend(rombel?: string) {
    try {
        const today = new Date()
        const lastWeek = new Date(today)
        lastWeek.setDate(today.getDate() - 7)

        let whereClause: any = {
            date: { gte: lastWeek }
        }

        if (rombel) {
            whereClause.account = { studyGroup: rombel }
        }

        const records = await prisma.attendance.findMany({
            where: whereClause
        })

        const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
        const weekDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]

        const chartData = weekDays.map(day => ({
            name: day,
            hadir: 0,
            sakit: 0,
            izin: 0,
            alfa: 0
        }))

        records.forEach(record => {
            const dayName = dayNames[record.date.getDay()]
            const dayData = chartData.find(d => d.name === dayName)
            if (dayData) {
                const status = record.status.toLowerCase() as keyof typeof dayData
                if (status === "hadir" || status === "sakit" || status === "izin" || status === "alfa") {
                    dayData[status]++
                }
            }
        })

        return {
            success: true,
            data: chartData
        }
    } catch (error) {
        console.error("Trend Error:", error)
        return { success: false, error: "Gagal memuat tren mingguan" }
    }
}

// Verify Login Credentials
export async function verifyLogin(username: string, password: string) {
    try {
        const account = await prisma.account.findFirst({
            where: {
                username: username,
                password: password,
            }
        })

        if (!account) {
            return { success: false, error: "Username atau password salah" }
        }

        if (account.status !== "Aktif") {
            return { success: false, error: "Akun Anda telah dinonaktifkan. Hubungi Admin." }
        }

        return {
            success: true,
            data: {
                role: account.role as "guru" | "murid" | "admin",
                name: account.name,
                id: account.id,
                studyGroup: account.studyGroup || undefined
            }
        }
    } catch (error) {
        console.error("Login Error:", error)
        return { success: false, error: "Terjadi kesalahan sistem saat login" }
    }
}

// Get Students filtered by Guru's Rombel (Study Group)
export async function getStudentsByGuruRombel(guruId: string) {
    try {
        // First get the guru to find their assigned rombel
        const guru = await prisma.account.findUnique({
            where: { id: guruId },
            select: { studyGroup: true }
        })

        if (!guru || !guru.studyGroup) {
            return { success: true, data: [], message: "Guru tidak memiliki Rombel terdaftar" }
        }

        // Get all students in that rombel
        const students = await prisma.account.findMany({
            where: {
                role: "murid",
                studyGroup: guru.studyGroup,
                status: "Aktif"
            },
            orderBy: { name: "asc" }
        })

        return { success: true, data: students }
    } catch (error) {
        console.error("Error fetching filtered students:", error)
        return { success: false, error: "Gagal mengambil daftar murid" }
    }
}

// Save or Update Attendance for a list of students
export async function saveAttendance(attendanceData: { accountId: string, status: string, note?: string, date: string }[]) {
    try {
        const results = await Promise.all(attendanceData.map(async (item) => {
            const attendanceDate = new Date(item.date)
            attendanceDate.setHours(0, 0, 0, 0)

            // Try to find existing record for this student on this date
            const existing = await prisma.attendance.findFirst({
                where: {
                    accountId: item.accountId,
                    date: {
                        gte: attendanceDate,
                        lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
                    }
                }
            })

            if (existing) {
                return prisma.attendance.update({
                    where: { id: existing.id },
                    data: {
                        status: item.status,
                        note: item.note || null,
                        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    } as any
                })
            } else {
                return prisma.attendance.create({
                    data: {
                        accountId: item.accountId,
                        status: item.status,
                        note: item.note || null,
                        date: attendanceDate,
                        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    } as any
                })
            }
        }))

        return { success: true, data: results }
    } catch (error) {
        console.error("Error saving attendance:", error)
        return { success: false, error: "Gagal menyimpan absensi" }
    }
}

// Get attendance for a specific date and rombel
export async function getAttendanceByDateAndRombel(date: string, rombel: string) {
    try {
        const attendanceDate = new Date(date)
        attendanceDate.setHours(0, 0, 0, 0)

        const records = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: attendanceDate,
                    lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
                },
                account: {
                    studyGroup: rombel,
                    role: "murid"
                }
            },
            select: {
                accountId: true,
                status: true,
                note: true
            } as any
        })

        return { success: true, data: records }
    } catch (error) {
        console.error("Error fetching attendance records:", error)
        return { success: false, error: "Gagal mengambil data absensi" }
    }
}

// Get filtered attendance history for Guru and Admin
export async function getFilteredAttendanceHistory(params: { role: string, userId: string, rombel?: string, date?: string }) {
    try {
        const { role, userId, rombel, date } = params
        let whereClause: any = {}

        if (role === "guru") {
            const guru = await prisma.account.findUnique({ where: { id: userId }, select: { studyGroup: true } })
            if (!guru || !guru.studyGroup) return { success: true, data: [] }
            whereClause.account = { studyGroup: guru.studyGroup }
        } else if (role === "admin") {
            if (rombel) {
                whereClause.account = { studyGroup: rombel }
            }
        }

        if (date) {
            const filterDate = new Date(date)
            filterDate.setHours(0, 0, 0, 0)
            whereClause.date = {
                gte: filterDate,
                lt: new Date(filterDate.getTime() + 24 * 60 * 60 * 1000)
            }
        }

        const history = await prisma.attendance.findMany({
            where: whereClause,
            orderBy: { date: "desc" },
            include: {
                account: {
                    select: { name: true, studyGroup: true }
                }
            }
        })

        return { success: true, data: history }
    } catch (error) {
        console.error("Error fetching filtered history:", error)
        return { success: false, error: "Gagal mengambil riwayat absensi" }
    }
}

// Get all unique rombels
export async function getAllRombels() {
    try {
        const rombels = await prisma.account.groupBy({
            by: ['studyGroup'],
            where: {
                studyGroup: { not: null },
                role: "murid"
            }
        })
        return { success: true, data: rombels.map(r => r.studyGroup).filter(Boolean) }
    } catch (error) {
        return { success: false, error: "Gagal mengambil daftar rombel" }
    }
}
