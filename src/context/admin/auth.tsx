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
        username:'AdminUser',
        email: 'admin@example.com',
        userType: 'super_admin',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    moderator: {
        id: 2,
        username: 'ModeratorUser',
        email: 'moderator@example.com',
        userType: 'moderator',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator'
    }
} as const

export interface AdminUser {
    id: number
    username: string
    email: string
    userType: 'super_admin' | 'moderator'
    avatarUrl?: string
}

interface LoginRequest {
    email: string
    password: string
}

interface AdminAuthResponse {
    admin: AdminUser
    token: string
}

interface AdminAuthContextType {
    admin: AdminUser | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('admin_token')
                if (token) {
                    // Set the token in the API headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                    
                    const response = await api.get<AdminAuthResponse>('/api/admin/me')
                    setAdmin(response.data.admin)
                }
            } catch (error) {
                console.error('Auth check failed:', error)
                localStorage.removeItem('admin_token')
                delete api.defaults.headers.common['Authorization']
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const response = await api.post<AdminAuthResponse>('/api/admin/login', {
                email,
                password
            })
            const { admin: adminData, token } = response.data
            
            // Set the token in localStorage and API headers
            localStorage.setItem('admin_token', token)
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            setAdmin(adminData)
            toast.success(`Welcome back, ${adminData.username}!`)
            navigate('/admin')
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
        localStorage.removeItem('admin_token')
        delete api.defaults.headers.common['Authorization']
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