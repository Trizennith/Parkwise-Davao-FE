import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { Reservation } from '@/types'

// Test mode flag
const TEST_MODE = true

// Mock data for testing
const MOCK_RESERVATIONS: Reservation[] = [
    {
        id: 1,
        user: 1,
        slot: 1,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        user: 1,
        slot: 4,
        start_time: new Date(Date.now() + 7200000).toISOString(),
        end_time: new Date(Date.now() + 10800000).toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        user: 1,
        slot: 7,
        start_time: new Date(Date.now() - 3600000).toISOString(),
        end_time: new Date().toISOString(),
        status: 'cancelled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

export default function Reservations() {
    const {
        data: reservations,
        isLoading,
        error,
    } = useQuery<Reservation[], Error>({
        queryKey: ['reservations'],
        queryFn: async () => {
            if (TEST_MODE) {
                return MOCK_RESERVATIONS
            }
            const response = await fetch('/api/reservations')
            if (!response.ok) {
                throw new Error('Failed to fetch reservations')
            }
            return response.json()
        },
    })

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        toast.error('Error loading reservations')
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reservations</h1>
                <p className="text-muted-foreground">View and manage your parking reservations</p>
            </div>
            <div className="grid gap-4">
                {reservations?.map((reservation) => (
                    <Card key={reservation.id}>
                        <CardHeader>
                            <CardTitle>Reservation #{reservation.id}</CardTitle>
                            <CardDescription>
                                {format(new Date(reservation.start_time), 'PPP p')} - {format(new Date(reservation.end_time), 'p')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-medium capitalize">{reservation.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Slot</p>
                                    <p className="font-medium">Slot #{reservation.slot}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
