import { useData } from '../hooks/useData';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { User, LogOut, Shield, Download, Upload, Copy } from 'lucide-react';

export const ProfileView = () => {
    const { data, logoutUser, exportUserData, importUserData } = useData();
    const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }
    const [pasteText, setPasteText] = useState('');

    const show = (type, text) => setMessage({ type, text });

    const handleDownload = () => {
        try {
            const blob = new Blob([exportUserData()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ironpulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            show('ok', 'Backup erstellt. Falls kein Download startet, nutze "Backup kopieren".');
        } catch {
            show('error', 'Download nicht möglich. Nutze "Backup kopieren".');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(exportUserData());
            show('ok', 'Backup in die Zwischenablage kopiert. Füge es z. B. in eine Notiz oder Mail an dich selbst ein.');
        } catch {
            show('error', 'Kopieren nicht erlaubt. Versuche "Backup herunterladen".');
        }
    };

    const runImport = (text) => {
        if (!window.confirm('Import ersetzt deine aktuellen Trainingsdaten. Fortfahren?')) return;
        const res = importUserData(text);
        if (res.ok) {
            show('ok', `${res.imported} Workouts importiert${res.skipped ? `, ${res.skipped} ungültige übersprungen` : ''}.`);
            setPasteText('');
        } else {
            show('error', `Import fehlgeschlagen: ${res.error}`);
        }
    };

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        runImport(await file.text());
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '24px', paddingBottom: '100px' }}
        >
            <h1 className="title-lg" style={{ paddingTop: '40px' }}>Profil</h1>

            <div className="card" style={{ padding: '24px', marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-card-highlight)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <User size={40} color="var(--primary)" />
                </div>
                <h2 style={{ margin: '0 0 8px 0' }}>{data.user?.name || 'Sportler'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                    <Shield size={16} /> Daten werden nur lokal auf diesem Gerät gespeichert
                </div>

                <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Workouts insgesamt</span>
                        <span style={{ fontWeight: 'bold' }}>{(data.logs || []).length}</span>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '20px', marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 6px 0' }}>Backup</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
                    Deine Daten liegen nur auf diesem Gerät. Sichere sie regelmäßig.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn-secondary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Download size={18} /> Backup herunterladen
                    </button>
                    <button className="btn-secondary" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Copy size={18} /> Backup kopieren
                    </button>
                    <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', textAlign: 'center' }}>
                        <Upload size={18} /> Backup-Datei importieren
                        <input type="file" accept="application/json,.json" onChange={handleFile} style={{ display: 'none' }} />
                    </label>
                    <textarea
                        className="input-field"
                        placeholder="Oder Backup-Text hier einfügen…"
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        rows={3}
                        style={{ resize: 'vertical' }}
                    />
                    {pasteText.trim() && (
                        <button className="btn-primary" onClick={() => runImport(pasteText)}>Eingefügten Text importieren</button>
                    )}
                    {message && (
                        <div style={{ fontSize: '0.85rem', color: message.type === 'ok' ? 'var(--accent)' : 'var(--danger)' }}>{message.text}</div>
                    )}
                </div>
            </div>

            <button 
                className="btn-secondary" 
                onClick={logoutUser} 
                style={{ width: '100%', marginTop: '24px', color: 'var(--danger)', background: 'rgba(255, 69, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <LogOut size={20} /> Abmelden
            </button>
        </motion.div>
    );
};
