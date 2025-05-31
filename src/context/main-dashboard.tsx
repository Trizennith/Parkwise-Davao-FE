import { createContext, useContext, useState, ReactNode, FC, useMemo } from 'react'
import { useEffect } from 'react'

export type DashboardSection =
    | 'overview'
    | 'parking-lots'
    | 'reservations'
    | 'profile'
    | 'admin-users'
    | 'admin-settings'
    | 'admin-reports'

export interface DashboardHeaderTitle {
    title: string
    description: string
}

interface DashboardContextType {
    activeSection: DashboardSection
    isAdmin: boolean,
    headerTitle: DashboardHeaderTitle
    setActiveSection: (section: DashboardSection) => void
    setIsAdmin: (isAdmin: boolean) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

const DashboardProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
    const [isAdmin, setIsAdmin] = useState(false)
    const [headerTitle, setHeaderTitle] = useState<DashboardHeaderTitle>({
        title: '',
        description: ''
    })

    useEffect(() => {
        setHeaderTitle({
            title: import.meta.env.VITE_APP_TITLE || '',
            description: import.meta.env.VITE_SHORT_APP_DESC || ''
        })
    }, [])

    return (
        <DashboardContext.Provider
            value={useMemo(
                () => ({ activeSection, setActiveSection, isAdmin, setIsAdmin, headerTitle }),
                [activeSection, isAdmin, headerTitle]
            )}
        >
            {children}
        </DashboardContext.Provider>
    )
}

const useDashboard = (): DashboardContextType => {
    const context = useContext(DashboardContext)
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider')
    }
    return context
}

const sectionTitles: Record<DashboardSection, string> = {
    overview: 'Dashboard Overview',
    'parking-lots': 'Parking Lots',
    reservations: 'Reservations',
    profile: 'Profile',
    'admin-users': 'User Management',
    'admin-settings': 'System Settings',
    'admin-reports': 'Reports & Analytics'
}

const sectionDescriptions: Record<DashboardSection, string> = {
    overview: 'View your dashboard overview and quick actions',
    'parking-lots': 'Manage and view parking lot information',
    reservations: 'View and manage your parking reservations',
    profile: 'Manage your account settings and preferences',
    'admin-users': 'Manage system users and permissions',
    'admin-settings': 'Configure system settings and preferences',
    'admin-reports': 'View system reports and analytics'
}

// Helper function to check if a section is admin-only
export const isAdminSection = (section: DashboardSection): boolean => section.startsWith('admin-')

// Helper function to get section title
export const getSectionTitle = (section: DashboardSection): string => sectionTitles[section]

// Helper function to get section description
export const getSectionDescription = (section: DashboardSection): string =>
    sectionDescriptions[section]

export { DashboardProvider, useDashboard }
