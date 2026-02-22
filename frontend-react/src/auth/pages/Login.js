import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Alert from "../../shared/components/UIElements/Alert";
import Card from "../../shared/components/UIElements/Card";
import api from "../../api";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.id || e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/login", form);
      const user = res.data.user || res.data;
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/restaurants");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to order your favourite food</p>

        <Alert message={error} />

        <form onSubmit={handleSubmit}>
          <Input label="Username" id="username" value={form.username} onChange={handleChange} placeholder="Enter your username" required />
          <Input label="Password" id="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />

          <div className="input-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="owner">Restaurant Owner</option>
            </select>
          </div>

          <Button type="submit" block disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
