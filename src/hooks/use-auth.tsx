"use client"

import * as React from "react"

export type UserRole = "guru" | "murid" | "admin" | null

interface UserData {
    id: string
    role: UserRole
    name: string
    studyGroup?: string
}

interface AuthContextType {
    user: UserData | null
    login: (userData: UserData) => void
    logout: () => void
    isGuru: () => boolean
    isMurid: () => boolean
    isAdmin: () => boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<UserData | null>(null)

    // Load user data from localStorage on mount
    React.useEffect(() => {
        const savedUser = localStorage.getItem("userData")
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) {
                localStorage.removeItem("userData")
            }
        }
    }, [])

    const login = (userData: UserData) => {
        setUser(userData)
        localStorage.setItem("userData", JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("userData")
    }

    const isGuru = () => user?.role === "guru"
    const isMurid = () => user?.role === "murid"
    const isAdmin = () => user?.role === "admin"

    return (
        <AuthContext.Provider value={{ user, login, logout, isGuru, isMurid, isAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
