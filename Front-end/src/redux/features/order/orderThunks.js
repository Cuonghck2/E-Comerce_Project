import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('adminToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/orders`, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/orders/${orderId}`, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post(`${BASE_URL}/orders/create`, 
        {...orderData, idUser: user.id},
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, TrangThaiDonHang }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const user = JSON.parse(localStorage.getItem('user'));  
      const response = await axios.patch(
        `${BASE_URL}/orders/${orderId}/status`, 
        { TrangThaiDonHang,user }, // Request body
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, orderData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/orders/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/orders/${orderId}`);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/orders/${orderId}/cancel`,
        {},
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);