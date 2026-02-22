import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import OrderForm from "../components/OrderForm";
import Button from "../../shared/components/FormElements/Button";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Alert from "../../shared/components/UIElements/Alert";
import Card from "../../shared/components/UIElements/Card";
import api from "../../api";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get(`/cart/${user._id}`);
        setCartItems(res.data);
      } catch {
        setError("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const total = cartItems.reduce((sum, item) => sum + (item.menuItem?.price || 0) * item.quantity, 0);

  const handlePlaceOrder = async ({ address, phone }) => {
    setOrdering(true);
    setError("");
    try {
      await api.post("/orders", {
        user: user._id,
        address,
        phone,
        items: cartItems.map((item) => ({ menuItem: item.menuItem?._id, quantity: item.quantity })),
      });
      setOrderSuccess(true);
      setCartItems([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading cart..." />;

  if (orderSuccess) {
    return (
      <div className="cart-success">
        <Card className="cart-success__card">
          <div className="cart-success__icon">✅</div>
          <h2>Order Placed!</h2>
          <p>Your order has been placed successfully.</p>
          <Button block onClick={() => navigate("/orders")}>View Orders</Button>
          <Button block variant="outline" onClick={() => navigate("/restaurants")}>Order More</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Your Cart</h2>
      </div>

      <Alert message={error} />

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Button onClick={() => navigate("/restaurants")}>Browse Restaurants</Button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-layout__items">
            {cartItems.map((item) => <CartItem key={item._id} item={item} />)}
            <div className="cart-layout__total">Total: ₹{total}</div>
          </div>
          <OrderForm total={total} onSubmit={handlePlaceOrder} loading={ordering} error={error} />
        </div>
      )}
    </div>
  );
};

export default Cart;
