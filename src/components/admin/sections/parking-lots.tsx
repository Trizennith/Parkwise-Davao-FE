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
import { Plus, Pencil, Trash2 } from 'lucide-react'

export const ParkingLots: FC = () => {
    // Mock data - replace with actual data from API
    const parkingLots = [
        {
            id: 1,
            name: 'SM City Davao Parking',
            location: 'Quimpo Blvd, Davao City',
            totalSlots: 500,
            availableSlots: 150,
            status: 'Active'
        },
        {
            id: 2,
            name: 'Abreeza Mall Parking',
            location: 'J.P. Laurel Ave, Davao City',
            totalSlots: 300,
            availableSlots: 75,
            status: 'Active'
        },
        {
            id: 3,
            name: 'Gaisano Mall Parking',
            location: 'Bajada, Davao City',
            totalSlots: 400,
            availableSlots: 200,
            status: 'Active'
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Parking Locations</h3>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Location
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Total Slots</TableHead>
                            <TableHead>Available Slots</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parkingLots.map((lot) => (
                            <TableRow key={lot.id}>
                                <TableCell className="font-medium">{lot.name}</TableCell>
                                <TableCell>{lot.location}</TableCell>
                                <TableCell>{lot.totalSlots}</TableCell>
                                <TableCell>{lot.availableSlots}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        lot.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {lot.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
} 