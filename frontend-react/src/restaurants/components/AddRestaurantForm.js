import React, { useState } from "react";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Alert from "../../shared/components/UIElements/Alert";
import Card from "../../shared/components/UIElements/Card";
import api from "../../api";

const AddRestaurantForm = ({ onAdded }) => {
  const [form, setForm] = useState({ name: "", owner: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/restaurants", form);
      setForm({ name: "", owner: "" });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add restaurant.");
    }
  };

  return (
    <Card className="add-form">
      <h3>Add New Restaurant</h3>
      <Alert message={error} />
      <form onSubmit={handleSubmit}>
        <Input label="Restaurant Name" id="name" value={form.name} onChange={handleChange} placeholder="Restaurant name" required />
        <Input label="Owner" id="owner" value={form.owner} onChange={handleChange} placeholder="Owner name" required />
        <Button type="submit">Add Restaurant</Button>
      </form>
    </Card>
  );
};

export default AddRestaurantForm;
