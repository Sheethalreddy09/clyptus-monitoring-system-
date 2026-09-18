import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { KeyRound, CheckCircle, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import api from '../services/api';

export const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountInfo, setAccountInfo] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  // Step 1: Verify Email
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/v1/auth/forgot-password', { email: email.trim() });
      setAccountInfo({ name: res.data.name, role: res.data.role });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No account found with this email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/v1/auth/reset-password', {
        email: email.trim(),
        new_password: newPassword,
      });
      setSuccessMsg(res.data.message || 'Password reset successfully!');
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Clyptus Logo" className="h-16 w-auto object-contain mx-auto mb-2" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {step === 3 ? 'Password Reset Complete' : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1 && 'Enter your email to verify your Team Lead or Member account'}
            {step === 2 && 'Set a new password for your account'}
            {step === 3 && 'Your account password has been updated'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg">
            {error}
          </div>
        )}

        {/* STEP 1: VERIFY EMAIL */}
        {step === 1 && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <Input
              label="Account Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Verify Account
            </Button>
          </form>
        )}

        {/* STEP 2: ENTER NEW PASSWORD */}
        {step === 2 && accountInfo && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">{accountInfo.name}</div>
                <div className="text-[11px] text-slate-500">{email}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md bg-white border border-blue-200 text-blue-700">
                {accountInfo.role === 'TEAM_LEAD' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Team Lead</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Team Member</span>
                  </>
                )}
              </div>
            </div>

            <Input
              label="New Password *"
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password *"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Reset Password
            </Button>
          </form>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 3 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">{successMsg}</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Proceed to Sign In
            </Button>
          </div>
        )}

        {/* FOOTER LINK */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
