import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ZoomIn, ZoomOut, Navigation } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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

interface LocationMarkerProps {
    position: [number, number] | null
    setPosition: (position: [number, number]) => void
    onPositionChange: (position: [number, number]) => void
}

function LocationMarker({ position, setPosition, onPositionChange }: LocationMarkerProps) {
    useMapEvents({
        click(e) {
            const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng]
            setPosition(newPosition)
            onPositionChange(newPosition)
        }
    })

    return position ? <Marker position={position} icon={icon} /> : null
}

function MapControls() {
    const map = useMap()

    const zoomIn = () => {
        map.zoomIn()
    }

    const zoomOut = () => {
        map.zoomOut()
    }

    const locateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    map.setView([latitude, longitude], 15)
                },
                (error) => {
                    console.error('Error getting location:', error)
                }
            )
        }
    }

    return (
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-background shadow-md"
                            onClick={zoomIn}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-background shadow-md"
                            onClick={zoomOut}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-background shadow-md"
                            onClick={locateMe}
                        >
                            <Navigation className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Locate Me</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export interface OnLocationClickType {
    lat: number
    lng: number
    name: string
    address: string
    totalSpaces: number
    availableSpaces: number
}

interface MapPickerPropsType {
    onLocationSelect: (location: OnLocationClickType) => void
    initialPosition?: [number, number]
    initialValues?: OnLocationClickType
}

export function MapPicker({
    onLocationSelect,
    initialPosition,
    initialValues
}: MapPickerPropsType) {
    const [position, setPosition] = useState<[number, number] | null>(initialPosition || null)
    const [locationName, setLocationName] = useState(initialValues?.name || '')
    const [address, setAddress] = useState(initialValues?.address || '')
    const [isLoadingAddress, setIsLoadingAddress] = useState(false)
    const [totalSpaces, setTotalSpaces] = useState<number>(initialValues?.totalSpaces || 0)
    const [availableSpaces, setAvailableSpaces] = useState<number>(
        initialValues?.availableSpaces || 0
    )
    const { theme } = useTheme()

    // Update form when initialValues change
    useEffect(() => {
        if (initialValues) {
            setLocationName(initialValues.name)
            setAddress(initialValues.address)
            setTotalSpaces(initialValues.totalSpaces)
            setAvailableSpaces(initialValues.availableSpaces)
            setPosition([initialValues.lat, initialValues.lng])
        }
    }, [initialValues])

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

    const fetchAddress = async (lat: number, lng: number) => {
        setIsLoadingAddress(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            )
            const data = await response.json()
            setAddress(data.display_name)
        } catch (error) {
            console.error('Error fetching address:', error)
            setAddress('')
        } finally {
            setIsLoadingAddress(false)
        }
    }

    const handlePositionChange = (newPosition: [number, number]) => {
        setPosition(newPosition)
        fetchAddress(newPosition[0], newPosition[1])
    }

    const handleSubmit = () => {
        if (position && locationName) {
            onLocationSelect({
                lat: position[0],
                lng: position[1],
                name: locationName,
                address: address,
                totalSpaces,
                availableSpaces
            })
        }
    }

    return (
        <div className="relative w-full">
            <div className="flex xl:flex-row  flex-col gap-4 ">
                <div className="xl:flex-2  relative aspect-[16/9] w-full rounded-md border overflow-hidden">
                    <MapContainer
                        center={initialPosition || [7.1907, 125.4553]} // Davao City coordinates
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url={
                                theme === 'dark'
                                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                            }
                        />
                        <LocationMarker
                            position={position}
                            setPosition={setPosition}
                            onPositionChange={handlePositionChange}
                        />
                        <MapControls />
                    </MapContainer>
                </div>
                <div className="flex xl:flex-1 flex-col  w-full gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="location-name">Location Name</Label>
                        <Input
                            id="location-name"
                            placeholder="Enter parking location name"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="total-spaces">Total Spaces</Label>
                            <Input
                                id="total-spaces"
                                type="number"
                                min="0"
                                value={totalSpaces}
                                onChange={handleTotalSpacesChange}
                                placeholder="Enter total parking spaces"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="available-spaces">Available Spaces</Label>
                            <Input
                                id="available-spaces"
                                type="number"
                                min="0"
                                max={totalSpaces}
                                value={availableSpaces}
                                onChange={handleAvailableSpacesChange}
                                placeholder="Enter available spaces"
                            />
                        </div>
                    </div>

                    {position && (
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <div className="rounded-md border p-2 text-sm">
                                {isLoadingAddress ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading address...
                                    </div>
                                ) : (
                                    address || 'No address found'
                                )}
                            </div>
                        </div>
                    )}

                    {position && (
                        <div className="space-y-2">
                            <Label>Coordinates</Label>
                            <div className="rounded-md border p-2 text-sm font-mono">
                                {position[0].toFixed(6)}, {position[1].toFixed(6)}
                            </div>
                        </div>
                    )}
                    <Button onClick={handleSubmit} disabled={!position || !locationName}>
                        Save Location
                    </Button>
                </div>
            </div>
        </div>
    )
}
