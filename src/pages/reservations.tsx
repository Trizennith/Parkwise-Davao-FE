import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { format } from 'date-fns'

type Reservation = {
    id: number;
    title: string;
    date: string;
    description: string;
}

export default function Reservations() {
    const {
        data: reservations,
        isLoading,
        error,
    } = useQuery<Reservation[], Error>({
        queryKey: ['reservations'],
        queryFn: async () => {
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
        <div>
            <h1>Reservations</h1>
            {reservations?.map((reservation) => (
                <Card key={reservation.id}>
                    <CardHeader>
                        <CardTitle>{reservation.title}</CardTitle>
                        <CardDescription>
                            {format(new Date(reservation.date), 'PPP')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{reservation.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
