import { useState } from 'react'
import { MapPicker, OnLocationClickType, ParkingLotStatus } from '@/components/admin/map-picker'
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
import { parkingLotsService, ParkingLot } from '@/services/parking-lots'
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

const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'

export function ParkingLots() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const queryClient = useQueryClient()

    // Fetch parking lots
    const { data: parkingLots = [], isLoading } = useQuery({
        queryKey: ['parkingLots'],
        queryFn: parkingLotsService.getAll
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: parkingLotsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
            setIsOpen(false)
            toast.success('Parking lot created successfully')
        },
        onError: (error) => {
            toast.error('Failed to create parking lot')
            console.error('Create error:', error)
        }
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ParkingLot> }) =>
            parkingLotsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
            setIsOpen(false)
            setSelectedLot(null)
            toast.success('Parking lot updated successfully')
        },
        onError: (error) => {
            toast.error('Failed to update parking lot')
            console.error('Update error:', error)
        }
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: parkingLotsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parkingLots'] })
            toast.success('Parking lot deleted successfully')
        },
        onError: (error) => {
            toast.error('Failed to delete parking lot')
            console.error('Delete error:', error)
        }
    })

    const handleLocationSelect = (location: OnLocationClickType) => {
        const newLot: Omit<ParkingLot, 'id'> = {
            name: location.name,
            location: {
                lat: location.lat,
                lng: location.lng
            },
            address: location.address,
            totalSpaces: location.totalSpaces,
            availableSpaces: location.availableSpaces,
            status: 'active'
        }

        if (selectedLot) {
            updateMutation.mutate({ id: selectedLot.id, data: newLot })
        } else {
            createMutation.mutate(newLot)
        }
    }

    const handleEdit = (lot: ParkingLot) => {
        setSelectedLot(lot)
        setIsOpen(true)
    }

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this parking lot?')) {
            deleteMutation.mutate(id)
        }
    }

    const columns: ColumnDef<ParkingLot>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>
        },
        {
            accessorKey: 'address',
            header: 'Address',
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate">{row.getValue('address')}</div>
            )
        },
        {
            accessorKey: 'location',
            header: 'Coordinates',
            cell: ({ row }) => {
                const location = row.getValue('location') as { lat: number; lng: number }
                return (
                    <div className="font-mono text-sm">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>
                )
            }
        },
        {
            accessorKey: 'totalSpaces',
            header: 'Total Spaces',
            cell: ({ row }) => <div>{row.getValue('totalSpaces')}</div>
        },
        {
            accessorKey: 'availableSpaces',
            header: 'Available Spaces',
            cell: ({ row }) => <div>{row.getValue('availableSpaces')}</div>
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
                                : status === 'maintenance'
                                ? 'warning'
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(lot)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(lot.id)}
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

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold tracking-tight">Parking Lots</h2>
                        {TEST_MODE && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                TEST MODE
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        Manage parking locations and their availability
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 p-0"
                    onClick={() => {
                        setSelectedLot(null)
                        setIsOpen(true)
                    }}
                    aria-label="Add Parking Lot"
                >
                    <Plus className="h-4 w-4" />
                </Button>
                <DialogCreateParkingLot
                    isDialogOpen={isOpen}
                    setIsDialogOpen={setIsOpen}
                    handleLocationSelect={handleLocationSelect}
                    selectedLot={selectedLot}
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
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
            )}
        </div>
    )
}

function DialogCreateParkingLot({
    isDialogOpen,
    setIsDialogOpen,
    handleLocationSelect,
    selectedLot
}: {
    isDialogOpen: boolean
    setIsDialogOpen: (open: boolean) => void
    handleLocationSelect: (data: OnLocationClickType & { status: ParkingLotStatus }) => void
    selectedLot: ParkingLot | null
}) {
    const [status, setStatus] = useState<ParkingLotStatus>(selectedLot?.status || 'active')

    const handleSubmit = (location: OnLocationClickType) => {
        handleLocationSelect({
            ...location,
            status
        })
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[1920px]">
                <DialogHeader>
                    <div className="flex gap-2 ">
                        <DialogTitle>
                            {selectedLot ? 'Edit Parking Lot' : 'Add New Parking Lot'}
                        </DialogTitle>
                        <Separator orientation='vertical'/>
                        <DialogDescription className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Select Parking Location
                        </DialogDescription>
                    </div>
                    <DialogDescription>
                        {selectedLot
                            ? 'Update the parking lot details below.'
                            : 'Fill in the details to add a new parking lot.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="gap-4">
                    <MapPicker
                        setStatus={setStatus}
                        status={status}
                        onLocationSelect={handleSubmit}
                        initialPosition={
                            selectedLot
                                ? [selectedLot.location.lat, selectedLot.location.lng]
                                : undefined
                        }
                        initialValues={
                            selectedLot
                                ? {
                                      lat: selectedLot.location.lat,
                                      lng: selectedLot.location.lng,
                                      name: selectedLot.name,
                                      address: selectedLot.address,
                                      totalSpaces: selectedLot.totalSpaces,
                                      availableSpaces: selectedLot.availableSpaces
                                  }
                                : undefined
                        }
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
