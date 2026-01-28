export type City = {
  slug: string
  name: string
  latitude: number
  longitude: number
  country?: string
}

// Alias para compatibilidad
export type ColombianCity = City

export const topColombiaCities: City[] = [
  { slug: 'bogota', name: 'Bogotá', latitude: 4.7110, longitude: -74.0721, country: 'Colombia' },
  { slug: 'medellin', name: 'Medellín', latitude: 6.2442, longitude: -75.5812, country: 'Colombia' },
  { slug: 'cali', name: 'Cali', latitude: 3.4516, longitude: -76.5320, country: 'Colombia' },
  { slug: 'barranquilla', name: 'Barranquilla', latitude: 10.9685, longitude: -74.7813, country: 'Colombia' },
  { slug: 'cartagena', name: 'Cartagena', latitude: 10.3910, longitude: -75.4794, country: 'Colombia' },
  { slug: 'bucaramanga', name: 'Bucaramanga', latitude: 7.1193, longitude: -73.1227, country: 'Colombia' },
  { slug: 'cucuta', name: 'Cúcuta', latitude: 7.8891, longitude: -72.4967, country: 'Colombia' },
  { slug: 'pereira', name: 'Pereira', latitude: 4.8143, longitude: -75.6946, country: 'Colombia' },
  { slug: 'santa-marta', name: 'Santa Marta', latitude: 11.2408, longitude: -74.1990, country: 'Colombia' },
  { slug: 'manizales', name: 'Manizales', latitude: 5.0703, longitude: -75.5138, country: 'Colombia' },
  { slug: 'pasto', name: 'Pasto', latitude: 1.2136, longitude: -77.2811, country: 'Colombia' },
  { slug: 'ibague', name: 'Ibagué', latitude: 4.4447, longitude: -75.2424, country: 'Colombia' },
  { slug: 'villavicencio', name: 'Villavicencio', latitude: 4.1420, longitude: -73.6266, country: 'Colombia' },
]

// Ciudades internacionales con comunidad colombiana
export const internationalCities: City[] = [
  { slug: 'brisbane', name: 'Brisbane', latitude: -27.4698, longitude: 153.0251, country: 'Australia' },
  { slug: 'sydney', name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia' },
  { slug: 'melbourne', name: 'Melbourne', latitude: -37.8136, longitude: 144.9631, country: 'Australia' },
  { slug: 'miami', name: 'Miami', latitude: 25.7617, longitude: -80.1918, country: 'Estados Unidos' },
  { slug: 'new-york', name: 'Nueva York', latitude: 40.7128, longitude: -74.0060, country: 'Estados Unidos' },
  { slug: 'madrid', name: 'Madrid', latitude: 40.4168, longitude: -3.7038, country: 'España' },
  { slug: 'london', name: 'Londres', latitude: 51.5074, longitude: -0.1278, country: 'Reino Unido' },
]

// Todas las ciudades disponibles
export const allCities: City[] = [...topColombiaCities, ...internationalCities]

export function findCityBySlug(slug: string): City | undefined {
  return allCities.find(c => c.slug === slug)
}


