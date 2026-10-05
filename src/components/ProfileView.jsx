import { useData } from '../hooks/useData';
import { motion } from 'framer-motion';
import { User, LogOut, Shield } from 'lucide-react';

export const ProfileView = () => {
    const { data, logoutUser } = useData();

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '24px', paddingBottom: '100px' }}
        >
            <h1 className="title-lg" style={{ paddingTop: '40px' }}>Profile</h1>

            <div className="card" style={{ padding: '24px', marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-card-highlight)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <User size={40} color="var(--primary)" />
                </div>
                <h2 style={{ margin: '0 0 8px 0' }}>{data.user?.name || 'Workout Enthusiast'}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                    <Shield size={16} /> Data is secured locally on this device
                </div>

                <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Workouts</span>
                        <span style={{ fontWeight: 'bold' }}>{(data.logs || []).length}</span>
                    </div>
                </div>
            </div>

            <button 
                className="btn-secondary" 
                onClick={logoutUser} 
                style={{ width: '100%', marginTop: '24px', color: 'var(--danger)', background: 'rgba(255, 69, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <LogOut size={20} /> Sign Out
            </button>
        </motion.div>
    );
};
