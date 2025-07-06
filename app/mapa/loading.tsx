import { MapPin, Loader2 } from "lucide-react"

export default function MapaLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-4">
          <MapPin className="h-12 w-12 mx-auto text-blue-600" />
          <Loader2 className="h-6 w-6 animate-spin absolute -top-1 -right-1 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Cargando Mapa</h2>
        <p className="text-gray-600">Preparando la vista del mapa interactivo...</p>
      </div>
    </div>
  )
}
