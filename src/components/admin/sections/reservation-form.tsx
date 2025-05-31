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
import { Reservation } from '@/services/reservations'
import { useQuery } from '@tanstack/react-query'
import { parkingLotsService } from '@/services/parking-lots'

interface ReservationFormProps {
    onSubmit: (data: Omit<Reservation, 'id' | 'createdAt'>) => void
    initialValues?: Reservation
}

export function ReservationForm({ onSubmit, initialValues }: ReservationFormProps) {
    const [formData, setFormData] = useState({
        parkingLotId: initialValues?.parkingLotId || '',
        parkingLotName: initialValues?.parkingLotName || '',
        userId: initialValues?.userId || '',
        userName: initialValues?.userName || '',
        vehiclePlate: initialValues?.vehiclePlate || '',
        startTime: initialValues?.startTime
            ? new Date(initialValues.startTime).toISOString().slice(0, 16)
            : '',
        endTime: initialValues?.endTime
            ? new Date(initialValues.endTime).toISOString().slice(0, 16)
            : '',
        status: initialValues?.status || 'active'
    })

    // Fetch parking lots for the dropdown
    const { data: parkingLots = [] } = useQuery({
        queryKey: ['parkingLots'],
        queryFn: parkingLotsService.getAll
    })

    useEffect(() => {
        if (initialValues) {
            setFormData({
                parkingLotId: initialValues.parkingLotId,
                parkingLotName: initialValues.parkingLotName,
                userId: initialValues.userId,
                userName: initialValues.userName,
                vehiclePlate: initialValues.vehiclePlate,
                startTime: new Date(initialValues.startTime).toISOString().slice(0, 16),
                endTime: new Date(initialValues.endTime).toISOString().slice(0, 16),
                status: initialValues.status
            })
        }
    }, [initialValues])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            ...formData,
            startTime: new Date(formData.startTime).toISOString(),
            endTime: new Date(formData.endTime).toISOString()
        })
    }

    const handleParkingLotChange = (parkingLotId: string) => {
        const selectedLot = parkingLots.find(lot => lot.id === parkingLotId)
        if (selectedLot) {
            setFormData(prev => ({
                ...prev,
                parkingLotId: selectedLot.id,
                parkingLotName: selectedLot.name
            }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="parkingLot">Parking Lot</Label>
                    <Select
                        value={formData.parkingLotId}
                        onValueChange={handleParkingLotChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a parking lot" />
                        </SelectTrigger>
                        <SelectContent>
                            {parkingLots.map(lot => (
                                <SelectItem key={lot.id} value={lot.id}>
                                    {lot.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={value =>
                            setFormData(prev => ({ ...prev, status: value as Reservation['status'] }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="userName">User Name</Label>
                    <Input
                        id="userName"
                        value={formData.userName}
                        onChange={e =>
                            setFormData(prev => ({ ...prev, userName: e.target.value }))
                        }
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="vehiclePlate">Vehicle Plate</Label>
                    <Input
                        id="vehiclePlate"
                        value={formData.vehiclePlate}
                        onChange={e =>
                            setFormData(prev => ({ ...prev, vehiclePlate: e.target.value }))
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
                        value={formData.startTime}
                        onChange={e =>
                            setFormData(prev => ({ ...prev, startTime: e.target.value }))
                        }
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                        id="endTime"
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={e =>
                            setFormData(prev => ({ ...prev, endTime: e.target.value }))
                        }
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit">
                    {initialValues ? 'Update Reservation' : 'Create Reservation'}
                </Button>
            </div>
        </form>
    )
} 