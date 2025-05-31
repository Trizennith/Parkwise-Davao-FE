import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'

// Test mode flag - set to true to use mock data
const TEST_MODE = true

// Mock admin data for testing
const MOCK_ADMINS = {
    admin: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'super_admin',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    moderator: {
        id: 2,
        username: 'moderator',
        email: 'moderator@example.com',
        role: 'moderator',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator'
    }
} as const

export interface AdminUser {
    id: number
    username: string
    email: string
    role: 'super_admin' | 'moderator'
    avatarUrl?: string
}

interface AdminAuthResponse {
    admin: AdminUser
    token: string
}

interface AdminAuthContextType {
    admin: AdminUser | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        // Check for existing session
        const checkAuth = async () => {
            try {
                if (TEST_MODE) {
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    const storedAdmin = localStorage.getItem('admin')
                    if (storedAdmin) {
                        setAdmin(JSON.parse(storedAdmin))
                    }
                } else {
                    const response = await api.get<AdminUser>('/api/admin/me')
                    setAdmin(response.data)
                }
            } catch (error) {
                console.error('Auth check failed:', error)
                // Clear any invalid session data
                localStorage.removeItem('admin')
                localStorage.removeItem('admin_token')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (username: string, password: string) => {
        try {
            setIsLoading(true)
            if (TEST_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // Mock login logic
                if (username === 'admin' && password === 'admin123') {
                    const adminData = MOCK_ADMINS.admin
                    setAdmin(adminData)
                    localStorage.setItem('admin', JSON.stringify(adminData))
                    toast.success('Welcome back, Admin!')
                    navigate('/admin')
                } else if (username === 'moderator' && password === 'mod123') {
                    const adminData = MOCK_ADMINS.moderator
                    setAdmin(adminData)
                    localStorage.setItem('admin', JSON.stringify(adminData))
                    toast.success('Welcome back, Moderator!')
                    navigate('/admin')
                } else {
                    throw new Error('Invalid credentials')
                }
            } else {
                const response = await api.post<AdminAuthResponse>('/api/admin/login', {
                    username,
                    password
                })
                const { admin: adminData, token } = response.data
                setAdmin(adminData)
                localStorage.setItem('admin_token', token)
                toast.success('Welcome back!')
                navigate('/admin')
            }
        } catch (error) {
            console.error('Login failed:', error)
            toast.error('Invalid credentials')
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        setAdmin(null)
        localStorage.removeItem('admin')
        localStorage.removeItem('admin_token')
        toast.success('Logged out successfully')
        navigate('/admin/login')
    }

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                isAuthenticated: !!admin,
                isLoading,
                login,
                logout
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    )
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext)
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider')
    }
    return context
} 