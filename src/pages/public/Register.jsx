import { useState } from 'react';
import { State, City } from 'country-state-city';
import { UserPlus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

export default function RegisterForm({ onSuccess }) {
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    state: '',
    district: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const indianStates = State.getStatesOfCountry('IN');
  const stateDistricts = selectedStateCode
    ? City.getCitiesOfState('IN', selectedStateCode)
    : [];

  const handleStateChange = (e) => {
    const isoCode = e.target.value;
    const stateObj = indianStates.find((s) => s.isoCode === isoCode);

    setSelectedStateCode(isoCode);
    setFormData((prev) => ({
      ...prev,
      state: stateObj ? stateObj.name : '',
      district: '',
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // ─── Client-side validation ───
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!formData.state) {
      setError('Please select a state.');
      return;
    }
    if (!formData.district) {
      setError('Please select a district.');
      return;
    }

    // ─── Call the backend ───
    setBusy(true);
    try {
      const registeredName = formData.fullName.trim();
      const created = await authService.register({
        name: registeredName,
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.mobileNumber.trim() || null,
        state: formData.state,
        district: formData.district,
      });

      // Show success notification with user name
      setSuccessMsg(`Welcome, ${registeredName}! Registration successful.`);

      // Clear the form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobileNumber: '',
        state: '',
        district: '',
      });
      setSelectedStateCode('');

      // Brief delay before redirecting to allow reading the success banner
      setTimeout(() => {
        onSuccess?.(created);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* ─── Success Notification Banner ─── */}
      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 shadow-sm animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-900">
              Registration Successful!
            </p>
            <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
              {successMsg} Redirecting to login...
            </p>
          </div>
        </div>
      )}

      {/* ─── Error Banner ─── */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 shadow-sm">
          <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs text-red-800 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          required
          disabled={busy || !!successMsg}
          placeholder="e.g. Rahul Sharma"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          required
          disabled={busy || !!successMsg}
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
        />
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            disabled={busy || !!successMsg}
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Confirm password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            disabled={busy || !!successMsg}
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* Mobile Number */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Mobile number{' '}
          <span className="text-slate-400 font-normal">
            (Used for SMS alerts — optional)
          </span>
        </label>
        <input
          type="tel"
          name="mobileNumber"
          disabled={busy || !!successMsg}
          placeholder="+91 9876543210"
          value={formData.mobileNumber}
          onChange={handleChange}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
        />
      </div>

      {/* State */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          State <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedStateCode}
          onChange={handleStateChange}
          required
          disabled={busy || !!successMsg}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50"
        >
          <option value="">Select state</option>
          {indianStates.map((state) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          District <span className="text-red-500">*</span>
        </label>
        <select
          name="district"
          value={formData.district}
          onChange={handleChange}
          disabled={!selectedStateCode || busy || !!successMsg}
          required
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {selectedStateCode ? 'Select district' : 'First select a state'}
          </option>
          {stateDistricts.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={busy || !!successMsg}
        className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg transition-colors shadow-sm mt-2 inline-flex items-center justify-center gap-2"
      >
        {busy ? (
          'Creating account…'
        ) : (
          <>
            <UserPlus size={14} /> Create account
          </>
        )}
      </button>

      <p className="text-[11px] text-slate-500 text-center leading-normal">
        Your location (state and district) determines which weather alerts you
        will see. We do not share your personal data with third parties.
      </p>
    </form>
  );
}