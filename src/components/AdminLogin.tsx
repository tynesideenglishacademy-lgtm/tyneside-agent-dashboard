import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { signInAdmin, type AdminSession } from '../lib/adminAuth';

interface AdminLoginProps {
  onSignedIn: (session: AdminSession) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      onSignedIn(await signInAdmin(email, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#07111f',
      padding: '2rem'
    }}>
      <form
        onSubmit={submit}
        style={{
          width: 'min(100%, 420px)',
          background: 'rgba(15, 28, 45, 0.96)',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 20,
          padding: '2rem',
          color: '#fff',
          boxShadow: '0 24px 80px rgba(0,0,0,.35)'
        }}
      >
        <ShieldCheck size={36} style={{ marginBottom: 16 }} />
        <h1 style={{ margin: '0 0 .5rem' }}>Tyneside Agent Dashboard</h1>
        <p style={{ margin: '0 0 1.5rem', opacity: .72 }}>
          Administrator authentication is required.
        </p>

        {error && (
          <div style={{
            padding: '.85rem 1rem',
            marginBottom: '1rem',
            borderRadius: 12,
            background: 'rgba(239,68,68,.12)',
            border: '1px solid rgba(239,68,68,.35)'
          }}>
            {error}
          </div>
        )}

        <label style={{ display: 'block', marginBottom: '.9rem' }}>
          <span style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '.85rem 1rem', borderRadius: 10, border: '1px solid #334155' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '1.25rem' }}>
          <span style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '.85rem 1rem', borderRadius: 10, border: '1px solid #334155' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '.9rem 1rem',
            border: 0,
            borderRadius: 10,
            fontWeight: 800,
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          <LockKeyhole size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {loading ? 'Authenticating…' : 'Sign in securely'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
