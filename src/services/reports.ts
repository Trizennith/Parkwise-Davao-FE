import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface DailyReservation {
    date: string
    reservations: number
}

export interface RevenueData {
    date: string
    revenue: number
}

export interface PeakHourData {
    hour: string
    usage: number
}

export interface UserDemographic {
    name: string
    value: number
}

export interface ReportSummary {
    totalRevenue: number
    dailyReservations: number
    parkingUtilization: number
    averageDuration: number
    revenueChange: number
    reservationChange: number
    utilizationChange: number
    durationChange: number
}

export const reportsService = {
    // Get report summary
    getSummary: async (): Promise<ReportSummary> => {
        const { data } = await axios.get<ReportSummary>(`${API_URL}/reports/summary`)
        return data
    },

    // Get daily reservations
    getDailyReservations: async (): Promise<DailyReservation[]> => {
        const { data } = await axios.get<DailyReservation[]>(`${API_URL}/reports/daily-reservations`)
        return data
    },

    // Get revenue data
    getRevenueData: async (): Promise<RevenueData[]> => {
        const { data } = await axios.get<RevenueData[]>(`${API_URL}/reports/revenue`)
        return data
    },

    // Get peak hours data
    getPeakHours: async (): Promise<PeakHourData[]> => {
        const { data } = await axios.get<PeakHourData[]>(`${API_URL}/reports/peak-hours`)
        return data
    },

    // Get user demographics
    getUserDemographics: async (): Promise<UserDemographic[]> => {
        const { data } = await axios.get<UserDemographic[]>(`${API_URL}/reports/user-demographics`)
        return data
    }
} 