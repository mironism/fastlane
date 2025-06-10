import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/lib/types';

// Define the shape of a menu item that can be added to the cart
// This is essentially a subset of the full MenuItem type.
export type AddToCartItem = Omit<CartItem, 'quantity'>;

// Define the shape of the entire cart state
type CartState = {
  items: CartItem[];
  addItem: (item: AddToCartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Add an item to the cart or increment its quantity
      addItem: (newItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex((item) => item.id === newItem.id);

        if (existingItemIndex > -1) {
          // Item already exists, just increment the quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += 1;
          set({ items: updatedItems });
        } else {
          // Item is new, add it to the cart
          set({ items: [...items, { ...newItem, quantity: 1 }] });
        }
      },

      // Remove an item from the cart completely
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      // Update the quantity of a specific item
      updateQuantity: (itemId, newQuantity) => {
        if (newQuantity <= 0) {
          // If quantity is zero or less, remove the item
          get().removeItem(itemId);
        } else {
          set({
            items: get().items.map((item) =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            ),
          });
        }
      },

      // Clear all items from the cart
      clearCart: () => {
        set({ items: [] });
      },

      // Get the total number of items in the cart
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      // Get the total price of all items in the cart
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // unique name
      storage: createJSONStorage(() => localStorage),
    }
  )
); 