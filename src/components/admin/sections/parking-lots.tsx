import { useState } from 'react'
import { MapPicker } from '@/components/admin/map-picker'
import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from '@/components/ui/drawer'
import { Plus } from 'lucide-react'

interface ParkingLot {
    id: string
    name: string
    location: {
        lat: number
        lng: number
    }
    address: string
    totalSpaces: number
    availableSpaces: number
    status: 'active' | 'maintenance' | 'closed'
}

export function ParkingLots() {
    const [isOpen, setIsOpen] = useState(false)
    const [parkingLots, setParkingLots] = useState<ParkingLot[]>([])
    const [locationName, setLocationName] = useState<string>('')
    const [address, setAddress] = useState<string>('')
    const [isLoadingAddress] = useState<boolean>(false)
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
    const [totalSpaces, setTotalSpaces] = useState<number>(0)
    const [availableSpaces, setAvailableSpaces] = useState<number>(0)

    const handleLocationSelect = (location: {
        lat: number
        lng: number
        name: string
        address: string
        totalSpaces: number
        availableSpaces: number
    }) => {
        const newLot: ParkingLot = {
            id: Math.random().toString(36).substr(2, 9),
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

        setParkingLots([...parkingLots, newLot])
        setIsOpen(false)
        // Reset form
        setLocationName('')
        setAddress('')
        setPosition(null)
        setTotalSpaces(0)
        setAvailableSpaces(0)
    }

    const handleTotalSpacesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0
        setTotalSpaces(value)
        // Ensure available spaces doesn't exceed total spaces
        if (availableSpaces > value) {
            setAvailableSpaces(value)
        }
    }

    const handleAvailableSpacesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0
        // Ensure available spaces doesn't exceed total spaces
        if (value <= totalSpaces) {
            setAvailableSpaces(value)
        }
    }

    const handleSubmit = () => {
        if (position && locationName) {
            const newLot: ParkingLot = {
                id: Math.random().toString(36).substr(2, 9),
                name: locationName,
                location: {
                    lat: position.lat,
                    lng: position.lng
                },
                address: address,
                totalSpaces: totalSpaces,
                availableSpaces: availableSpaces,
                status: 'active'
            }

            setParkingLots([...parkingLots, newLot])
            setIsOpen(false)
            // Reset form
            setLocationName('')
            setAddress('')
            setPosition(null)
            setTotalSpaces(0)
            setAvailableSpaces(0)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Parking Lots</h2>
                    <p className="text-muted-foreground">
                        Manage parking locations and their availability
                    </p>
                </div>
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Parking Lot
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <div className="mx-auto w-full max-w-6xl">
                            <DrawerHeader className="flex items-start justify-between">
                                <div>
                                    <DrawerTitle>Add Parking Lot</DrawerTitle>
                                    <DrawerDescription>
                                        Set the location and details for the new parking lot.
                                    </DrawerDescription>
                                </div>
                            </DrawerHeader>
                            <div className="flex flex-col h-[calc(100vh-12rem)]">
                                <div className="flex-1 min-h-0 p-4">
                                    <MapPicker onLocationSelect={handleLocationSelect} />
                                </div>
                            </div>
                            <DrawerFooter>
                                <div className="flex justify-end">
                                    <DrawerClose asChild>
                                        <Button variant="outline">Close</Button>
                                    </DrawerClose>
                                </div>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {parkingLots.map((lot) => (
                    <div
                        key={lot.id}
                        className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{lot.name}</h3>
                            <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    lot.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : lot.status === 'maintenance'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {lot.status.charAt(0).toUpperCase() + lot.status.slice(1)}
                            </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Total Spaces: {lot.totalSpaces}</p>
                            <p>Available Spaces: {lot.availableSpaces}</p>
                            <p className="mt-2 line-clamp-2">
                                <span className="font-medium">Address:</span> {lot.address}
                            </p>
                            <p className="text-xs">
                                Coordinates: {lot.location.lat.toFixed(4)},{' '}
                                {lot.location.lng.toFixed(4)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
