'use client'

import * as React from 'react'
import { Command, Frame, Map, PieChart, SquareTerminal } from 'lucide-react'

import { SectionNavigation } from '@/components/user/nav-main'
import { NavProjects } from '@/components/user/nav-projects'
import { NavUser } from '@/components/user/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail
} from '@/components/ui/sidebar'
import { UserDashboardSection, useUserDashboard } from '@/context/user/dashboard'
import { useUserAuth } from '@/context/user/auth'
import { ModeToggle } from '../mode-toggle'

// This is sample data.
const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg'
    },

    navMain: [
        {
            title: 'Access',
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: 'Overview',
                    section: 'overview' as UserDashboardSection
                },
                {
                    title: 'Parking Lots',
                    section: 'parking-lots' as UserDashboardSection
                },
                {
                    title: 'Reservations',
                    section: 'reservations' as UserDashboardSection
                },
                {
                    title: 'Profile',
                    section: 'profile' as UserDashboardSection
                }
            ]
        }
    ],
    projects: [
        {
            name: 'Design Engineering',
            url: '#',
            icon: Frame
        },
        {
            name: 'Sales & Marketing',
            url: '#',
            icon: PieChart
        },
        {
            name: 'Travel',
            url: '#',
            icon: Map
        }
    ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { headerTitle, updateSection, activeSection } = useUserDashboard()
    const { user } = useUserAuth()
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex flex-row items-center gap-2 mt-2">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
                        <Command className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                        <span className="truncate font-medium">{headerTitle.title}</span>
                        <span className="truncate text-xs">{headerTitle.description}</span>
                    </div>
                    <div className="shrink-0">
                        <ModeToggle />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SectionNavigation
                    currentSection={activeSection}
                    onSectionNavigation={(section) => {
                        updateSection(section)
                    }}
                    items={data.navMain}
                />
                {user?.userType === 'admin' && <NavProjects projects={data.projects} />}
            </SidebarContent>

            <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
