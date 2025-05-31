import { FC } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus, Shield, ShieldOff } from 'lucide-react'

// Test mode flag - set to true to use mock data
const TEST_MODE = true

// Mock data for testing
const MOCK_USERS = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'User',
        status: 'Active',
        lastLogin: '2024-03-20 09:30 AM'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Admin',
        status: 'Active',
        lastLogin: '2024-03-20 10:15 AM'
    },
    {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        role: 'User',
        status: 'Inactive',
        lastLogin: '2024-03-19 03:45 PM'
    },
    {
        id: 4,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        role: 'User',
        status: 'Active',
        lastLogin: '2024-03-20 11:20 AM'
    },
    {
        id: 5,
        name: 'David Brown',
        email: 'david.brown@example.com',
        role: 'User',
        status: 'Inactive',
        lastLogin: '2024-03-18 02:15 PM'
    }
]

type User = typeof MOCK_USERS[0]

const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                row.original.role === 'Admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
            }`}>
                {row.original.role}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                row.original.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
            }`}>
                {row.original.status}
            </span>
        ),
    },
    {
        accessorKey: 'lastLogin',
        header: 'Last Login',
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <Button variant="ghost" size="icon">
                {row.original.role === 'Admin' ? (
                    <ShieldOff className="h-4 w-4" />
                ) : (
                    <Shield className="h-4 w-4" />
                )}
            </Button>
        ),
    },
]

export const Users: FC = () => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">User Management</h3>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={MOCK_USERS}
                searchKey="name"
            />
        </div>
    )
} 