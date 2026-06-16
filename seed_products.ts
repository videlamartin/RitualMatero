import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const newProducts = [
  // MATES
  {
    name: 'Imperial liso de calabaza',
    description: 'Virola de acero inoxidable',
    price: 36000,
    category: 'mates',
    featured: true,
    metadata: { material: ['Calabaza'], terminaciones: ['Virola de acero inoxidable'] },
    images: []
  },
  {
    name: 'Torpedo croco de calabaza',
    description: 'Virola de alpaca cincelada y cuero labrado',
    price: 50000,
    category: 'mates',
    featured: true,
    metadata: { material: ['Calabaza'], terminaciones: ['Virola de alpaca', 'Cuero croco'] },
    images: []
  },
  {
    name: 'Imperial liso',
    description: 'Calabaza con virola de alpaca',
    price: 40000,
    category: 'mates',
    featured: false,
    metadata: { material: ['Calabaza'], terminaciones: ['Virola de alpaca'] },
    images: []
  },
  {
    name: 'Imperial de algarrobo alpaca',
    description: 'Virola de alpaca',
    price: 38000,
    category: 'mates',
    featured: true,
    metadata: { material: ['Algarrobo'], terminaciones: ['Virola de alpaca'] },
    images: []
  },
  {
    name: 'Imperial de algarrobo',
    description: 'Virola de acero inoxidable',
    price: 35000,
    category: 'mates',
    featured: false,
    metadata: { material: ['Algarrobo'], terminaciones: ['Virola de acero inoxidable'] },
    images: []
  },
  {
    name: 'Camionero de algarrobo',
    description: 'Virola de acero inoxidable',
    price: 28000,
    category: 'mates',
    featured: false,
    metadata: { material: ['Algarrobo'], terminaciones: ['Virola de acero inoxidable'], tipo: 'Camionero' },
    images: []
  },
  {
    name: 'Imperial de algarrobo con base',
    description: 'Virola de acero inoxidable, fleje y base de alpaca y madera...',
    price: 50000,
    category: 'mates',
    featured: true,
    metadata: { material: ['Algarrobo'], terminaciones: ['Virola de acero inoxidable', 'Fleje de alpaca', 'Base de alpaca'] },
    images: []
  },
  {
    name: 'Imperial de algarrobo (Laqueado)',
    description: 'Virola de acero inoxidable y madera laqueada',
    price: 35000,
    category: 'mates',
    featured: false,
    metadata: { material: ['Algarrobo'], terminaciones: ['Virola de acero inoxidable'] },
    images: []
  },

  // BOMBILLAS
  {
    name: 'Bombilla pico de loro alpaca',
    description: '',
    price: 15000,
    category: 'bombillas',
    featured: true,
    metadata: { material: ['Alpaca'], tipo_bombilla: 'Pico de loro' },
    images: []
  },
  {
    name: 'Bombilla cincelada',
    description: 'Acero inoxidable',
    price: 10000,
    category: 'bombillas',
    featured: false,
    metadata: { material: ['Acero inoxidable'] },
    images: []
  },
  {
    name: 'Bombilla sol de mayo',
    description: 'Alpaca y bronce',
    price: 30000,
    category: 'bombillas',
    featured: true,
    metadata: { material: ['Alpaca', 'Bronce'] },
    images: []
  },

  // ACCESORIOS
  {
    name: 'Yerbero y azucarero lata',
    description: '',
    price: 8000,
    category: 'accesorios',
    featured: false,
    metadata: { categoria_accesorio: 'Yerberos y azucareros' },
    images: []
  },
  {
    name: 'Yerbero y azucarero',
    description: 'Lata marwal',
    price: 10000,
    category: 'accesorios',
    featured: true,
    metadata: { categoria_accesorio: 'Yerberos y azucareros' },
    images: []
  },
  {
    name: 'Yerbero y azucarero chau lata',
    description: '',
    price: 7000,
    category: 'accesorios',
    featured: false,
    metadata: { categoria_accesorio: 'Yerberos y azucareros' },
    images: []
  }
]

async function seed() {
  console.log('Clearing existing products...')
  // Using neq to a random uuid to safely wipe
  const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (deleteError) {
    console.error('Error clearing products:', deleteError)
    process.exit(1)
  }

  console.log('Inserting new products...')
  for (const p of newProducts) {
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert(p)
      .select('id')
      .single()

    if (insertError) {
      console.error(`Error inserting product ${p.name}:`, insertError)
      continue
    }

    // Insert stock as "unico" -> 10 items
    const { error: sizeError } = await supabase
      .from('product_sizes')
      .insert({
        product_id: insertedProduct.id,
        size: 'unico',
        stock: 50
      })

    if (sizeError) {
      console.error(`Error inserting stock for ${p.name}:`, sizeError)
    }
  }

  console.log('Seed completed successfully!')
}

seed().catch(console.error)
