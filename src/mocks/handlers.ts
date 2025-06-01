import { http, HttpResponse } from 'msw'

// Get the API URL from environment variables, with fallback for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Helper function to create URL patterns for both development and production
const createUrlPattern = (path: string) => {
    const basePath = path.startsWith('/') ? path : `/${path}`
    const patterns = [
        `${API_URL}${basePath}`,
        `${API_URL}/api${basePath}`,
        `*/api${basePath}`,
        `*${basePath}`
    ]
    console.log('Generated URL patterns:', patterns)

    return patterns
}

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
    avatarUrl: string
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

interface CreateReservationRequest {
    parkingLotId: string
    startTime: string
    endTime: string
    vehiclePlate: string
}

interface UpdateReservationRequest {
    status: 'active' | 'completed' | 'cancelled'
}

interface ParkingLot {
    id: string
    name: string
    location: {
        lat: number
        lng: number
    }
    address: string
    totalSpaces: number
    availableSpaces: number
    status: 'active' | 'maintenance' | 'closed'
}

// Mock data
const mockParkingLots = [
    {
        id: '1',
        name: 'Downtown Parking',
        location: {
            lat: 7.1907,
            lng: 125.4553
        },
        address: '123 Main St, Davao City',
        totalSpaces: 50,
        availableSpaces: 30,
        status: 'active'
    },
    {
        id: '2',
        name: 'SM Parking',
        location: {
            lat: 7.0873,
            lng: 125.6087
        },
        address: 'SM City Davao, Ecoland',
        totalSpaces: 100,
        availableSpaces: 45,
        status: 'active'
    },
    {
        id: '3',
        name: 'Abreeza Parking',
        location: {
            lat: 7.0833,
            lng: 125.6167
        },
        address: 'Abreeza Mall, Bajada',
        totalSpaces: 75,
        availableSpaces: 0,
        status: 'maintenance'
    }
]

// Mock data for reservations
const mockReservations = [
    {
        id: '1',
        parkingLotId: '1',
        parkingLotName: 'Downtown Parking',
        userId: '1',
        userName: 'John Doe',
        vehiclePlate: 'ABC123',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        parkingLotId: '2',
        parkingLotName: 'SM Parking',
        userId: '1',
        userName: 'John Doe',
        vehiclePlate: 'ABC123',
        startTime: new Date(Date.now() + 7200000).toISOString(),
        endTime: new Date(Date.now() + 10800000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        parkingLotId: '3',
        parkingLotName: 'Abreeza Parking',
        userId: '1',
        userName: 'John Doe',
        vehiclePlate: 'ABC123',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date().toISOString(),
        status: 'completed',
        createdAt: new Date().toISOString()
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
        createdAt: '2024-01-01T00:00:00Z',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe'
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
        createdAt: '2024-01-02T00:00:00Z',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janesmith'
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
        createdAt: '2024-01-03T00:00:00Z',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mikejohnson'
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
        createdAt: '2024-01-04T00:00:00Z',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahwilson'
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
        createdAt: '2024-01-05T00:00:00Z',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=davidbrown'
    }
]

// Create mutable copies of the mock data
const parkingLots = [...mockParkingLots]
const reservations = [...mockReservations]
const users = [...mockUsers]

// Helper function to add CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

// Helper function to create a response with CORS headers
const corsResponse = (response: Response) => {
    const headers = new Headers(response.headers)
    Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value)
    })
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    })
}

export const handlers = [
    // Handle OPTIONS requests for CORS preflight
    http.options('*', () => {
        return new HttpResponse(null, {
            status: 204,
            headers: corsHeaders
        })
    }),

    // Get all parking lots
    ...createUrlPattern('/parking-lots').map((pattern) =>
        http.get(pattern, () => {
            return corsResponse(HttpResponse.json(parkingLots))
        })
    ),

    // Get a single parking lot
    ...createUrlPattern('/parking-lots/:id').map((pattern) =>
        http.get(pattern, ({ params }) => {
            const lot = parkingLots.find((lot) => lot.id === params.id)
            if (!lot) {
                return corsResponse(new HttpResponse(null, { status: 404 }))
            }
            return corsResponse(HttpResponse.json(lot))
        })
    ),

    // Create a new parking lot
    http.post('*/api/parking-lots', async ({ request }) => {
        const newLot = (await request.json()) as ParkingLot
        const createdLot: ParkingLot = {
            id: Math.random().toString(36).substr(2, 9),
            name: newLot.name,
            location: newLot.location,
            address: newLot.address,
            totalSpaces: newLot.totalSpaces,
            availableSpaces: newLot.availableSpaces,
            status: newLot.status as 'active' | 'maintenance'
        }
        parkingLots.push(createdLot)
        return corsResponse(HttpResponse.json(createdLot, { status: 201 }))
    }),

    // Update a parking lot
    http.patch('*/api/parking-lots/:id', async ({ params, request }) => {
        const updates = (await request.json()) as Partial<ParkingLot>
        const index = parkingLots.findIndex((lot) => lot.id === params.id)

        if (index === -1) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }

        const updatedLot: ParkingLot = {
            ...parkingLots[index],
            ...updates,
            status: (updates.status as 'active' | 'maintenance' | 'closed') || parkingLots[index].status
        }
        parkingLots[index] = updatedLot
        return corsResponse(HttpResponse.json(updatedLot))
    }),

    // Delete a parking lot
    http.delete('*/api/parking-lots/:id', ({ params }) => {
        const index = parkingLots.findIndex((lot) => lot.id === params.id)

        if (index === -1) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }

        parkingLots.splice(index, 1)
        return corsResponse(new HttpResponse(null, { status: 204 }))
    }),

    // Get all reservations
    ...createUrlPattern('/reservations').map((pattern) =>
        http.get(pattern, () => {
            return corsResponse(HttpResponse.json(reservations))
        })
    ),

    // Get a single reservation
    ...createUrlPattern('/reservations/:id').map((pattern) =>
        http.get(pattern, ({ params }) => {
            const reservation = reservations.find((res) => res.id === params.id)
            if (!reservation) {
                return corsResponse(new HttpResponse(null, { status: 404 }))
            }
            return corsResponse(HttpResponse.json(reservation))
        })
    ),

    // Create a new reservation
    http.post('*/api/reservations', async ({ request }) => {
        const body = (await request.json()) as CreateReservationRequest
        const { parkingLotId, startTime, endTime, vehiclePlate } = body

        const parkingLot = parkingLots.find((lot) => lot.id === parkingLotId)
        if (!parkingLot) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }

        if (parkingLot.availableSpaces === 0) {
            return corsResponse(new HttpResponse(null, { status: 400 }))
        }

        const newReservation = {
            id: String(reservations.length + 1),
            parkingLotId,
            parkingLotName: parkingLot.name,
            userId: '1', // This should come from the authenticated user
            userName: 'John Doe', // This should come from the authenticated user
            vehiclePlate,
            startTime,
            endTime,
            status: 'active' as const,
            createdAt: new Date().toISOString()
        }

        reservations.push(newReservation)
        parkingLot.availableSpaces -= 1

        return corsResponse(HttpResponse.json(newReservation))
    }),

    // Update a reservation
    http.patch('*/api/reservations/:id', async ({ params, request }) => {
        const { id } = params
        const body = (await request.json()) as UpdateReservationRequest
        const { status } = body

        const reservation = reservations.find((r) => r.id === id)
        if (!reservation) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }

        if (status === 'cancelled' && reservation.status === 'active') {
            const parkingLot = parkingLots.find((lot) => lot.id === reservation.parkingLotId)
            if (parkingLot) {
                parkingLot.availableSpaces += 1
            }
        }

        reservation.status = status
        return corsResponse(HttpResponse.json(reservation))
    }),

    // Delete a reservation
    http.delete('*/api/reservations/:id', ({ params }) => {
        const index = reservations.findIndex((res) => res.id === params.id)

        if (index === -1) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }

        reservations.splice(index, 1)
        return corsResponse(new HttpResponse(null, { status: 204 }))
    }),

    // Get report summary
    ...createUrlPattern('/reports/summary').map((pattern) =>
        http.get(pattern, () => {
            return corsResponse(HttpResponse.json(mockReportSummary))
        })
    ),

    // Get daily reservations
    ...createUrlPattern('/reports/daily-reservations').map((pattern) =>
        http.get(pattern, () => {
            return corsResponse(HttpResponse.json(mockDailyReservations))
        })
    ),

    // Get revenue data
    ...createUrlPattern('/reports/revenue').map((pattern) =>
        http.get(pattern, () => {
            return corsResponse(HttpResponse.json(mockRevenueData))
        })
    ),

    // Get peak hours data
    ...createUrlPattern('/reports/peak-hours').map((pattern) =>
        http.get(pattern, () => {
            return corsResponse(HttpResponse.json(mockPeakHours))
        })
    ),

    // Get user demographics
    ...createUrlPattern('/reports/user-demographics').map((pattern) =>
        http.get(pattern, () => {
            return corsResponse(HttpResponse.json(mockUserDemographics))
        })
    ),

    // Get all users
    http.get('*/api/users', () => {
        return corsResponse(HttpResponse.json<User[]>(users))
    }),

    // Get a single user
    http.get('*/api/users/:id', ({ params }) => {
        const user = users.find((user) => user.id === Number(params.id))
        if (!user) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }
        return corsResponse(HttpResponse.json<User>(user))
    }),

    // Create a new user
    http.post('*/api/users', async ({ request }) => {
        const newUser = (await request.json()) as CreateUserRequest
        const createdUser: User = {
            id: users.length + 1,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newuser'
        }
        users.push(createdUser)
        return corsResponse(HttpResponse.json<User>(createdUser, { status: 201 }))
    }),

    // Update a user
    http.patch('*/api/users/:id', async ({ params, request }) => {
        const updates = (await request.json()) as UpdateUserRequest
        const index = users.findIndex((user) => user.id === Number(params.id))

        if (index === -1) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
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
            createdAt: currentUser.createdAt,
            avatarUrl: currentUser.avatarUrl
        }
        users[index] = updatedUser
        return corsResponse(HttpResponse.json<User>(updatedUser))
    }),

    // Delete a user
    http.delete('*/api/users/:id', ({ params }) => {
        const index = users.findIndex((user) => user.id === Number(params.id))

        if (index === -1) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }

        users.splice(index, 1)
        return corsResponse(new HttpResponse(null, { status: 204 }))
    }),

    // Admin login
    http.post('*/api/admin/login', async ({ request }) => {
        const { email, password } = (await request.json()) as LoginRequest

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
            return corsResponse(HttpResponse.json<AdminLoginResponse>(response))
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
            return corsResponse(HttpResponse.json<AdminLoginResponse>(response))
        }

        return corsResponse(new HttpResponse(null, { status: 401 }))
    }),

    // User login
    ...createUrlPattern('/user/login').map((pattern) =>
        http.post(pattern, async ({ request }) => {
            const { email, password } = (await request.json()) as LoginRequest

            const user = users.find((u) => u.email === email)
            if (!user || password !== 'password123') {
                return corsResponse(new HttpResponse(null, { status: 401 }))
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
                token: `mock-user-token-${user.id}`
            }
            return corsResponse(HttpResponse.json<LoginResponse>(response))
        })
    ),

    ...createUrlPattern('/users/me').map((pattern) => {
        console.log('Creating handler for pattern:', pattern)
        return http.get(pattern, async ({ request }) => {
            const token = request.headers.get('Authorization')?.replace('Bearer ', '')
            console.log('Received token:', token)
            if (!token) {
                return corsResponse(new HttpResponse(null, { status: 401 }))
            }

            // Extract user ID from token
            const userId = token.replace('mock-user-token-', '')
            const user = users.find((u) => u.id === Number(userId))
            if (!user) {
                return corsResponse(new HttpResponse(null, { status: 404 }))
            }

            const response: User = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
            }

            return corsResponse(HttpResponse.json(response))
        })
    }),

    // Get current admin
    http.get('*/api/admin/me', ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token || token !== 'mock-admin-token') {
            return corsResponse(new HttpResponse(null, { status: 401 }))
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
        return corsResponse(HttpResponse.json<AdminLoginResponse>(response))
    })
]
