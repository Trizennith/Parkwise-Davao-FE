import axios from 'axios'

export interface User {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
    role: 'user' | 'admin'
    status: 'active' | 'inactive'
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const usersService = {
    // Get all users
    getAll: async (): Promise<User[]> => {
        const { data } = await axios.get<User[]>(`${API_URL}/users`)
        return data
    },

    // Get a single user
    getById: async (id: string): Promise<User> => {
        const { data } = await axios.get<User>(`${API_URL}/users/${id}`)
        return data
    },

    // Create a new user
    create: async (user: Omit<User, 'id'>): Promise<User> => {
        const { data } = await axios.post<User>(`${API_URL}/users`, user)
        return data
    },

    // Update a user
    update: async (id: string, user: Partial<User>): Promise<User> => {
        const { data } = await axios.patch<User>(`${API_URL}/users/${id}`, user)
        return data
    },

    // Delete a user
    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/users/${id}`)
    }
} 