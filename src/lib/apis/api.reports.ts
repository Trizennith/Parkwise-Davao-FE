import { API_ENDPOINTS, BASE_API_URL, ParkingLotReportResponse } from '@/lib/apis/api.constants'
import { api } from './api.base'

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
    // Get report summary (admin only)
    getSummary: async (): Promise<ReportSummary> => {
        const { data } = await api.get<ReportSummary>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.SUMMARY}`)
        return data
    },

    // Get daily reservations (admin only)
    getDailyReservations: async (): Promise<DailyReservation[]> => {
        const { data } = await api.get<DailyReservation[]>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.DATE_RANGE}`)
        return data
    },

    // Get revenue data (admin only)
    getRevenueData: async (): Promise<RevenueData[]> => {
        const { data } = await api.get<RevenueData[]>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.MONTHLY}`)
        return data
    },

    // Get peak hours data (admin only)
    getPeakHours: async (): Promise<PeakHourData[]> => {
        const { data } = await api.get<PeakHourData[]>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.SUMMARY}`)
        return data
    },

    // Get user demographics (admin only)
    getUserDemographics: async (): Promise<UserDemographic[]> => {
        const { data } = await api.get<UserDemographic[]>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.SUMMARY}`)
        return data
    },

    // Get parking lot report (admin only)
    getParkingLotReport: async (id: number): Promise<ParkingLotReportResponse> => {
        const { data } = await api.get<ParkingLotReportResponse>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.PARKING_LOT(id)}`)
        return data
    },

    // Export report (admin only)
    exportReport: async (type: 'daily' | 'monthly' | 'parking_lot', startDate: string, endDate: string): Promise<Blob> => {
        const response = await api.get(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.EXPORT}`, {
            params: { type, startDate, endDate },
            responseType: 'blob'
        })
        return response.data as Blob
    }
} 