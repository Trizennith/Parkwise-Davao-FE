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
import { parkingLotsService } from '@/lib/apis/api.parking-lot'
import { usersService } from '@/lib/apis/api.users'

interface ReservationFormProps {
    onSubmit: (data: CreateReservationRequest) => void
    initialValues?: Reservation
}

export function ReservationForm({ onSubmit, initialValues }: ReservationFormProps) {
    const [formData, setFormData] = useState<CreateReservationRequest>({
        parking_lot: initialValues?.parking_lot.id || 0,
        parking_space: initialValues?.parking_space.id || 0,
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
    const { data: parkingLots = [] } = useQuery({
        queryKey: ['parkingLots'],
        queryFn: parkingLotsService.getAll
    })

    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: usersService.getAll
    })

    useEffect(() => {
        if (initialValues) {
            setFormData({
                parking_lot: initialValues.parking_lot.id,
                parking_space: initialValues.parking_space.id,
                vehicle_plate: initialValues.vehicle_plate,
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
        setFormData(prev => ({
            ...prev,
            parking_lot: Number(parkingLotId)
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
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a parking lot" />
                        </SelectTrigger>
                        <SelectContent>
                            {parkingLots.map(lot => (
                                <SelectItem key={lot.id} value={lot.id.toString()}>
                                    {lot.name}
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