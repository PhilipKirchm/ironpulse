
import { PLANS } from '../data/plans';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export const PlanSelector = ({ onSelect }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '24px', paddingTop: '60px' }}
        >
            <h1 className="title-lg" style={{ textAlign: 'center' }}>Select Goal</h1>
            <p className="subtitle" style={{ textAlign: 'center', marginBottom: '40px' }}>Choose a training protocol.</p>

            <div style={{ display: 'grid', gap: '16px' }}>
                {PLANS.map((plan, i) => (
                    <motion.div
                        key={plan.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileTap={{ scale: 0.98 }}
                        className="card"
                        style={{ padding: '24px', cursor: 'pointer', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onClick={() => onSelect(plan.id)}
                    >
                        <div style={{ flex: 1 }}>
                            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '600' }}>{plan.name}</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{plan.description}</p>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                                {plan.days.slice(0, 5).map(d => (
                                    <span key={d.id} style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', background: 'var(--bg-card-highlight)', padding: '4px 8px', borderRadius: '4px' }}>
                                        {d.name.split(' ')[0]}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <ChevronRight color="var(--text-tertiary)" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
