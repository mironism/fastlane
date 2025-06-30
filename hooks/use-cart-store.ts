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
      addItem: (activity) => {
        set((state) => {
          // Clear existing items to ensure single activity booking
          const newItems = [{
            id: activity.id,
            title: activity.title,
            description: activity.description,
            price: activity.price,
            image_url: activity.image_url,
            quantity: 1, // Always 1 for single activity booking
            duration_minutes: activity.duration_minutes,
            meeting_point: activity.meeting_point,
            max_participants: activity.max_participants,
            // Tour system fields
            activity_type: activity.activity_type,
            active_days: activity.active_days,
            fixed_start_time: activity.fixed_start_time,
            price_per_participant: activity.price_per_participant,
            max_participants_per_day: activity.max_participants_per_day,
          }]
          
          return { items: newItems }
        })
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