import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function SignIn() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    setTimeout(() => navigate('/'), 0);
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error: e } = await signIn(email, password);
        if (e) throw e;
        navigate('/my-orders');
      } else {
        if (!fullName.trim()) throw new Error('Please enter your name');
        const { error: e } = await signUp(email, password, fullName);
        if (e) throw e;
        setError('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-display font-bold text-center">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          {mode === 'signin'
            ? 'Sign in to view your catering orders'
            : 'Save your info for faster checkout'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="label">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div
              className={`rounded-lg p-3 text-sm ${
                error.includes('Account created')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-primary-600 font-semibold hover:underline"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-primary-600 font-semibold hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
