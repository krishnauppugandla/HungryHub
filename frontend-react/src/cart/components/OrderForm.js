import React, { useState } from "react";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import Alert from "../../shared/components/UIElements/Alert";
import "./OrderForm.css";

const OrderForm = ({ total, onSubmit, loading, error }) => {
  const [form, setForm] = useState({ address: "", phone: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card className="order-form">
      <h3>Delivery Details</h3>
      <Alert message={error} />
      <form onSubmit={handleSubmit}>
        <Input label="Delivery Address" id="address" value={form.address} onChange={handleChange} placeholder="Enter your full address" rows={3} required />
        <Input label="Phone Number" id="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" required />
        <div className="order-form__total">Total: ₹{total}</div>
        <Button type="submit" block disabled={loading}>
          {loading ? "Placing Order..." : "Place Order"}
        </Button>
      </form>
    </Card>
  );
};

export default OrderForm;
