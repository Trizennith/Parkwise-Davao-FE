import { FC } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Check, X } from 'lucide-react'

export const Reservations: FC = () => {
    // Mock data - replace with actual data from API
    const reservations = [
        {
            id: 1,
            user: 'John Doe',
            parkingLot: 'SM City Davao Parking',
            slotNumber: 'A-123',
            startTime: '2024-03-20 10:00 AM',
            endTime: '2024-03-20 12:00 PM',
            status: 'Pending',
            amount: '₱50.00'
        },
        {
            id: 2,
            user: 'Jane Smith',
            parkingLot: 'Abreeza Mall Parking',
            slotNumber: 'B-456',
            startTime: '2024-03-20 11:30 AM',
            endTime: '2024-03-20 02:30 PM',
            status: 'Confirmed',
            amount: '₱75.00'
        },
        {
            id: 3,
            user: 'Mike Johnson',
            parkingLot: 'Gaisano Mall Parking',
            slotNumber: 'C-789',
            startTime: '2024-03-20 09:00 AM',
            endTime: '2024-03-20 01:00 PM',
            status: 'Cancelled',
            amount: '₱100.00'
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Parking Reservations</h3>
                <div className="flex gap-2">
                    <Button variant="outline">
                        Export
                    </Button>
                    <Button>
                        New Reservation
                    </Button>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Parking Lot</TableHead>
                            <TableHead>Slot</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reservations.map((reservation) => (
                            <TableRow key={reservation.id}>
                                <TableCell className="font-medium">{reservation.user}</TableCell>
                                <TableCell>{reservation.parkingLot}</TableCell>
                                <TableCell>{reservation.slotNumber}</TableCell>
                                <TableCell>{reservation.startTime}</TableCell>
                                <TableCell>{reservation.endTime}</TableCell>
                                <TableCell>{reservation.amount}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                        {reservation.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {reservation.status === 'Pending' && (
                                        <>
                                            <Button variant="ghost" size="icon">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
} 