import { api } from '../index';

class CartService {
  async getAllProducts() {
    try {
      const { data } = await api.get(`/buyers/cart`);
      if (data) return data;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }

  async updateCartItem(productId, quantity) {
    try {
      const { data } = await api.put(`/buyers/cart/update/${productId}`, {
        quantity,
      });
      return data;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }

  async addToCartItem(productId, quantity) {
    try {
      const { data } = await api.post(`/buyers/cart/add`, {
        productId,
        quantity,
      });
      return data;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }

  async deleteCartItem(productId) {
    try {
      const { data } = await api.delete(`/buyers/cart/remove/${productId}`);
      return data;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }
}

export default new CartService();
