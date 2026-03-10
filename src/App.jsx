
import { useState, useEffect } from 'react'
import { useData } from './hooks/useData';
import { PlanSelector } from './components/PlanSelector';
import { Dashboard } from './components/Dashboard';
import { WorkoutView } from './components/WorkoutView';
import { HistoryView } from './components/HistoryView';
import { StatsView } from './components/StatsView';
import { CalendarView } from './components/CalendarView';
import { BottomNav } from './components/BottomNav';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { data, selectPlan, resetPlan, getCurrentDay } = useData();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history' | 'stats'
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  const currentDay = getCurrentDay();
  const needsOnboarding = !data.currentPlanId;

  const handleResetPlan = () => {
    if (confirm('Are you sure you want to change plans? This will reset your current progress in this cycle.')) {
      resetPlan();
      setShowSettings(false);
      setIsWorkoutActive(false);
    }
  }

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setEditingLog(null);
  }

  const editWorkout = (log) => {
    setEditingLog(log);
    setIsWorkoutActive(true);
  }

  const finishWorkout = () => {
    setIsWorkoutActive(false);
    if (!editingLog) {
      setActiveTab('dashboard'); // Redirect to dashboard to see summary
    }
    setEditingLog(null);
  }

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {needsOnboarding ? (
          <PlanSelector key="plan-selector" onSelect={selectPlan} />
        ) : (
          isWorkoutActive ? (
            <WorkoutView
              key="workout"
              planId={editingLog ? editingLog.planId : data.currentPlanId}
              dayId={editingLog ? editingLog.dayId : currentDay.id}
              editLog={editingLog}
              onFinish={finishWorkout}
              onBack={() => { setIsWorkoutActive(false); setEditingLog(null); }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="scroll-container" style={{ flex: 1 }}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ height: '100%' }}
                >
                  {activeTab === 'dashboard' && (
                    <Dashboard
                      onStartWorkout={startWorkout}
                      onOpenSettings={() => setShowSettings(true)}
                    />
                  )}
                  {activeTab === 'calendar' && <CalendarView onEditWorkout={editWorkout} />}
                  {activeTab === 'stats' && <StatsView />}
                  {activeTab === 'history' && <HistoryView onEditWorkout={editWorkout} />}
                </motion.div>
              </div>

              <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          )
        )}
      </AnimatePresence>

      {/* Simple Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowSettings(false)}>
          <div className="card" style={{ padding: '24px', width: '80%', maxWidth: '300px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Settings</h3>
            <button className="btn-secondary" style={{ width: '100%', color: 'var(--danger)', background: 'rgba(255, 69, 58, 0.1)' }} onClick={handleResetPlan}>
              Change Plan
            </button>
            <button style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'var(--primary)', marginTop: '8px', cursor: 'pointer' }} onClick={() => setShowSettings(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
