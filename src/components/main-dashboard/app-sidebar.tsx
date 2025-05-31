'use client'

import * as React from 'react'
import { Command, Frame, Map, PieChart, Settings2, SquareTerminal } from 'lucide-react'

import { SectionNavigation } from '@/components/main-dashboard/nav-main'
import { NavProjects } from '@/components/main-dashboard/nav-projects'
import { NavUser } from '@/components/main-dashboard/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail
} from '@/components/ui/sidebar'
import { DashboardSection, useDashboard } from '@/context/main-dashboard'
import { useAuth } from '@/context/auth'

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
                    section: 'overview' as DashboardSection
                },
                {
                    title: 'Parking Lots',
                    section: 'parking-lots' as DashboardSection
                },
                {
                    title: 'Reservations',
                    section: 'reservations' as DashboardSection
                }
            ]
        },
        {
            title: 'Administrative Access',
            icon: Settings2,
            items: [
                {
                    title: 'General',
                    section: '#' as DashboardSection
                },
                {
                    title: 'Team',
                    section: '#' as DashboardSection
                },
                {
                    title: 'Billing',
                    section: '#' as DashboardSection
                },
                {
                    title: 'Limits',
                    section: '#' as DashboardSection
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
    const { headerTitle, updateSection, activeSection } = useDashboard()
    const { user } = useAuth()
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex flex-row gap-2 mt-2">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <Command className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{headerTitle.title}</span>
                        <span className="truncate text-xs">{headerTitle.description}</span>
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
                <NavProjects projects={data.projects} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
