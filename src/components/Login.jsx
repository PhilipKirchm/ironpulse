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
            const res = registerUser ? registerUser(name.trim(), password) : { ok: false, error: 'Registrierung nicht verfügbar' };
            if (!res.ok) setError(res.error || 'Registrierung fehlgeschlagen');
        } else {
            const res = loginUser ? loginUser(name.trim(), password) : { ok: false, error: 'Anmeldung nicht verfügbar' };
            if (!res.ok) setError(res.error || 'Anmeldung fehlgeschlagen');
        }
    };

    return (
        <div className="scroll-container" style={{ padding: 24, paddingTop: 64, height: '100%', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: 420, margin: '18px auto' }}>
                <div className="card" style={{ padding: 20 }}>
                    <h1 style={{ margin: 0, textAlign: 'center' }}>{mode === 'register' ? 'Konto erstellen' : 'Anmelden'}</h1>
                    <p className="subtitle" style={{ textAlign: 'center', marginTop: 6 }}>{mode === 'register' ? 'Wähle einen Namen und ein Passwort, um zu starten' : 'Melde dich mit Name und Passwort an'}</p>

                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                        <input className="input-field" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                        <input className="input-field" placeholder="Passwort" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

                        <button type="submit" className="btn-primary">{mode === 'register' ? 'Registrieren' : 'Anmelden'}</button>
                        <button type="button" className="btn-secondary" onClick={() => setMode(mode === 'register' ? 'login' : 'register')}>
                            {mode === 'register' ? 'Schon ein Konto? Anmelden' : 'Noch kein Konto? Registrieren'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
