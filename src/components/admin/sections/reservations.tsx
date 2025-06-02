import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservationsService, Reservation, CreateReservationRequest, PaginatedResponse } from '@/lib/apis/api.reservations'
import { toast } from 'sonner'
import { DataTable } from '@/components/ui/data-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ReservationForm } from './reservation-form'
import { parkingLotsService } from '@/lib/apis/api.parking-lot'

const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'

export function Reservations() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
    const queryClient = useQueryClient()

    // Fetch reservations
    const { data: reservationsResponse, isLoading } = useQuery<PaginatedResponse<Reservation>>({
        queryKey: ['reservations'],
        queryFn: reservationsService.getAll
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: reservationsService.create,
        onSuccess: (data) => {
            // Invalidate both reservations and parking lots queries
            queryClient.invalidateQueries({ queryKey: ['reservations'] })
            queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
            queryClient.invalidateQueries({ queryKey: ['availableSpaces', data.parking_lot] })
            setIsOpen(false)
            toast.success('Reservation created successfully')
        },
        onError: (error) => {
            toast.error('Failed to create reservation')
            console.error('Create error:', error)
        }
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateReservationRequest }) =>
            reservationsService.update(id, data),
        onSuccess: (data) => {
            // Invalidate both reservations and parking lots queries
            queryClient.invalidateQueries({ queryKey: ['reservations'] })
            queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
            queryClient.invalidateQueries({ queryKey: ['availableSpaces', data.parking_lot] })
            setIsOpen(false)
            setSelectedReservation(null)
            toast.success('Reservation updated successfully')
        },
        onError: (error) => {
            toast.error('Failed to update reservation')
            console.error('Update error:', error)
        }
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            // Get the reservation details before deleting
            const reservation = await reservationsService.getById(id)
            // Delete the reservation
            await reservationsService.delete(id)
            return reservation
        },
        onSuccess: (deletedReservation) => {
            // Invalidate both reservations and parking lots queries
            queryClient.invalidateQueries({ queryKey: ['reservations'] })
            queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
            queryClient.invalidateQueries({ queryKey: ['availableSpaces', deletedReservation.parking_lot] })
            toast.success('Reservation deleted successfully')
        },
        onError: (error) => {
            toast.error('Failed to delete reservation')
            console.error('Delete error:', error)
        }
    })

    const handleEdit = (reservation: Reservation) => {
        setSelectedReservation(reservation)
        setIsOpen(true)
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this reservation?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleSubmit = (data: CreateReservationRequest) => {
        if (selectedReservation) {
            updateMutation.mutate({ id: selectedReservation.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const columns: ColumnDef<Reservation>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <div className="font-medium">{row.original.id}</div>
        },
        {
            accessorKey: 'parking_lot_name',
            header: 'Parking Lot',
            cell: ({ row }) => <div className="font-medium">{row.original.parking_lot_name || '-'}</div>
        },
        {
            accessorKey: 'user.username',
            header: 'User',
            cell: ({ row }) => <div>{row.original.user.username}</div>
        },
        {
            accessorKey: 'vehicle_plate',
            header: 'Vehicle Plate',
            cell: ({ row }) => <div>{row.getValue('vehicle_plate')}</div>
        },
        {
            accessorKey: 'notes',
            header: 'Notes',
            cell: ({ row }) => {
                const notes = row.getValue('notes') as string
                return notes ? (
                    <div className="max-w-[200px] truncate" title={notes}>
                        {notes}
                    </div>
                ) : (
                    <div className="text-muted-foreground">-</div>
                )
            }
        },
        {
            accessorKey: 'start_time',
            header: 'Start Time',
            cell: ({ row }) => (
                <div>{format(new Date(row.getValue('start_time')), 'MMM d, yyyy h:mm a')}</div>
            )
        },
        {
            accessorKey: 'end_time',
            header: 'End Time',
            cell: ({ row }) => (
                <div>{format(new Date(row.getValue('end_time')), 'MMM d, yyyy h:mm a')}</div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string
                return (
                    <Badge
                        variant={
                            status === 'active'
                                ? 'success'
                                : status === 'completed'
                                ? 'secondary'
                                : 'destructive'
                        }
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                )
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const reservation = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(reservation)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(reservation.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="text-muted-foreground">Loading reservations...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold tracking-tight">Reservations</h2>
                        {TEST_MODE && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                TEST MODE
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        Manage parking reservations and their status
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 p-0"
                    onClick={() => {
                        setSelectedReservation(null)
                        setIsOpen(true)
                    }}
                    aria-label="Add Reservation"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <DataTable 
                columns={columns} 
                data={(reservationsResponse?.results as Reservation[]) ?? []} 
                searchKey="vehicle_plate"
                totalCount={reservationsResponse?.count ?? 0}
            />

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedReservation ? 'Edit Reservation' : 'Add New Reservation'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedReservation
                                ? 'Update the reservation details below.'
                                : 'Fill in the details to create a new reservation.'}
                        </DialogDescription>
                    </DialogHeader>
                    <ReservationForm
                        onSubmit={handleSubmit}
                        initialValues={selectedReservation || undefined}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
} 