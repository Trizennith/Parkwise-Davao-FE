import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Reservation, CreateReservationRequest } from '@/lib/apis/api.reservations'
import { User } from '@/lib/apis/api.users'
import { useQuery } from '@tanstack/react-query'
import { parkingLotsService, ParkingLot } from '@/lib/apis/api.parking-lot'
import { usersService } from '@/lib/apis/api.users'
import { api } from '@/lib/apis/api.base'
import { BASE_API_URL, API_ENDPOINTS } from '@/lib/apis/api.constants'

interface ReservationFormProps {
    onSubmit: (data: CreateReservationRequest) => void
    initialValues?: Reservation
}

export function ReservationForm({ onSubmit, initialValues }: ReservationFormProps) {
    const [formData, setFormData] = useState<CreateReservationRequest>({
        parking_lot: initialValues?.parking_lot || 0,
        parking_lot_name: initialValues?.parking_lot_name || '',
        parking_space: initialValues?.parking_space?.id || 0,
        user: initialValues?.user?.id || 0,
        user_name: initialValues?.user_name || '',
        vehicle_plate: initialValues?.vehicle_plate || '',
        notes: initialValues?.notes || '',
        start_time: initialValues?.start_time
            ? new Date(initialValues.start_time).toISOString().slice(0, 16)
            : '',
        end_time: initialValues?.end_time
            ? new Date(initialValues.end_time).toISOString().slice(0, 16)
            : ''
    })

    // Fetch parking lots and users for the dropdowns
    const { data: parkingLotsResponse } = useQuery({
        queryKey: ['parkingLots'],
        queryFn: async () => {
            const response = await api.get<{ count: number; next: string | null; previous: string | null; results: ParkingLot[] }>(`${BASE_API_URL}${API_ENDPOINTS.ADMIN.PARKING_LOTS}`)
            return response.data
        }
    })

    const { data: usersResponse } = useQuery({
        queryKey: ['users'],
        queryFn: usersService.getAll
    })

    // Generate array of numbers from 1 to 10 for parking spaces
    const parkingSpaces = Array.from({ length: 10 }, (_, i) => i + 1)

    useEffect(() => {
        if (initialValues) {
            setFormData({
                parking_lot: initialValues.parking_lot,
                parking_lot_name: initialValues.parking_lot_name,
                parking_space: initialValues.parking_space?.id || 0,
                user: initialValues.user?.id || 0,
                user_name: initialValues.user_name,
                vehicle_plate: initialValues.vehicle_plate || '',
                notes: initialValues.notes || '',
                start_time: new Date(initialValues.start_time).toISOString().slice(0, 16),
                end_time: new Date(initialValues.end_time).toISOString().slice(0, 16)
            })
        }
    }, [initialValues])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            ...formData,
            start_time: new Date(formData.start_time).toISOString(),
            end_time: new Date(formData.end_time).toISOString()
        })
    }

    const handleParkingLotChange = (parkingLotId: string) => {
        const selectedLot = parkingLotsResponse?.results?.find(lot => lot.id === Number(parkingLotId))
        setFormData(prev => ({
            ...prev,
            parking_lot: Number(parkingLotId),
            parking_lot_name: selectedLot?.name || '',
            parking_space: 0 // Reset parking space when parking lot changes
        }))
    }

    const handleUserChange = (userId: string) => {
        const selectedUser = usersResponse?.results?.find(user => user.id === Number(userId))
        setFormData(prev => ({
            ...prev,
            user: Number(userId),
            user_name: selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}`.trim() : ''
        }))
    }

    const handleParkingSpaceChange = (spaceId: string) => {
        setFormData(prev => ({
            ...prev,
            parking_space: Number(spaceId)
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="parkingLot">Parking Lot</Label>
                    <Select
                        value={formData.parking_lot.toString()}
                        onValueChange={handleParkingLotChange}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a parking lot" />
                        </SelectTrigger>
                        <SelectContent>
                            {parkingLotsResponse?.results?.map((lot: ParkingLot) => (
                                <SelectItem key={lot.id} value={lot.id.toString()}>
                                    {lot.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parkingSpace">Parking Space</Label>
                    <Select
                        value={formData.parking_space.toString()}
                        onValueChange={handleParkingSpaceChange}
                        required
                        disabled={!formData.parking_lot}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a parking space" />
                        </SelectTrigger>
                        <SelectContent>
                            {parkingSpaces.map((spaceNumber) => (
                                <SelectItem key={spaceNumber} value={spaceNumber.toString()}>
                                    Space {spaceNumber}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="user">User</Label>
                    <Select
                        value={formData.user.toString()}
                        onValueChange={handleUserChange}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                            {usersResponse?.results.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.username}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="vehiclePlate">Vehicle Plate</Label>
                    <Input
                        id="vehiclePlate"
                        value={formData.vehicle_plate}
                        onChange={e =>
                            setFormData(prev => ({ ...prev, vehicle_plate: e.target.value }))
                        }
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                        id="startTime"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={e =>
                            setFormData(prev => ({ ...prev, start_time: e.target.value }))
                        }
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                        id="endTime"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={e =>
                            setFormData(prev => ({ ...prev, end_time: e.target.value }))
                        }
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                    id="notes"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add any special instructions or notes for the reservation"
                    value={formData.notes}
                    onChange={e =>
                        setFormData(prev => ({ ...prev, notes: e.target.value }))
                    }
                />
            </div>

            <div className="flex justify-end">
                <Button type="submit">
                    {initialValues ? 'Update Reservation' : 'Create Reservation'}
                </Button>
            </div>
        </form>
    )
} 