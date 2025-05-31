import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/context/auth'
import Layout from '@/layout/layout'
import PrivateRoute from '@/components/private-route'
import Login from '@/pages/auth/login'
import Register from '@/pages/auth/register'
import Dashboard from '@/pages/dashboard/dashboard_'
import ParkingLots from '@/pages/parking-lots'
import Reservations from '@/pages/reservations'
import Profile from '@/pages/profile'

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
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/parking-lots" element={<ParkingLots />} />
                                    <Route path="/reservations" element={<Reservations />} />
                                    <Route path="/profile" element={<Profile />} />
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
