import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/context/auth'
import Layout from '@/layout/layout'
import UserDashboardLayout from '@/layout/dashboard-layout'
import PrivateRoute from '@/components/private-route'
import Login from '@/pages/auth/login'
import Register from '@/pages/auth/register'
import UserDashboard from '@/pages/user/dashboard'

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <Router>
                    <AuthProvider>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route element={<Layout />}>
                                <Route element={<PrivateRoute />}>
                                    <Route element={<UserDashboardLayout />}>
                                        <Route path="/" element={<UserDashboard />} />
                                    </Route>
                                </Route>
                            </Route>
                        </Routes>
                        <Toaster />
                    </AuthProvider>
                </Router>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App
