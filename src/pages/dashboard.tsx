import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ParkingLots from '@/components/dashboard/parking-lots'
import Reservations from '@/components/dashboard/reservations'
import Profile from '@/components/dashboard/profile'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('parking-lots')

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="parking-lots" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="parking-lots">Parking Lots</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="parking-lots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parking Lots</CardTitle>
              <CardDescription>
                View and manage parking lots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ParkingLots />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reservations</CardTitle>
              <CardDescription>
                View and manage your parking reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Reservations />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Profile />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 