import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart,
  clearCart 
} from '../redux/features/cart/cartThunks';

export const useCart = () => {
  const dispatch = useDispatch();
  const { cartItems, isLoading, error, totalAmount } = useSelector(state => state.cart);

  const handleFetchCart = async () => {
    try {
      await dispatch(fetchCart()).unwrap();
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleAddToCart = async (productData) => {
    try {
    console.log("productData",productData);
      await dispatch(addToCart(productData)).unwrap();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const handleUpdateCartItem = async (itemId, quantity) => {
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  return {
    cartItems,
    isLoading,
    error,
    totalAmount,
    handleFetchCart,
    handleAddToCart,
    handleUpdateCartItem,
    handleRemoveFromCart,
    handleClearCart
  };
};