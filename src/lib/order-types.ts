export type MenuItem = {
  id: string
  category_id: string | null
  name: string
  price: number
  available: boolean
}

export type CartItem = { item: MenuItem; quantity: number }
