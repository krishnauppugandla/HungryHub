import React, { useState } from "react";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Alert from "../../shared/components/UIElements/Alert";
import Card from "../../shared/components/UIElements/Card";
import api from "../../api";

const AddMenuItemForm = ({ restaurantName, onAdded }) => {
  const [form, setForm] = useState({ name: "", price: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/menuitem", { ...form, restaurantName, price: Number(form.price) });
      setForm({ name: "", price: "" });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item.");
    }
  };

  return (
    <Card className="add-form">
      <h3>Add Menu Item</h3>
      <Alert message={error} />
      <form onSubmit={handleSubmit}>
        <Input label="Item Name" id="name" value={form.name} onChange={handleChange} placeholder="Item name" required />
        <Input label="Price (₹)" id="price" type="number" value={form.price} onChange={handleChange} placeholder="0" required />
        <Button type="submit">Add Item</Button>
      </form>
    </Card>
  );
};

export default AddMenuItemForm;
