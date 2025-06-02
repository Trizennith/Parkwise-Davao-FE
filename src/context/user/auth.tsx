import { createContext, useContext, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/apis/api.base'
import { API_ENDPOINTS, LoginResponse, User } from '@/lib/apis/api.constants'


interface AuthContextType {
    user: User | null
    setUser: (user: User | null) => void
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const UserAuthContext = createContext<AuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
                email,
                password
            })
            const { access, refresh } = response.data

            // Set the tokens in localStorage and API headers
            localStorage.setItem('user_token', access)
            localStorage.setItem('user_refresh_token', refresh)
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`

            // Fetch user profile
            const profileResponse = await api.get<User>(API_ENDPOINTS.USER.PROFILE)
            const userData = profileResponse.data
          
            // Verify that the user is not an admin
            if (userData.role !== 'user') {
                throw new Error('Unauthorized access')
            }

            setUser(userData)
            toast.success(`Welcome back, ${userData.username}!`)
            navigate('/user')
        } catch (error) {
            console.error('Login failed:', error)
            toast.error('Invalid credentials')
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            // Call logout endpoint to blacklist the token
            await api.post(API_ENDPOINTS.AUTH.LOGOUT)
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            localStorage.removeItem('user_token')
            localStorage.removeItem('user_refresh_token')
            delete api.defaults.headers.common['Authorization']
            setUser(null)
            navigate('/login')
        }
    }

    return (
        <UserAuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
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
