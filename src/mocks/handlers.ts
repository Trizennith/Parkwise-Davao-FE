import { http, HttpResponse } from 'msw'
import { 
    API_ENDPOINTS, 
    LoginRequest, 
    LoginResponse, 
    User, 
    CreateReservationRequest, 
    Reservation, 
    ParkingLot,
    DailySummaryResponse,
    MonthlyReportResponse} from '@/lib/apis/api.constants'

// Get the API URL from environment variables, with fallback for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Helper function to create URL patterns for both development and production
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createUrlPattern = (path: string) => {
    const basePath = path.startsWith('/') ? path : `/${path}`
    const patterns = [
        `${API_URL}${basePath}`,
        `${API_URL}/api${basePath}`,
        `*/api${basePath}`,
        `*${basePath}`
    ]
    return patterns
}

// Mock data
const mockUsers: User[] = [
    {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        role: 'user',
        status: 'active',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        username: 'janesmith',
        email: 'jane.smith@example.com',
        role: 'admin',
        status: 'active',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janesmith',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
    }
]

// Mock parking lots data
const mockParkingLots: ParkingLot[] = [
    {
        id: 1,
        name: 'Downtown Parking',
        address: '123 Main St, Davao City',
        latitude: '7.1907',
        longitude: '125.4553',
        total_spaces: 50,
        available_spaces: 30,
        status: 'active',
        hourly_rate: '50.00'
    },
    {
        id: 2,
        name: 'SM Parking',
        address: 'SM City Davao, Ecoland',
        latitude: '7.0873',
        longitude: '125.6087',
        total_spaces: 100,
        available_spaces: 45,
        status: 'active',
        hourly_rate: '60.00'
    },
    {
        id: 3,
        name: 'Abreeza Parking',
        address: 'Abreeza Mall, Bajada',
        latitude: '7.0833',
        longitude: '125.6167',
        total_spaces: 75,
        available_spaces: 0,
        status: 'maintenance',
        hourly_rate: '55.00'
    }
]

// Mock reservations data
const mockReservations: Reservation[] = [
    {
        id: 1,
        parking_lot: {
            id: 1,
            name: 'Downtown Parking'
        },
        parking_space: {
            id: 1,
            space_number: 'A1'
        },
        user: {
            id: 1,
            username: 'johndoe',
            email: 'john.doe@example.com'
        },
        vehicle_plate: 'ABC123',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        status: 'active',
        total_cost: '50.00',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        parking_lot: {
            id: 2,
            name: 'SM Parking'
        },
        parking_space: {
            id: 2,
            space_number: 'B1'
        },
        user: {
            id: 1,
            username: 'johndoe',
            email: 'john.doe@example.com'
        },
        vehicle_plate: 'ABC123',
        start_time: new Date(Date.now() + 7200000).toISOString(),
        end_time: new Date(Date.now() + 10800000).toISOString(),
        status: 'active',
        total_cost: '120.00',
        created_at: new Date().toISOString()
    }
]

// Mock reports data
const mockReportSummary: DailySummaryResponse = {
    total_revenue: 150000,
    daily_reservations: 45,
    parking_utilization: 75,
    average_duration: 2.5,
    revenue_change: 12,
    reservation_change: 8,
    utilization_change: 5,
    duration_change: 0.5
}

const mockMonthlyReport: MonthlyReportResponse = {
    year: 2024,
    month: 3,
    total_revenue: 450000,
    total_reservations: 1350,
    average_duration: 2.5,
    average_occupancy_rate: 75,
    peak_day: '2024-03-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
}

// Mock user demographics data
const mockUserDemographics = [
    { name: 'Regular Users', value: 65 },
    { name: 'Premium Users', value: 25 },
    { name: 'Staff', value: 10 }
]

// Create mutable copies of the mock data
const users = [...mockUsers]
const parkingLots = [...mockParkingLots]
const reservations = [...mockReservations]

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

    // Auth endpoints
    http.post(API_ENDPOINTS.AUTH.LOGIN, async ({ request }) => {
        const body = (await request.json()) as LoginRequest
        const user = users.find((u) => u.email === body.email)

        if (!user) {
            return new HttpResponse(null, { status: 401 })
        }

        const response: LoginResponse = {
            access: 'mock-jwt-token',
            refresh: 'mock-refresh-token'
        }

        return corsResponse(HttpResponse.json(response))
    }),

    http.post(API_ENDPOINTS.AUTH.LOGOUT, () => {
        return corsResponse(new HttpResponse(null, { status: 204 }))
    }),

    // User profile endpoint
    http.get(API_ENDPOINTS.USER.PROFILE, ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        // For mock purposes, return the first user
        return corsResponse(HttpResponse.json(users[0]))
    }),

    // Admin profile endpoint
    http.get(API_ENDPOINTS.ADMIN.USERS, ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        return corsResponse(HttpResponse.json(users))
    }),

    // Admin user details endpoint
    http.get(API_ENDPOINTS.ADMIN.USER_DETAILS(1), ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        const user = users.find((u) => u.id === 1)
        if (!user) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }

        return corsResponse(HttpResponse.json(user))
    }),

    // Parking lot endpoints
    http.get(API_ENDPOINTS.ADMIN.PARKING_LOTS, ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        return corsResponse(HttpResponse.json(parkingLots))
    }),

    http.get(API_ENDPOINTS.ADMIN.PARKING_LOT_DETAILS(1), ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        const lot = parkingLots.find((lot) => lot.id === 1)
        if (!lot) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }

        return corsResponse(HttpResponse.json(lot))
    }),

    // Reservation endpoints
    http.get(API_ENDPOINTS.USER.RESERVATIONS, ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        return corsResponse(HttpResponse.json(reservations))
    }),

    http.post(API_ENDPOINTS.USER.RESERVATIONS, async ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        const body = (await request.json()) as CreateReservationRequest
        const parkingLot = parkingLots.find((lot) => lot.id === body.parking_lot)

        if (!parkingLot) {
            return corsResponse(new HttpResponse(null, { status: 404 }))
        }

        if (parkingLot.available_spaces === 0) {
            return corsResponse(new HttpResponse(null, { status: 400 }))
        }

        const newReservation: Reservation = {
            id: reservations.length + 1,
            parking_lot: {
                id: parkingLot.id,
                name: parkingLot.name
            },
            parking_space: {
                id: body.parking_space,
                space_number: `A${body.parking_space}`
            },
            user: {
                id: 1,
                username: 'johndoe',
                email: 'john.doe@example.com'
            },
            vehicle_plate: body.vehicle_plate,
            start_time: body.start_time,
            end_time: body.end_time,
            status: 'active',
            total_cost: '50.00',
            created_at: new Date().toISOString()
        }

        reservations.push(newReservation)
        parkingLot.available_spaces -= 1

        return corsResponse(HttpResponse.json(newReservation, { status: 201 }))
    }),

    // Report endpoints
    http.get(API_ENDPOINTS.ADMIN.REPORTS.SUMMARY, ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        return corsResponse(HttpResponse.json(mockReportSummary))
    }),

    http.get(API_ENDPOINTS.ADMIN.REPORTS.MONTHLY, ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        return corsResponse(HttpResponse.json(mockMonthlyReport))
    }),

    // User demographics endpoint
    http.get(API_ENDPOINTS.ADMIN.REPORTS.DAILY, ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return corsResponse(new HttpResponse(null, { status: 401 }))
        }

        return corsResponse(HttpResponse.json(mockUserDemographics))
    })
]
