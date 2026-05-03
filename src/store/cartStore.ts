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
  updateItemSize: (id: string, oldSize: number, newSize: number) => void;
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
        const newQuantity = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQuantity };
      }
      return i;
    })
  })),
  // Функция для смены размера прямо в корзине
  updateItemSize: (id, oldSize, newSize) => set((state) => {
    if (oldSize === newSize) return state;
    const newItems = [...state.items];
    const existingIndex = newItems.findIndex(i => i.id === id && i.size === oldSize);
    if (existingIndex === -1) return state;

    const targetIndex = newItems.findIndex(i => i.id === id && i.size === newSize);
    
    // Если такой размер уже есть в корзине — плюсуем количество к нему
    if (targetIndex !== -1) {
      newItems[targetIndex].quantity += newItems[existingIndex].quantity;
      newItems.splice(existingIndex, 1);
    } else {
      // Иначе просто меняем размер у текущей позиции
      newItems[existingIndex] = { ...newItems[existingIndex], size: newSize };
    }
    return { items: newItems };
  }),
  clearCart: () => set({ items: [] }),
  totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}));
