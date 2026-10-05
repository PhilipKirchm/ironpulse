import React, { useState } from 'react';

export const Login = ({ registerUser, loginUser }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState('login'); // or 'register'
    const [error, setError] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        setError(null);
        if (mode === 'register') {
            const res = registerUser ? registerUser(name.trim(), password) : { ok: false, error: 'No register function' };
            if (!res.ok) setError(res.error || 'Unable to register');
        } else {
            const res = loginUser ? loginUser(name.trim(), password) : { ok: false, error: 'No login function' };
            if (!res.ok) setError(res.error || 'Login failed');
        }
    };

    return (
        <div className="scroll-container" style={{ padding: 24, paddingTop: 64, height: '100%', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: 420, margin: '18px auto' }}>
                <div className="card" style={{ padding: 20 }}>
                    <h1 style={{ margin: 0, textAlign: 'center' }}>{mode === 'register' ? 'Create Account' : 'Sign In'}</h1>
                    <p className="subtitle" style={{ textAlign: 'center', marginTop: 6 }}>{mode === 'register' ? 'Create a name and password to get started' : 'Sign in with your name and password'}</p>

                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                        <input className="input-field" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                        <input className="input-field" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

                        <button type="submit" className="btn-primary">{mode === 'register' ? 'Register' : 'Login'}</button>
                        <button type="button" className="btn-secondary" onClick={() => setMode(mode === 'register' ? 'login' : 'register')}>
                            {mode === 'register' ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
