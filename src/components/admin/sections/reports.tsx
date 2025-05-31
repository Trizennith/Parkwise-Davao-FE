import { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Download, BarChart2, TrendingUp, Users, Car, Clock } from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { reportsService } from '@/services/reports'
import { format } from 'date-fns'
import { toast } from 'sonner'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

export const Reports: FC = () => {
    // Fetch all report data
    const { data: summary, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['reports', 'summary'],
        queryFn: reportsService.getSummary
    })

    const { data: dailyReservations, isLoading: isLoadingReservations } = useQuery({
        queryKey: ['reports', 'daily-reservations'],
        queryFn: reportsService.getDailyReservations
    })

    const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
        queryKey: ['reports', 'revenue'],
        queryFn: reportsService.getRevenueData
    })

    const { data: peakHoursData, isLoading: isLoadingPeakHours } = useQuery({
        queryKey: ['reports', 'peak-hours'],
        queryFn: reportsService.getPeakHours
    })

    const { data: userDemographics, isLoading: isLoadingDemographics } = useQuery({
        queryKey: ['reports', 'user-demographics'],
        queryFn: reportsService.getUserDemographics
    })

    const isLoading = isLoadingSummary || isLoadingReservations || isLoadingRevenue || 
                     isLoadingPeakHours || isLoadingDemographics

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="text-muted-foreground">Loading reports...</div>
            </div>
        )
    }

    const handleExport = () => {
        // TODO: Implement export functionality
        toast.info('Export functionality coming soon!')
    }

    const handleDateRange = () => {
        // TODO: Implement date range picker
        toast.info('Date range picker coming soon!')
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Reports & Analytics</h3>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDateRange}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Date Range
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₱{summary?.totalRevenue?.toLocaleString() ?? '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.revenueChange ? (summary.revenueChange > 0 ? '+' : '') + summary.revenueChange : '0'}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Daily Reservations
                        </CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.dailyReservations ?? '0'}</div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.reservationChange ? (summary.reservationChange > 0 ? '+' : '') + summary.reservationChange : '0'}% from last week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Parking Utilization
                        </CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.parkingUtilization ?? '0'}%</div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.utilizationChange ? (summary.utilizationChange > 0 ? '+' : '') + summary.utilizationChange : '0'}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Average Duration
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.averageDuration ?? '0'}h</div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.durationChange ? (summary.durationChange > 0 ? '+' : '') + summary.durationChange : '0'}h from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Daily Reservations</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyReservations}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                                        formatter={(value) => [`${value} reservations`, 'Reservations']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="reservations"
                                        stroke="#8884d8"
                                        fill="#8884d8"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date"
                                        tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => `₱${value.toLocaleString()}`}
                                    />
                                    <Tooltip 
                                        labelFormatter={(date) => format(new Date(date), 'MMMM yyyy')}
                                        formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Peak Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={peakHoursData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [`${value}%`, 'Usage']}
                                    />
                                    <Bar dataKey="usage" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>User Demographics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userDemographics}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {userDemographics?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`${value}%`, 'Users']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 