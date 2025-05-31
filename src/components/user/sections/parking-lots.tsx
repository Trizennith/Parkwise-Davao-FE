import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ParkingLocation, ParkingSlot } from '@/types'
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

// Test mode flag
const TEST_MODE = true

// Mock data for testing
const MOCK_PARKING_LOTS: ParkingLocation[] = [
    {
        id: 1,
        name: 'Downtown Parking',
        address: '123 Main St, Davao City',
        total_slots: 50,
        available_slots_count: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        name: 'SM Parking',
        address: 'SM City Davao, Ecoland',
        total_slots: 100,
        available_slots_count: 45,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Abreeza Parking',
        address: 'Abreeza Mall, Bajada',
        total_slots: 75,
        available_slots_count: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

const MOCK_SLOTS: Record<number, ParkingSlot[]> = {
    1: [
        { 
            id: 1, 
            location: 1,
            slot_number: 'A1', 
            is_available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        { 
            id: 2, 
            location: 1,
            slot_number: 'A2', 
            is_available: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        { 
            id: 3, 
            location: 1,
            slot_number: 'A3', 
            is_available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ],
    2: [
        { 
            id: 4, 
            location: 2,
            slot_number: 'B1', 
            is_available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        { 
            id: 5, 
            location: 2,
            slot_number: 'B2', 
            is_available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        { 
            id: 6, 
            location: 2,
            slot_number: 'B3', 
            is_available: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ],
    3: [
        { 
            id: 7, 
            location: 3,
            slot_number: 'C1', 
            is_available: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        { 
            id: 8, 
            location: 3,
            slot_number: 'C2', 
            is_available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        { 
            id: 9, 
            location: 3,
            slot_number: 'C3', 
            is_available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ]
}

export default function ParkingLots() {
    const [selectedLot, setSelectedLot] = useState<ParkingLocation | null>(null)
    const [isReserving, setIsReserving] = useState(false)

    const { data: parkingLots, isLoading } = useQuery<ParkingLocation[], Error>({
        queryKey: ['parkingLots'],
        queryFn: async (): Promise<ParkingLocation[]> => {
            if (TEST_MODE) {
                return MOCK_PARKING_LOTS
            }
            const response = await api.get('/api/parking/parking-lots/')
            return response.data as ParkingLocation[]
        }
    })

    const { data: slots } = useQuery<ParkingSlot[], Error>({
        queryKey: ['slots', selectedLot?.id],
        queryFn: async (): Promise<ParkingSlot[]> => {
            if (!selectedLot) return []
            if (TEST_MODE) {
                return MOCK_SLOTS[selectedLot.id] || []
            }
            const response = await api.get(`/api/parking/parking-lots/${selectedLot.id}/slots/`)
            return response.data as ParkingSlot[]
        },
        enabled: !!selectedLot
    })

    const handleReserve = async (slotId: number) => {
        setIsReserving(true)
        try {
            if (TEST_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000))
                toast.success('Slot reserved successfully! (TEST MODE)')
                return
            }
            await api.post('/api/reservations/reservations/', {
                slot: slotId,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
            })
            toast.success('Slot reserved successfully!')
        } catch {
            toast.error('Failed to reserve slot. Please try again.')
        } finally {
            setIsReserving(false)
        }
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Parking Lots</h1>
                <p className="text-muted-foreground">View and reserve parking slots</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {parkingLots?.map((lot: ParkingLocation) => (
                    <Card key={lot.id}>
                        <CardHeader>
                            <CardTitle>{lot.name}</CardTitle>
                            <CardDescription>{lot.address}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Total Slots
                                        </span>
                                        <span className="font-medium">{lot.total_slots}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Available Slots
                                        </span>
                                        <span className="font-medium">
                                            {lot.available_slots_count}
                                        </span>
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full"
                                            onClick={() => setSelectedLot(lot)}
                                        >
                                            View Slots
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{lot.name} - Available Slots</DialogTitle>
                                            <DialogDescription>
                                                Select a slot to reserve
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4">
                                            {slots?.map((slot: ParkingSlot) => (
                                                <div
                                                    key={slot.id}
                                                    className="flex items-center justify-between rounded-lg border p-4"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            Slot {slot.slot_number}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {slot.is_available
                                                                ? 'Available'
                                                                : 'Occupied'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleReserve(slot.id)}
                                                        disabled={!slot.is_available || isReserving}
                                                    >
                                                        {isReserving ? 'Reserving...' : 'Reserve'}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
