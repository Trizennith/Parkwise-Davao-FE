import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Loader2, MapPin } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { useTheme } from '@/components/theme-provider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query'
import { format } from 'date-fns'
import { API_ENDPOINTS, BASE_API_URL } from '@/lib/apis/api.constants'
import { api } from '@/lib/apis/api.base'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Fix for default marker icon
const icon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface ParkingLot {
    id: number
    name: string
    address: string
    latitude: string
    longitude: string
    total_spaces: number
    available_spaces: number
    status: 'active' | 'maintenance' | 'closed'
    hourly_rate: string
}

interface Reservation {
    id: number
    parking_lot: {
        id: number
        name: string
    }
    parking_space: {
        id: number
        space_number: string
    }
    user: {
        id: number
        username: string
        email: string
    }
    vehicle_plate: string
    start_time: string
    end_time: string
    status: 'active' | 'completed' | 'cancelled'
    notes?: string
    total_cost: string
    created_at: string
}

interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

interface ParkingSpace {
    id: number
    space_number: string
    type: string
    status: string
}

export default function ParkingLots() {
    const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
    const [showMap, setShowMap] = useState(false)
    const [showReservation, setShowReservation] = useState(false)
    const [vehiclePlate, setVehiclePlate] = useState('')
    const [notes, setNotes] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [selectedSpace, setSelectedSpace] = useState<string>('')
    const queryClient = useQueryClient()

    // Fetch parking lots using the correct endpoint
    const { data: parkingLotsResponse, isLoading } = useApiQuery<PaginatedResponse<ParkingLot>>(
        ['parking-lots'],
        `${BASE_API_URL}${API_ENDPOINTS.USER.PARKING_LOTS}`
    )

    // Fetch available spaces when a parking lot is selected
    const { data: availableSpaces } = useApiQuery<ParkingSpace[]>(
        ['availableSpaces', selectedLot?.id?.toString() ?? ''],
        selectedLot ? `${BASE_API_URL}/api/user/parking-lots/${selectedLot.id}/available-spaces/` : '',
        {
            enabled: !!selectedLot
        }
    )

    const parkingLots = parkingLotsResponse?.results || []

    // Create reservation using the correct endpoint
    const createReservation = useApiMutation<Reservation, {
        parking_lot: number
        parking_space: number
        vehicle_plate: string
        notes: string
        start_time: string
        end_time: string
    }>(
        `${BASE_API_URL}${API_ENDPOINTS.USER.RESERVATIONS}`,
        'post',
        {
            onSuccess: (data) => {
                // Invalidate both parking lots and reservations queries
                queryClient.invalidateQueries({ queryKey: ['parking-lots'] })
                queryClient.invalidateQueries({ queryKey: ['reservations'] })
                queryClient.invalidateQueries({ queryKey: ['availableSpaces', data.parking_lot.id] })
                
                toast.success('Parking space reserved successfully!')
                setShowReservation(false)
                resetForm()
            },
            onError: (error: unknown) => {
                const errorMessage = error instanceof Error ? error.message : 'Failed to create reservation'
                toast.error(errorMessage)
            }
        }
    )

    const resetForm = () => {
        setVehiclePlate('')
        setNotes('')
        setStartTime('')
        setEndTime('')
        setSelectedLot(null)
        setSelectedSpace('')
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading parking lots...</span>
                </div>
            </div>
        )
    }

    const handleReserve = () => {
        if (!selectedLot || !vehiclePlate || !startTime || !endTime || !selectedSpace) {
            toast.error('Please fill in all required fields')
            return
        }

        // Validate time range
        const start = new Date(startTime)
        const end = new Date(endTime)
        const now = new Date()

        if (start < now) {
            toast.error('Start time cannot be in the past')
            return
        }

        if (end <= start) {
            toast.error('End time must be after start time')
            return
        }

        const parkingSpaceId = parseInt(selectedSpace)
        if (isNaN(parkingSpaceId)) {
            toast.error('Invalid parking space selected')
            return
        }

        createReservation.mutate({
            parking_lot: selectedLot.id,
            parking_space: parkingSpaceId,
            vehicle_plate: vehiclePlate,
            notes,
            start_time: start.toISOString(),
            end_time: end.toISOString()
        })
    }

    return (
        <div className="space-y-4">
            {parkingLotsResponse && (
                <p className="text-sm text-muted-foreground">
                    Total parking lots: {parkingLotsResponse.count}
                </p>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {parkingLots.map((lot) => (
                    <Card key={lot.id}>
                        <CardHeader>
                            <CardTitle>{lot.name}</CardTitle>
                            <CardDescription>{lot.address}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Available Spaces:</span>
                                    <Badge variant={lot.available_spaces > 0 ? 'default' : 'destructive'}>
                                        {lot.available_spaces} / {lot.total_spaces}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <Badge variant={lot.status === 'active' ? 'default' : lot.status === 'maintenance' ? 'warning' : 'destructive'}>
                                        {lot.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Coordinates:</span>
                                    <span className="text-sm text-muted-foreground">
                                        {parseFloat(lot.latitude).toFixed(6)}, {parseFloat(lot.longitude).toFixed(6)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Hourly Rate:</span>
                                    <span className="text-sm text-muted-foreground">
                                        ₱{parseFloat(lot.hourly_rate).toFixed(2)}/hour
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedLot(lot)
                                            setShowMap(true)
                                        }}
                                    >
                                        <MapPin className="w-4 h-4 mr-2" />
                                        View on Map
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setSelectedLot(lot)
                                            setShowReservation(true)
                                        }}
                                        disabled={lot.available_spaces === 0 || lot.status !== 'active'}
                                    >
                                        Reserve Space
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Map Dialog */}
            <Dialog open={showMap} onOpenChange={setShowMap}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Parking Lot Location</DialogTitle>
                        <DialogDescription>
                            {selectedLot?.name} - {selectedLot?.address}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="h-[400px] w-full">
                        <MapContainer
                            center={[parseFloat(selectedLot?.latitude || '0'), parseFloat(selectedLot?.longitude || '0')]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {selectedLot && (
                                <Marker
                                    position={[parseFloat(selectedLot.latitude), parseFloat(selectedLot.longitude)]}
                                    icon={icon}
                                />
                            )}
                        </MapContainer>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reservation Dialog */}
            <Dialog open={showReservation} onOpenChange={setShowReservation}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reserve Parking Space</DialogTitle>
                        <DialogDescription>
                            Reserve a space at {selectedLot?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="vehiclePlate">Vehicle Plate Number</Label>
                            <Input
                                id="vehiclePlate"
                                value={vehiclePlate}
                                onChange={(e) => setVehiclePlate(e.target.value)}
                                placeholder="Enter your vehicle plate number"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parkingSpace">Parking Space</Label>
                            <Select
                                value={selectedSpace}
                                onValueChange={setSelectedSpace}
                                disabled={!selectedLot}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a parking space" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSpaces?.map((space) => (
                                        <SelectItem key={space.id} value={space.id.toString()}>
                                            {space.space_number} ({space.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                    id="startTime"
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input
                                    id="endTime"
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Input
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special requirements or notes"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Location Details</Label>
                            <div className="text-sm text-muted-foreground">
                                <p>Address: {selectedLot?.address}</p>
                                <p>Coordinates: {parseFloat(selectedLot?.latitude || '0').toFixed(6)}, {parseFloat(selectedLot?.longitude || '0').toFixed(6)}</p>
                                <p>Hourly Rate: ₱{parseFloat(selectedLot?.hourly_rate || '0').toFixed(2)}/hour</p>
                                <p>Available Spaces: {selectedLot?.available_spaces}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                            setShowReservation(false)
                            resetForm()
                        }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReserve}
                            disabled={!vehiclePlate || !startTime || !endTime || !selectedSpace || createReservation.isPending}
                        >
                            {createReservation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Reserving...
                                </>
                            ) : (
                                'Confirm Reservation'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
