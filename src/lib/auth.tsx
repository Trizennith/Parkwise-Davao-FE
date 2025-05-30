import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu'

// Test mode flag - set to true to use mock data
const TEST_MODE = true

// Mock users data for testing
const MOCK_USERS = {
  admin: {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    is_staff: true,
    password: 'admin123'
  },
  user: {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    is_staff: false,
    password: 'user123'
  },
  staff: {
    id: 3,
    username: 'staff',
    email: 'staff@example.com',
    is_staff: true,
    password: 'staff123'
  }
} as const

interface User {
  id: number
  username: string
  email: string
  is_staff: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (TEST_MODE) {
          // In test mode, check if there's a stored test user
          const storedTestUser = localStorage.getItem('test_user')
          if (storedTestUser) {
            const { username, password } = JSON.parse(storedTestUser)
            const mockUser = Object.values(MOCK_USERS).find(
              u => u.username === username && u.password === password
            )
            if (mockUser) {
              const { password: _, ...userWithoutPassword } = mockUser
              setUser(userWithoutPassword)
            }
          }
        } else {
          const token = localStorage.getItem('token')
          if (token) {
            const response = await api.get('/api/accounts/users/me/')
            setUser(response.data as User)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (!TEST_MODE) {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      if (TEST_MODE) {
        const mockUser = Object.values(MOCK_USERS).find(
          u => u.username === username && u.password === password
        )

        if (!mockUser) {
          toast.error('Invalid test credentials. Try admin/admin123, user/user123, or staff/staff123')
          throw new Error('Invalid test credentials')
        }

        // Store test user credentials
        localStorage.setItem('test_user', JSON.stringify({ username, password }))
        
        // Remove password from user object before setting state
        const { password: _, ...userWithoutPassword } = mockUser
        setUser(userWithoutPassword)
        
        toast.success(`Welcome back, ${mockUser.username}! (TEST MODE)`)
        navigate('/')
        return
      }

      const response = await api.post('/api/token/', { username, password })
      const { access, refresh } = response.data as { access: string; refresh: string }
      localStorage.setItem('token', access)
      localStorage.setItem('refresh_token', refresh)
      
      const userResponse = await api.get('/api/accounts/users/me/')
      setUser(userResponse.data as User)
      
      toast.success('You have been logged in successfully.')
      
      navigate('/')
    } catch (error) {
      toast.error('Invalid credentials. Please try again.')
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      if (TEST_MODE) {
        // In test mode, check if username already exists
        if (Object.values(MOCK_USERS).some(u => u.username === username)) {
          toast.error('Username already exists in test mode')
          throw new Error('Username already exists')
        }

        // Create new mock user
        const newUser = {
          id: Object.keys(MOCK_USERS).length + 1,
          username,
          email,
          is_staff: false,
          password
        }

        // Store test user credentials
        localStorage.setItem('test_user', JSON.stringify({ username, password }))
        
        // Remove password from user object before setting state
        const { password: _, ...userWithoutPassword } = newUser
        setUser(userWithoutPassword)
        
        toast.success('Registration successful (TEST MODE)')
        navigate('/')
        return
      }

      await api.post('/api/accounts/users/', { username, email, password })
      await login(username, password)
    } catch (error) {
      toast.error('Registration failed. Please try again.')
      throw error
    }
  }

  const logout = () => {
    if (TEST_MODE) {
      localStorage.removeItem('test_user')
      setUser(null)
      navigate('/login')
      return
    }

    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    navigate('/login')
  }

  if (isLoading) {
    return <div>Loading...</div> // You can replace this with a proper loading component
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink>...</NavigationMenuLink>
          </NavigationMenuItem>
          {/* ... other menu items */}
        </NavigationMenuList>
      </NavigationMenu>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 