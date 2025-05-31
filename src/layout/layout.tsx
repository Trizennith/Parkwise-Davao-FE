import { ModeToggle } from '@/components/mode-toggle'
import { Outlet } from 'react-router-dom'

export default function Layout() {
    return (
        <div className="min-h-screen relative">
            <div className="absolute bottom-0 right-0 p-4 z-50">
                <ModeToggle />
            </div>
            <Outlet />
        </div>
    )
}
