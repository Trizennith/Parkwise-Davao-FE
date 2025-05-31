import { http, HttpResponse } from 'msw'

interface LoginRequest {
    email: string
    password: string
}

interface User {
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
    role: 'User' | 'Admin'
    status: 'Active' | 'Inactive'
    lastLogin: string
    createdAt: string
}

interface CreateUserRequest {
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
    role: 'User' | 'Admin'
    status: 'Active' | 'Inactive'
}

interface UpdateUserRequest {
    firstName?: string
    lastName?: string
    username?: string
    email?: string
    password?: string
    role?: 'User' | 'Admin'
    status?: 'Active' | 'Inactive'
}

interface LoginResponse {
    user: {
        id: number
        firstName: string
        lastName: string
        username: string
        email: string
        role: 'User' | 'Admin'
        status: 'Active' | 'Inactive'
        avatarUrl: string
    }
    token: string
}

interface AdminLoginResponse {
    admin: {
        id: number
        username: string
        email: string
        userType: 'super_admin' | 'moderator'
        avatarUrl: string
    }
    token: string
}

// Mock data
const mockParkingLots = [
    {
        id: '1',
        name: 'SM City Parking',
        location: {
            lat: 7.0731,
            lng: 125.6123
        },
        address: 'Quimpo Blvd, Davao City',
        totalSpaces: 500,
        availableSpaces: 150,
        status: 'active'
    },
    {
        id: '2',
        name: 'Abreeza Mall Parking',
        location: {
            lat: 7.0689,
            lng: 125.6087
        },
        address: 'J.P. Laurel Ave, Davao City',
        totalSpaces: 300,
        availableSpaces: 50,
        status: 'active'
    },
    {
        id: '3',
        name: 'Gaisano Mall Parking',
        location: {
            lat: 7.0725,
            lng: 125.6135
        },
        address: 'Bajada, Davao City',
        totalSpaces: 400,
        availableSpaces: 0,
        status: 'maintenance'
    }
]

// Mock data for reservations
const mockReservations = [
    {
        id: '1',
        parkingLotId: '1',
        parkingLotName: 'SM City Parking',
        userId: 'user1',
        userName: 'John Doe',
        vehiclePlate: 'ABC123',
        startTime: '2024-03-20T08:00:00Z',
        endTime: '2024-03-20T10:00:00Z',
        status: 'active',
        createdAt: '2024-03-19T15:00:00Z'
    },
    {
        id: '2',
        parkingLotId: '2',
        parkingLotName: 'Abreeza Mall Parking',
        userId: 'user2',
        userName: 'Jane Smith',
        vehiclePlate: 'XYZ789',
        startTime: '2024-03-20T09:00:00Z',
        endTime: '2024-03-20T11:00:00Z',
        status: 'completed',
        createdAt: '2024-03-19T16:00:00Z'
    },
    {
        id: '3',
        parkingLotId: '3',
        parkingLotName: 'Gaisano Mall Parking',
        userId: 'user3',
        userName: 'Mike Johnson',
        vehiclePlate: 'DEF456',
        startTime: '2024-03-20T10:00:00Z',
        endTime: '2024-03-20T12:00:00Z',
        status: 'cancelled',
        createdAt: '2024-03-19T17:00:00Z'
    }
]

// Mock data for reports
const mockReportSummary = {
    totalRevenue: 150000,
    dailyReservations: 45,
    parkingUtilization: 75,
    averageDuration: 2.5,
    revenueChange: 12,
    reservationChange: 8,
    utilizationChange: 5,
    durationChange: 0.5
}

const mockDailyReservations = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    reservations: Math.floor(Math.random() * 50) + 20
}))

const mockRevenueData = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
    revenue: Math.floor(Math.random() * 50000) + 100000
}))

const mockPeakHours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    usage: Math.floor(Math.random() * 40) + 20
}))

const mockUserDemographics = [
    { name: 'Regular Users', value: 65 },
    { name: 'Premium Users', value: 25 },
    { name: 'Staff', value: 10 }
]

// Mock data for users
const mockUsers: User[] = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        role: 'User',
        status: 'Active',
        lastLogin: '2024-03-20T09:30:00Z',
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane.smith@example.com',
        role: 'Admin',
        status: 'Active',
        lastLogin: '2024-03-20T10:15:00Z',
        createdAt: '2024-01-02T00:00:00Z'
    },
    {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        username: 'mikejohnson',
        email: 'mike.johnson@example.com',
        role: 'User',
        status: 'Inactive',
        lastLogin: '2024-03-19T15:45:00Z',
        createdAt: '2024-01-03T00:00:00Z'
    },
    {
        id: 4,
        firstName: 'Sarah',
        lastName: 'Wilson',
        username: 'sarahwilson',
        email: 'sarah.wilson@example.com',
        role: 'User',
        status: 'Active',
        lastLogin: '2024-03-20T11:20:00Z',
        createdAt: '2024-01-04T00:00:00Z'
    },
    {
        id: 5,
        firstName: 'David',
        lastName: 'Brown',
        username: 'davidbrown',
        email: 'david.brown@example.com',
        role: 'User',
        status: 'Inactive',
        lastLogin: '2024-03-18T14:15:00Z',
        createdAt: '2024-01-05T00:00:00Z'
    }
]

// Create mutable copies of the mock data
let parkingLots = [...mockParkingLots]
let reservations = [...mockReservations]
let users = [...mockUsers]

export const handlers = [
    // Get all parking lots
    http.get('*/api/parking-lots', () => {
        return HttpResponse.json(parkingLots)
    }),

    // Get a single parking lot
    http.get('*/api/parking-lots/:id', ({ params }) => {
        const lot = parkingLots.find(lot => lot.id === params.id)
        if (!lot) {
            return new HttpResponse(null, { status: 404 })
        }
        return HttpResponse.json(lot)
    }),

    // Create a new parking lot
    http.post('*/api/parking-lots', async ({ request }) => {
        const newLot = await request.json()
        const createdLot = {
            ...newLot,
            id: Math.random().toString(36).substr(2, 9)
        }
        parkingLots.push(createdLot)
        return HttpResponse.json(createdLot, { status: 201 })
    }),

    // Update a parking lot
    http.patch('*/api/parking-lots/:id', async ({ params, request }) => {
        const updates = await request.json()
        const index = parkingLots.findIndex(lot => lot.id === params.id)
        
        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        parkingLots[index] = { ...parkingLots[index], ...updates }
        return HttpResponse.json(parkingLots[index])
    }),

    // Delete a parking lot
    http.delete('*/api/parking-lots/:id', ({ params }) => {
        const index = parkingLots.findIndex(lot => lot.id === params.id)
        
        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        parkingLots.splice(index, 1)
        return new HttpResponse(null, { status: 204 })
    }),

    // Get all reservations
    http.get('*/api/reservations', () => {
        return HttpResponse.json(reservations)
    }),

    // Get a single reservation
    http.get('*/api/reservations/:id', ({ params }) => {
        const reservation = reservations.find(res => res.id === params.id)
        if (!reservation) {
            return new HttpResponse(null, { status: 404 })
        }
        return HttpResponse.json(reservation)
    }),

    // Create a new reservation
    http.post('*/api/reservations', async ({ request }) => {
        const newReservation = await request.json()
        const createdReservation = {
            ...newReservation,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        }
        reservations.push(createdReservation)
        return HttpResponse.json(createdReservation, { status: 201 })
    }),

    // Update a reservation
    http.patch('*/api/reservations/:id', async ({ params, request }) => {
        const updates = await request.json()
        const index = reservations.findIndex(res => res.id === params.id)
        
        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        reservations[index] = { ...reservations[index], ...updates }
        return HttpResponse.json(reservations[index])
    }),

    // Delete a reservation
    http.delete('*/api/reservations/:id', ({ params }) => {
        const index = reservations.findIndex(res => res.id === params.id)
        
        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        reservations.splice(index, 1)
        return new HttpResponse(null, { status: 204 })
    }),

    // Get report summary
    http.get('*/api/reports/summary', () => {
        return HttpResponse.json(mockReportSummary)
    }),

    // Get daily reservations
    http.get('*/api/reports/daily-reservations', () => {
        return HttpResponse.json(mockDailyReservations)
    }),

    // Get revenue data
    http.get('*/api/reports/revenue', () => {
        return HttpResponse.json(mockRevenueData)
    }),

    // Get peak hours data
    http.get('*/api/reports/peak-hours', () => {
        return HttpResponse.json(mockPeakHours)
    }),

    // Get user demographics
    http.get('*/api/reports/user-demographics', () => {
        return HttpResponse.json(mockUserDemographics)
    }),

    // Get all users
    http.get('*/api/users', () => {
        return HttpResponse.json<User[]>(users)
    }),

    // Get a single user
    http.get('*/api/users/:id', ({ params }) => {
        const user = users.find(user => user.id === Number(params.id))
        if (!user) {
            return new HttpResponse(null, { status: 404 })
        }
        return HttpResponse.json<User>(user)
    }),

    // Create a new user
    http.post('*/api/users', async ({ request }) => {
        const newUser = await request.json() as CreateUserRequest
        const createdUser: User = {
            id: users.length + 1,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        }
        users.push(createdUser)
        return HttpResponse.json<User>(createdUser, { status: 201 })
    }),

    // Update a user
    http.patch('*/api/users/:id', async ({ params, request }) => {
        const updates = await request.json() as UpdateUserRequest
        const index = users.findIndex(user => user.id === Number(params.id))
        
        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        const currentUser = users[index]
        const updatedUser: User = {
            id: currentUser.id,
            firstName: updates.firstName ?? currentUser.firstName,
            lastName: updates.lastName ?? currentUser.lastName,
            username: updates.username ?? currentUser.username,
            email: updates.email ?? currentUser.email,
            role: updates.role ?? currentUser.role,
            status: updates.status ?? currentUser.status,
            lastLogin: currentUser.lastLogin,
            createdAt: currentUser.createdAt
        }
        users[index] = updatedUser
        return HttpResponse.json<User>(updatedUser)
    }),

    // Delete a user
    http.delete('*/api/users/:id', ({ params }) => {
        const index = users.findIndex(user => user.id === Number(params.id))
        
        if (index === -1) {
            return new HttpResponse(null, { status: 404 })
        }

        users.splice(index, 1)
        return new HttpResponse(null, { status: 204 })
    }),

    // Admin login
    http.post('*/api/admin/login', async ({ request }) => {
        const { email, password } = await request.json() as LoginRequest
        
        if (email === 'admin@example.com' && password === 'admin123') {
            const response: AdminLoginResponse = {
                admin: {
                    id: 1,
                    username: 'AdminUser',
                    email: 'admin@example.com',
                    userType: 'super_admin',
                    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
                },
                token: 'mock-admin-token'
            }
            return HttpResponse.json<AdminLoginResponse>(response)
        } else if (email === 'moderator@example.com' && password === 'mod123') {
            const response: AdminLoginResponse = {
                admin: {
                    id: 2,
                    username: 'ModeratorUser',
                    email: 'moderator@example.com',
                    userType: 'moderator',
                    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator'
                },
                token: 'mock-moderator-token'
            }
            return HttpResponse.json<AdminLoginResponse>(response)
        }
        
        return new HttpResponse(null, { status: 401 })
    }),

    // User login
    http.post('*/api/auth/login', async ({ request }) => {
        const { email, password } = await request.json() as LoginRequest
        
        const user = users.find(u => u.email === email)
        if (!user || password !== 'password123') {
            return new HttpResponse(null, { status: 401 })
        }

        const response: LoginResponse = {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
            },
            token: 'mock-user-token'
        }
        return HttpResponse.json<LoginResponse>(response)
    }),

    // Get current user
    http.get('*/api/users/me', ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token || token !== 'mock-user-token') {
            return new HttpResponse(null, { status: 401 })
        }

        // Find the user from our mock data
        const user = users[0] // For demo, we'll return the first user
        if (!user) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json<User>(user)
    }),

    // Get current admin
    http.get('*/api/admin/me', ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token || token !== 'mock-admin-token') {
            return new HttpResponse(null, { status: 401 })
        }

        const response: AdminLoginResponse = {
            admin: {
                id: 1,
                username: 'AdminUser',
                email: 'admin@example.com',
                userType: 'super_admin',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
            },
            token: 'mock-admin-token'
        }
        return HttpResponse.json<AdminLoginResponse>(response)
    })
] 