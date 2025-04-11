import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/features/auth/authSlice';
import authAdminReducer from './redux/features/auth/adminAuthSlice';
import productReducer from './redux/features/product/productSlice';
import cartReducer from './redux/features/cart/cartSlice';
import categoryReducer from './redux/features/category/categorySlice';
import orderReducer from './redux/features/order/orderSlice';
import supplierReducer from './redux/features/supplier/supplierSlice';
import userReducer from './redux/features/user/userslice';
import discountReducer from './redux/features/discount/discountSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    authAdmin: authAdminReducer,
    products: productReducer,
    cart: cartReducer,
    categories: categoryReducer,
    orders: orderReducer,
    suppliers: supplierReducer,
    users: userReducer,
    discounts: discountReducer,
  },
});

export default store;