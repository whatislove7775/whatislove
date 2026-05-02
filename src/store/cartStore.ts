import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  size: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: number) => void;
  updateQuantity: (id: string, size: number, delta: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => i.id === item.id && i.size === item.size);
    if (existing) {
      return { items: state.items.map((i) => i.id === item.id && i.size === item.size ? { ...i, quantity: i.quantity + item.quantity } : i) };
    }
    return { items: [...state.items, item] };
  }),
  removeItem: (id, size) => set((state) => ({
    items: state.items.filter((i) => !(i.id === id && i.size === size))
  })),
  updateQuantity: (id, size, delta) => set((state) => ({
    items: state.items.map(i => {
      if (i.id === id && i.size === size) {
        // Не даем сделать количество меньше 1
        const newQuantity = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQuantity };
      }
      return i;
    })
  })),
  clearCart: () => set({ items: [] }),
  totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}));
