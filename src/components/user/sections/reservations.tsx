import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { api } from '@/lib/apis/api.base'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Reservation {
    id: string
    parkingLotId: string
    parkingLotName: string
    userId: string
    userName: string
    vehiclePlate: string
    startTime: string
    endTime: string
    status: 'active' | 'completed' | 'cancelled'
    createdAt: string
}

export default function Reservations() {
    const queryClient = useQueryClient()

    const { data: reservations, isLoading } = useQuery<Reservation[]>({
        queryKey: ['reservations'],
        queryFn: async () => {
            const response = await api.get<Reservation[]>('/api/reservations')
            return response.data
        }
    })

    const cancelReservation = useMutation({
        mutationFn: async (reservationId: string) => {
            const response = await api.patch<Reservation>(`/api/reservations/${reservationId}`, {
                status: 'cancelled'
            })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] })
            toast.success('Reservation cancelled successfully')
        },
        onError: () => {
            toast.error('Failed to cancel reservation')
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading reservations...</span>
                </div>
            </div>
        )
    }

    const getStatusBadge = (status: Reservation['status']) => {
        const variants = {
            active: 'success',
            completed: 'default',
            cancelled: 'destructive'
        } as const

        return (
            <Badge variant={variants[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Reservations</h1>
                <p className="text-muted-foreground">View and manage your parking reservations</p>
            </div>

            <div className="grid gap-4">
                {reservations?.map((reservation) => (
                    <Card key={reservation.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{reservation.parkingLotName}</CardTitle>
                                    <CardDescription>
                                        {format(new Date(reservation.startTime), 'PPP p')} - {format(new Date(reservation.endTime), 'p')}
                                    </CardDescription>
                                </div>
                                {getStatusBadge(reservation.status)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Vehicle Plate</span>
                                        <span className="font-medium">{reservation.vehiclePlate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reservation ID</span>
                                        <span className="font-medium">{reservation.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created At</span>
                                        <span className="font-medium">
                                            {format(new Date(reservation.createdAt), 'PPP p')}
                                        </span>
                                    </div>
                                </div>
                                {reservation.status === 'active' && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full">
                                                Cancel Reservation
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to cancel this reservation? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>No, keep it</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => cancelReservation.mutate(reservation.id)}
                                                    disabled={cancelReservation.isPending}
                                                >
                                                    {cancelReservation.isPending ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Cancelling...
                                                        </>
                                                    ) : (
                                                        'Yes, cancel it'
                                                    )}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
