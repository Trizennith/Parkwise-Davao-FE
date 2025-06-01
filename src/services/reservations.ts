import axios from 'axios'

export interface Reservation {
    id: string
    parkingLotId: string
    parkingLotName: string
    userId: string
    userName: string
    vehiclePlate: string
    notes?: string
    startTime: string
    endTime: string
    status: 'active' | 'completed' | 'cancelled'
    createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const reservationsService = {
    // Get all reservations
    getAll: async (): Promise<Reservation[]> => {
        const { data } = await axios.get<Reservation[]>(`${API_URL}/reservations`)
        return data
    },

    // Get a single reservation
    getById: async (id: string): Promise<Reservation> => {
        const { data } = await axios.get<Reservation>(`${API_URL}/reservations/${id}`)
        return data
    },

    // Create a new reservation
    create: async (reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> => {
        const { data } = await axios.post<Reservation>(`${API_URL}/reservations`, reservation)
        return data
    },

    // Update a reservation
    update: async (id: string, reservation: Partial<Reservation>): Promise<Reservation> => {
        const { data } = await axios.patch<Reservation>(`${API_URL}/reservations/${id}`, reservation)
        return data
    },

    // Delete a reservation
    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/reservations/${id}`)
    }
} 