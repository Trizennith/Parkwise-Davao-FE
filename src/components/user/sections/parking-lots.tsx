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

export default function ParkingLots() {
    const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
    const [showMap, setShowMap] = useState(false)
    const [showReservation, setShowReservation] = useState(false)
    const [vehiclePlate, setVehiclePlate] = useState('')
    const [notes, setNotes] = useState('')
    const queryClient = useQueryClient()

    // Fetch parking lots using the new hook
    const { data: parkingLotsResponse, isLoading } = useApiQuery<PaginatedResponse<ParkingLot>>(
        ['parking-lots'],
        '/api/parking-lots'
    )

    const parkingLots = parkingLotsResponse?.results || []

    // Create reservation using the new hook
    const createReservation = useApiMutation<Reservation, { lotId: number; vehiclePlate: string; notes: string }>(
        '/api/reservations',
        'post',
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['reservations'] })
                toast.success('Parking space reserved successfully!')
                setShowReservation(false)
                setVehiclePlate('')
                setNotes('')
            }
        }
    )

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
        if (!selectedLot || !vehiclePlate) return

        createReservation.mutate({
            lotId: selectedLot.id,
            vehiclePlate,
            notes
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
                                        ${parseFloat(lot.hourly_rate).toFixed(2)}/hour
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
                            />
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
                                <p>Hourly Rate: ${parseFloat(selectedLot?.hourly_rate || '0').toFixed(2)}/hour</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowReservation(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReserve}
                            disabled={!vehiclePlate || createReservation.isPending}
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
