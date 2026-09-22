import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { UserRole } from '../types';
import api from '../services/api';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('TEAM_LEAD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/v1/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      register(res.data.access_token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Clyptus Logo" className="h-16 w-auto object-contain mx-auto mb-2" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Clyptus Monitoring System</h2>
          <p className="text-xs text-slate-500 mt-1">Register to start managing projects</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Sarah Jenkins"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="sarah@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password *"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Select
            label="Register As Role *"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'TEAM_LEAD', label: 'Team Lead' },
            ]}
          />

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
