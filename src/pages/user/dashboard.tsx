import { AppSidebar } from '@/components/user-dashboard/app-sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useUserDashboard } from '@/context/user-dashboard'
import ParkingLots from '@/pages/user/sections/parking-lots'
import Reservations from '@/pages/user/sections/reservations'
import Profile from '@/pages/user/sections/profile'

export default function Dashboard() {
    const { activeSection } = useUserDashboard()

    const renderContent = () => {
        switch (activeSection) {
            case 'parking-lots':
                return <ParkingLots />
            case 'reservations':
                return <Reservations />
            case 'profile':
                return <Profile />
            case 'overview':
            default:
                return (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                            <p className="text-muted-foreground">
                                Welcome to your parking dashboard
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="col-span-1">
                                <h2 className="text-xl font-semibold mb-4">Recent Reservations</h2>
                                <Reservations />
                            </div>
                            <div className="col-span-1">
                                <h2 className="text-xl font-semibold mb-4">
                                    Available Parking Lots
                                </h2>
                                <ParkingLots />
                            </div>
                        </div>
                    </div>
                )
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
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
                    {/* <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
