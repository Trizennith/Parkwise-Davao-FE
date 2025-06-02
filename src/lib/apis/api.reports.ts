import { API_ENDPOINTS, BASE_API_URL, ParkingLotReportResponse } from '@/lib/apis/api.constants'
import { api } from './api.base'

export interface DateRangeParams {
    start_date: string
    end_date: string
}

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
    total_reservations: number
    daily_reservations: number
    parking_utilization: number
    average_duration: number
    revenue_change: number
    reservation_change: number
    utilization_change: number
    duration_change: number
}

export const reportsService = {
    // Get report summary (admin only)
    getSummary: async (params: DateRangeParams): Promise<ReportSummary> => {
        const { data } = await api.get<ReportSummary>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.SUMMARY}`, {
            params
        })
        
        return data
    },

    // Get daily reservations (admin only)
    getDailyReservations: async (params: DateRangeParams): Promise<DailyReservation[]> => {
        const { data } = await api.get<DailyReservation[]>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.DATE_RANGE}`, {
            params
        })
        return data
    },

    // Get revenue data (admin only)
    getRevenueData: async (params: DateRangeParams): Promise<RevenueData[]> => {
        const { data } = await api.get<RevenueData[]>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.MONTHLY}`, {
            params
        })
        return data
    },

    // Get peak hours data (admin only)
    getPeakHours: async (params: DateRangeParams): Promise<PeakHourData[]> => {
        const { data } = await api.get<PeakHourData[]>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.SUMMARY}`, {
            params
        })
        console.log('Report Summary Data:', data)
        return data
    },


    // Get parking lot report (admin only)
    getParkingLotReport: async (id: number, params: DateRangeParams): Promise<ParkingLotReportResponse> => {
        const { data } = await api.get<ParkingLotReportResponse>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.PARKING_LOT(id)}`, {
            params
        })
        return data
    },

    // Export report (admin only)
    exportReport: async (type: 'daily' | 'monthly' | 'parking_lot', params: DateRangeParams): Promise<Blob> => {
        const response = await api.get(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.REPORTS.EXPORT}`, {
            params: { type, ...params },
            responseType: 'blob'
        })
        return response.data as Blob
    }
} 