export interface SamplePreset {
  id: string;
  name: string;
  category: string;
  query: string;
  imageUrl: string;
  badge: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "dell-battery",
    name: "Batería Dell WDX0R / Inspiron",
    category: "Componentes Laptop",
    query: "Batería Dell WDX0R Original para Inspiron y Vostro",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
    badge: "Caso de Estudio",
  },
  {
    id: "sony-xm5",
    name: "Sony WH-1000XM5 Auriculares",
    category: "Audio Hi-Res",
    query: "Sony WH-1000XM5 Auriculares Noise Cancelling",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    badge: "Top Ventas",
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro 256GB Titanio",
    category: "Smartphones",
    query: "Apple iPhone 16 Pro 256GB Titanio",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
    badge: "Alta Demanda",
  },
  {
    id: "samsung-oled",
    name: "Samsung Odyssey G9 OLED 49\"",
    category: "Monitores & Gaming",
    query: "Samsung Odyssey OLED G9 49 pulgadas 240Hz",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    badge: "Hardware Pro",
  },
];
