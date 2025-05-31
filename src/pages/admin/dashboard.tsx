import { AdminDashboardSection, useAdminDashboard } from '@/context/admin/dashboard'
import { ParkingLots } from '@/components/admin/sections/parking-lots'
import { Reservations } from '@/components/admin/sections/reservations'
import { Users } from '@/components/admin/sections/users'
import { Reports } from '@/components/admin/sections/reports'
import { Settings } from '@/components/admin/sections/settings'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar, AppSidebarNavigationType } from '@/components/user/app-sidebar'
import { Separator } from '@radix-ui/react-separator'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { useAdminAuth } from '@/context/admin/auth'
import { SquareTerminal } from 'lucide-react'

const nav = [
    {
        title: 'Access',
        icon: SquareTerminal,
        isActive: true,
        items: [
            {
                title: 'Overview',
                section: 'overview'
            },
            {
                title: 'Parking Lots',
                section: 'parking-lots'
            },
            {
                title: 'Reservations',
                section: 'reservations'
            },
            {
                title: 'Users',
                section: 'users'
            },
            {
                title: 'Reports',
                section: 'reports'
            },
            {
                title: 'Settings',
                section: 'settings'
            }
        ]
    }
] as AppSidebarNavigationType<AdminDashboardSection>[]
export default function AdminDashboard() {
    const { activeSection, setActiveSection, headerTitle } = useAdminDashboard()
    const { admin } = useAdminAuth()

    const renderContent = () => {
        switch (activeSection) {
            case 'parking-lots':
                return <ParkingLots />
            case 'reservations':
                return <Reservations />
            case 'users':
                return <Users />
            case 'reports':
                return <Reports />
            case 'settings':
                return <Settings />
            case 'overview':
            default:
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Manage your parking system</p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="col-span-1">
                                <h2 className="text-xl font-semibold mb-4">Recent Reservations</h2>
                                <Reservations />
                            </div>
                            <div className="col-span-1">
                                <h2 className="text-xl font-semibold mb-4">Parking Locations</h2>
                                <ParkingLots />
                            </div>
                            <div className="col-span-1">
                                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                                <Users />
                            </div>
                        </div>
                    </div>
                )
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar
                navigation={nav}
                user={{
                    username: admin?.username || 'Admin',
                    email: admin?.email || 'admin@example.com',
                    avatarUrl: admin?.avatarUrl || '/avatars/default.jpg',
                    userType: admin?.userType || 'Admin'
                }}
                header={headerTitle}
                activeSection={activeSection}
                updateSection={(section: AdminDashboardSection) => {
                    setActiveSection(section)
                }}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Building Your Application
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{activeSection}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                        <div>{renderContent()}</div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
