import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { UserAuthProvider } from '@/context/user/auth'
import Layout from '@/layout/layout'
import UserDashboardLayout from '@/layout/dashboard-layout'
import AdminLayout from '@/layout/admin-layout'
import UserPrivateRoute from '@/components/user/private-route'
import Login from '@/pages/user/auth/login'
import Register from '@/pages/user/auth/register'
import UserDashboard from '@/pages/user/dashboard'
import AdminDashboard from '@/pages/admin/dashboard'
import AdminPrivateRoute from '@/components/admin/private-route'
import { AdminAuthProvider } from './context/admin/auth'

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route element={<Layout />}>
                            <Route
                                element={
                                    <UserAuthProvider>
                                        <UserPrivateRoute />
                                    </UserAuthProvider>
                                }
                            >
                                {/* User Routes */}
                                <Route path="/user" element={<UserDashboardLayout />}>
                                    <Route index element={<UserDashboard />} />
                                </Route>
                            </Route>

                            <Route
                                element={
                                    <AdminAuthProvider>
                                        <AdminPrivateRoute />
                                    </AdminAuthProvider>
                                }
                            >
                                {/* Admin Routes */}
                                <Route path="/admin" element={<AdminLayout />}>
                                    <Route index element={<AdminDashboard />} />
                                </Route>
                            </Route>
                        </Route>
                    </Routes>
                    <Toaster />
                </Router>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App
