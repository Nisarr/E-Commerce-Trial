import { useCartStore } from '../store/cartStore';

export const useCart = () => {
  const store = useCartStore();
  
  const totalItems = store.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = store.items.reduce(
    (acc, item) => acc + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );

  return {
    ...store,
    totalItems,
    totalPrice,
  };
};
