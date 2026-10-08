
import { LayoutDashboard, Calendar, TrendingUp, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav = ({ activeTab, onTabChange }) => {
    return (
        <div style={{
            width: '100%',
            background: 'rgba(28, 28, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            paddingTop: '8px',
            paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 16px))',
            zIndex: 1000,
            flexShrink: 0 // Ensure nav doesn't shrink
        }}>
            <Tab
                icon={<Calendar size={24} />}
                label="Kalender"
                isActive={activeTab === 'calendar'}
                onClick={() => onTabChange('calendar')}
            />
            <Tab
                icon={<LayoutDashboard size={24} />}
                label="Training"
                isActive={activeTab === 'dashboard'}
                onClick={() => onTabChange('dashboard')}
            />
            <Tab
                icon={<TrendingUp size={24} />}
                label="Fortschritt"
                isActive={activeTab === 'stats'}
                onClick={() => onTabChange('stats')}
            />
            <Tab
                icon={<User size={24} />}
                label="Profil"
                isActive={activeTab === 'profile'}
                onClick={() => onTabChange('profile')}
            />
        </div>
    );
};

const Tab = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        style={{
            background: 'transparent',
            border: 'none',
            color: isActive ? 'var(--primary)' : 'var(--text-tertiary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.7rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '8px 24px', // Wider touch area
            minWidth: '60px'
        }}
    >
        <motion.div whileTap={{ scale: 0.8 }}>{icon}</motion.div>
        {label}
    </button>
)
