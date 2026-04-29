import { create } from 'zustand';

// Описываем, как выглядит товар в корзине
export interface CartItem {
  id: string;
  name: string;
  price: number;
  size?: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size?: number) => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => {
    // Проверяем, есть ли уже такой товар такого же размера в корзине
    const existing = state.items.find((i) => i.id === item.id && i.size === item.size);
    if (existing) {
      return {
        items: state.items.map((i) => 
          i.id === item.id && i.size === item.size 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        )
      };
    }
    return { items: [...state.items, item] };
  }),

  removeItem: (id, size) => set((state) => ({
    items: state.items.filter((i) => !(i.id === id && i.size === size))
  })),

  totalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
