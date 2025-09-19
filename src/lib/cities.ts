export type ColombianCity = {
  slug: string
  name: string
  latitude: number
  longitude: number
}

export const topColombiaCities: ColombianCity[] = [
  { slug: 'bogota', name: 'Bogotá', latitude: 4.7110, longitude: -74.0721 },
  { slug: 'medellin', name: 'Medellín', latitude: 6.2442, longitude: -75.5812 },
  { slug: 'cali', name: 'Cali', latitude: 3.4516, longitude: -76.5320 },
  { slug: 'barranquilla', name: 'Barranquilla', latitude: 10.9685, longitude: -74.7813 },
  { slug: 'cartagena', name: 'Cartagena', latitude: 10.3910, longitude: -75.4794 },
  { slug: 'bucaramanga', name: 'Bucaramanga', latitude: 7.1193, longitude: -73.1227 },
  { slug: 'cucuta', name: 'Cúcuta', latitude: 7.8891, longitude: -72.4967 },
  { slug: 'pereira', name: 'Pereira', latitude: 4.8143, longitude: -75.6946 },
  { slug: 'santa-marta', name: 'Santa Marta', latitude: 11.2408, longitude: -74.1990 },
  { slug: 'manizales', name: 'Manizales', latitude: 5.0703, longitude: -75.5138 },
  { slug: 'pasto', name: 'Pasto', latitude: 1.2136, longitude: -77.2811 },
  { slug: 'ibague', name: 'Ibagué', latitude: 4.4447, longitude: -75.2424 },
  { slug: 'villavicencio', name: 'Villavicencio', latitude: 4.1420, longitude: -73.6266 },
]

export function findCityBySlug(slug: string): ColombianCity | undefined {
  return topColombiaCities.find(c => c.slug === slug)
}


