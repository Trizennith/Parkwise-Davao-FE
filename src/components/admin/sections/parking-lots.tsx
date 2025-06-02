import { useState } from 'react'
import { MapPicker, OnLocationClickType } from '@/components/admin/map-picker'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { CardTitle } from '@/components/ui/card'
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parkingLotsService, ParkingLot, CreateParkingLotRequest } from '@/lib/apis/api.parking-lot'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusSelections, ParkingLotStatus } from '../../admin/status-selections'
import { Label } from '@/components/ui/label'

const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'

export function ParkingLots() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const [status, setStatus] = useState<ParkingLotStatus>('active')
    const queryClient = useQueryClient()

    const { data: parkingLotsResponse, isLoading } = useQuery({
        queryKey: ['parkingLots'],
        queryFn: () => parkingLotsService.getAll()
    })

    const parkingLots = parkingLotsResponse?.results || []

    const createMutation = useMutation({
        mutationFn: (data: CreateParkingLotRequest) => parkingLotsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
            setIsOpen(false)
            setSelectedLot(null)
            setStatus('active')
            toast.success('Parking lot created successfully')
        },
        onError: (error) => {
            console.error('Create error:', error)
            toast.error('Failed to create parking lot')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateParkingLotRequest }) =>
            parkingLotsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
            setIsOpen(false)
            setSelectedLot(null)
            setStatus('active')
            toast.success('Parking lot updated successfully')
        },
        onError: (error) => {
            console.error('Update error:', error)
            toast.error('Failed to update parking lot')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => parkingLotsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
            toast.success('Parking lot deleted successfully')
        },
        onError: (error) => {
            console.error('Delete error:', error)
            toast.error('Failed to delete parking lot')
        }
    })

    const handleLocationSelect = (location: OnLocationClickType) => {
        const newLot: CreateParkingLotRequest = {
            name: location.name,
            address: location.address,
            latitude: location.lat.toString(),
            longitude: location.lng.toString(),
            total_spaces: location.total_spaces,
            hourly_rate: location.hourly_rate.toString(),
            available_spaces: location.total_spaces, // Initially, all spaces are available
            status // Include status in the request
        }

        if (selectedLot) {
            // First update the parking lot details
            updateMutation.mutate({ id: selectedLot.id, data: newLot })
            // Then update the status if it has changed
            if (status !== selectedLot.status) {
                parkingLotsService.updateStatus(selectedLot.id, status)
                    .then(() => {
                        queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
                        toast.success('Parking lot status updated successfully')
                    })
                    .catch((error) => {
                        console.error('Status update error:', error)
                        toast.error('Failed to update parking lot status')
                    })
            }
        } else {
            createMutation.mutate(newLot)
        }
    }

    const handleEdit = (lot: ParkingLot) => {
        setSelectedLot(lot)
        setStatus(lot.status)
        setIsOpen(true)
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this parking lot?')) {
            deleteMutation.mutate(id)
        }
    }

    const columns: ColumnDef<ParkingLot>[] = [
        {
            accessorKey: 'name',
            header: 'Name'
        },
        {
            accessorKey: 'address',
            header: 'Address'
        },
        {
            accessorKey: 'total_spaces',
            header: 'Total Spaces'
        },
        {
            accessorKey: 'available_spaces',
            header: 'Available Spaces'
        },
        {
            accessorKey: 'hourly_rate',
            header: 'Hourly Rate',
            cell: ({ row }) => `$${row.original.hourly_rate}`
        },
        {
            accessorKey: 'latitude',
            header: 'Latitude',
            cell: ({ row }) => row.original.latitude
        },
        {
            accessorKey: 'longitude',
            header: 'Longitude',
            cell: ({ row }) => row.original.longitude
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.status === 'active'
                            ? 'default'
                            : row.original.status === 'maintenance'
                            ? 'warning'
                            : 'destructive'
                    }
                >
                    {row.original.status}
                </Badge>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const lot = row.original
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
                            <DropdownMenuItem onClick={() => handleEdit(lot)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(lot.id)}
                                className="text-red-600"
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

    const table = useReactTable({
        data: parkingLots,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting
        }
    })

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <CardTitle>Parking Lots</CardTitle>
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Parking Lot
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open)
                if (!open) {
                    setSelectedLot(null)
                    setStatus('active')
                }
            }}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedLot ? 'Edit Parking Lot' : 'Add Parking Lot'}
                        </DialogTitle>
                        <DialogDescription>
                            Select a location on the map and fill in the details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <StatusSelections status={status} setStatus={setStatus} />
                        </div>
                        <Separator />
                        <MapPicker
                            onLocationClick={handleLocationSelect}
                            selectedLot={selectedLot ? {
                                name: selectedLot.name,
                                latitude: selectedLot.latitude,
                                longitude: selectedLot.longitude,
                                address: selectedLot.address,
                                total_spaces: selectedLot.total_spaces,
                                available_spaces: selectedLot.available_spaces,
                                hourly_rate: parseFloat(selectedLot.hourly_rate),
                                status: selectedLot.status
                            } : null}
                        />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
