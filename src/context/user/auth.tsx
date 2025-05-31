import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export interface User {
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
    role: 'User' | 'Admin'
    status: 'Active' | 'Inactive'
    lastLogin: string
    createdAt: string
    avatarUrl?: string
}

interface LoginRequest {
    email: string
    password: string
}

interface LoginResponse {
    user: User
    token: string
}

interface UserAuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (firstName: string, lastName: string, username: string, email: string, password: string) => Promise<void>
    logout: () => void
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const initializeUserAuth = async () => {
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    const response = await api.get<User>('/api/users/me')
                    setUser(response.data)
                }
            } catch (error) {
                console.error('UserAuth initialization error:', error)
                localStorage.removeItem('token')
            } finally {
                setIsLoading(false)
            }
        }

        initializeUserAuth()
    }, [])

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post<LoginResponse>('/api/auth/login', {
                email,
                password
            })
            const { user: userData, token } = response.data
            setUser(userData)
            localStorage.setItem('token', token)
            toast.success(`Welcome back, ${userData.firstName}!`)
            navigate('/')
        } catch (error) {
            toast.error('Invalid credentials. Please try again.')
            throw error
        }
    }

    const register = async (
        firstName: string,
        lastName: string,
        username: string,
        email: string,
        password: string
    ) => {
        try {
            const response = await api.post<User>('/api/users', {
                firstName,
                lastName,
                username,
                email,
                password,
                role: 'User',
                status: 'Active'
            })
            await login(email, password)
        } catch (error) {
            toast.error('Registration failed. Please try again.')
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        toast.success('Logged out successfully')
        navigate('/login')
    }

    if (isLoading) {
        return <div>Loading...</div> // You can replace this with a proper loading component
    }

    return (
        <UserAuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout
            }}
        >
            {children}
        </UserAuthContext.Provider>
    )
}

export function useUserAuth() {
    const context = useContext(UserAuthContext)
    if (context === undefined) {
        throw new Error('useUserAuth must be used within a UserAuthProvider')
    }
    return context
}
