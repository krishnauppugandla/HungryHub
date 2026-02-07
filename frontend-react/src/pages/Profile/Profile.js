import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { API } from "../../constants/api";
import toast from "react-hot-toast";

const Section = ({ title, children }) => (
  <div className="card p-6 mb-4">
    <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

const AddressCard = ({ address, onSetDefault, onDelete }) => (
  <div className={`border rounded-xl p-4 ${address.isDefault ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
    <div className="flex justify-between items-start mb-1">
      <span className="font-medium text-sm">{address.label}</span>
      {address.isDefault && (
        <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-0.5 rounded-full">Default</span>
      )}
    </div>
    <p className="text-sm text-gray-600">{address.street}{address.apartment ? `, ${address.apartment}` : ""}</p>
    <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
    {address.instructions && <p className="text-xs text-gray-400 mt-1">📝 {address.instructions}</p>}
    <div className="flex gap-3 mt-3">
      {!address.isDefault && (
        <button onClick={() => onSetDefault(address._id)} className="text-xs text-red-600 hover:underline font-medium">
          Set as default
        </button>
      )}
      <button onClick={() => onDelete(address._id)} className="text-xs text-gray-400 hover:text-red-500 hover:underline">
        Delete
      </button>
    </div>
  </div>
);

const LABELS = ["Home", "Work", "Other"];

const AddAddressForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({
    label: "Home", street: "", apartment: "", city: "", state: "", zipCode: "", instructions: "",
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post(API.ADDRESSES, form);
      onSave(data.data);
      toast.success("Address added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 mt-4 border-t pt-4">
      <div className="flex gap-2">
        {LABELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setForm((p) => ({ ...p, label: l }))}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              form.label === l ? "bg-red-500 text-white border-red-500" : "border-gray-200 text-gray-600"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="street" placeholder="Street address*" value={form.street} onChange={handle} required className="input-field col-span-2" />
        <input name="apartment" placeholder="Apt / Suite" value={form.apartment} onChange={handle} className="input-field" />
        <input name="city" placeholder="City*" value={form.city} onChange={handle} required className="input-field" />
        <input name="state" placeholder="State*" value={form.state} onChange={handle} required className="input-field" />
        <input name="zipCode" placeholder="ZIP Code*" value={form.zipCode} onChange={handle} required className="input-field" />
        <input name="instructions" placeholder="Delivery instructions (optional)" value={form.instructions} onChange={handle} className="input-field col-span-2" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? "Saving..." : "Save address"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </form>
  );
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    api.get(API.ADDRESSES)
      .then(({ data }) => setAddresses(data.data || []))
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.patch(API.PROFILE, profileForm);
      updateUser(data.data.user || data.data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await api.post(API.CHANGE_PASSWORD, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddressSaved = (newAddress) => {
    setAddresses((prev) => [...prev, newAddress]);
    setShowAddressForm(false);
  };

  const handleSetDefault = async (addressId) => {
    try {
      await api.patch(API.ADDRESS_DEFAULT(addressId));
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a._id === addressId })));
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to update default address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await api.delete(API.ADDRESS(addressId));
      setAddresses((prev) => prev.filter((a) => a._id !== addressId));
      toast.success("Address removed");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="page-container py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My profile</h1>

      <div className="card p-6 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-lg">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      <Section title="Personal information">
        <form onSubmit={handleProfileSave} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full name</label>
            <input
              value={profileForm.name}
              onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone number</label>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
              className="input-field"
              placeholder="(555) 000-0000"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email address</label>
            <input value={user?.email} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>
      </Section>

      <Section title="Change password">
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            placeholder="Current password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="New password (min 8 characters)"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            className="input-field"
            required
            minLength={8}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            className="input-field"
            required
          />
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? "Changing..." : "Change password"}
          </button>
        </form>
      </Section>

      <Section title="Saved addresses">
        {loadingAddresses ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        ) : (
          <>
            {addresses.length === 0 && !showAddressForm && (
              <p className="text-gray-400 text-sm mb-3">No saved addresses yet.</p>
            )}
            <div className="space-y-3">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr._id}
                  address={addr}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDeleteAddress}
                />
              ))}
            </div>
            {showAddressForm ? (
              <AddAddressForm onSave={handleAddressSaved} onCancel={() => setShowAddressForm(false)} />
            ) : (
              addresses.length < 5 && (
                <button onClick={() => setShowAddressForm(true)} className="btn-outline mt-3 text-sm w-full">
                  + Add new address
                </button>
              )
            )}
          </>
        )}
      </Section>
    </div>
  );
};

export default Profile;
