import axios from 'axios'

export interface ParkingLot {
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const parkingLotsService = {
    // Get all parking lots
    getAll: async (): Promise<ParkingLot[]> => {
        const { data } = await axios.get<ParkingLot[]>(`${API_URL}/parking-lots`)
        return data
    },

    // Get a single parking lot
    getById: async (id: string): Promise<ParkingLot> => {
        const { data } = await axios.get<ParkingLot>(`${API_URL}/parking-lots/${id}`)
        return data
    },

    // Create a new parking lot
    create: async (parkingLot: Omit<ParkingLot, 'id'>): Promise<ParkingLot> => {
        const { data } = await axios.post<ParkingLot>(`${API_URL}/parking-lots`, parkingLot)
        return data
    },

    // Update a parking lot
    update: async (id: string, parkingLot: Partial<ParkingLot>): Promise<ParkingLot> => {
        const { data } = await axios.patch<ParkingLot>(`${API_URL}/parking-lots/${id}`, parkingLot)
        return data
    },

    // Delete a parking lot
    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/parking-lots/${id}`)
    }
} 