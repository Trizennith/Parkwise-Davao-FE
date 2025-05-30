import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Parking Lots</CardTitle>
            <CardDescription>
              View and manage parking lots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/parking-lots')}>
              View Parking Lots
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reservations</CardTitle>
            <CardDescription>
              View and manage your parking reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/reservations')}>
              View Reservations
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/profile')}>
              View Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 