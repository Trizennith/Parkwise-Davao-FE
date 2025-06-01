import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface User {
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
    role: 'User' | 'Admin'
    status: 'Active' | 'Inactive'
    lastLogin: string
    createdAt: string
    avatarUrl: string
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
    register: (
        firstName: string,
        lastName: string,
        username: string,
        email: string,
        password: string
    ) => Promise<void>
    logout: () => void
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    // Set the token in the API headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

                    const response = await api.get<User>('/api/users/me')
                    setUser(response.data)
                }
            } catch (error) {
                console.error('Auth check failed:', error)
                localStorage.removeItem('token')
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
            const response = await api.post<LoginResponse>('/api/user/login', {
                email,
                password
            })
            const { user: userData, token } = response.data

            // Set the token in localStorage and API headers
            localStorage.setItem('token', token)
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setUser(userData)
            toast.success(`Welcome back, ${userData.firstName}!`)
            navigate('/user')
        } catch (error) {
            console.error('Login failed:', error)
            toast.error('Invalid credentials')
            throw error
        } finally {
            setIsLoading(false)
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
            await api.post<User>('/api/users', {
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
        setUser(null)
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        toast.success('Logged out successfully')
        navigate('/login')
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
