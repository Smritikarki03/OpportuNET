import React, { useState } from 'react';

const EmailOTP = ({ email, onVerify, onResend, loading, error }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8 mt-8">
      <h2 className="text-xl font-bold text-teal-700 mb-2">Verify Your Email</h2>
      <p className="mb-4 text-gray-600">An OTP has been sent to <span className="font-semibold">{email}</span>. Please enter it below to continue.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          className="border rounded px-4 py-2 text-lg tracking-widest text-center"
          placeholder="Enter 6-digit OTP"
          disabled={loading}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded disabled:opacity-50"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      <button
        onClick={onResend}
        className="mt-4 text-teal-600 hover:underline text-sm"
        disabled={loading}
      >
        Resend OTP
      </button>
    </div>
  );
};

export default EmailOTP; 