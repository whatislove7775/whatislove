import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  size: number;
  quantity: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: number) => void;
  updateQuantity: (id: string, size: number, delta: number) => void;
  updateItemSize: (id: string, oldSize: number, newSize: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  syncWithStorage: () => void; // Добавляем функцию для связи с плашкой куки
}

// Кастомная логика хранилища: проверяем куки перед сохранением
const cookieAwareStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return JSON.parse(str);
  },
  setItem: (name: string, value: any) => {
    // Сохраняем в localStorage только если выбор сделан и это "accepted"
    if (localStorage.getItem('cookieConsent') === 'accepted') {
      localStorage.setItem(name, JSON.stringify(value));
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
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

      updateItemSize: (id, oldSize, newSize) => set((state) => {
        if (oldSize === newSize) return state;
        const newItems = [...state.items];
        const existingIndex = newItems.findIndex(i => i.id === id && i.size === oldSize);
        if (existingIndex === -1) return state;

        const targetIndex = newItems.findIndex(i => i.id === id && i.size === newSize);
        
        if (targetIndex !== -1) {
          newItems[targetIndex].quantity += newItems[existingIndex].quantity;
          newItems.splice(existingIndex, 1);
        } else {
          newItems[existingIndex] = { ...newItems[existingIndex], size: newSize };
        }
        return { items: newItems };
      }),

      clearCart: () => set({ items: [] }),

      totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),

      // Функция, которую вызовет ClientLayout при клике на "Принять"
      syncWithStorage: () => {
        if (localStorage.getItem('cookieConsent') === 'accepted') {
          const currentState = get();
          localStorage.setItem('whatislove-cart-storage', JSON.stringify({
            state: { items: currentState.items },
            version: 0
          }));
        }
      }
    }),
    {
      name: 'whatislove-cart-storage',
      storage: createJSONStorage(() => cookieAwareStorage), // Подключаем нашу проверку
    }
  )
);
