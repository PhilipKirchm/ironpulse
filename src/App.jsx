
import { Component, useState } from 'react'
import { useData } from './hooks/useData';
import { PlanSelector } from './components/PlanSelector';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { WorkoutView } from './components/WorkoutView';
import { HistoryView } from './components/HistoryView';
import { StatsView } from './components/StatsView';
import { CalendarView } from './components/CalendarView';
import { BottomNav } from './components/BottomNav';
import { ProfileView } from './components/ProfileView';
import { motion, AnimatePresence } from 'framer-motion';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', color: '#fff', background: '#000' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--danger)', marginBottom: 12 }}>Etwas ist schiefgelaufen</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
            Ein unerwarteter Fehler ist aufgetreten.
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            App Neu Laden
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { data, selectPlan, getCurrentDay, registerUser, loginUser } = useData();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history' | 'stats' | 'profile'
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  const currentDay = getCurrentDay();
  const needsOnboarding = !data.user || (!data.currentPlanId && !isChangingPlan);

  const handleOpenPlanSelector = () => {
    setShowSettings(false);
    setIsChangingPlan(true);
  };

  const handleSelectPlan = (planId) => {
    selectPlan(planId);
    setIsChangingPlan(false);
  };

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
    <ErrorBoundary>
      <div className="app-container">
        <AnimatePresence mode="wait">
          {needsOnboarding || isChangingPlan ? (
            !data.user ? (
              <Login key="login" registerUser={registerUser} loginUser={loginUser} />
            ) : (
              <div key="plan-selector-wrapper" style={{ height: '100%', position: 'relative' }}>
                {isChangingPlan && data.currentPlanId && (
                  <button
                    onClick={() => setIsChangingPlan(false)}
                    style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, background: 'var(--bg-card-highlight)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    &larr; Zurück
                  </button>
                )}
                <PlanSelector onSelect={handleSelectPlan} />
              </div>
            )
          ) : (
            isWorkoutActive ? (
              <WorkoutView
                key="workout"
                planId={editingLog ? editingLog.planId : data.currentPlanId}
                dayId={editingLog ? editingLog.dayId : currentDay?.id}
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
                    {activeTab === 'profile' && <ProfileView />}
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
              <h3 style={{ marginTop: 0 }}>Einstellungen</h3>
              <button className="btn-primary" style={{ width: '100%', marginBottom: '10px' }} onClick={handleOpenPlanSelector}>
                Plan Wechseln / Bearbeiten
              </button>
              <button style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setShowSettings(false)}>
                Abbrechen
              </button>
            </div>
          </div>
        )}

      </div>
    </ErrorBoundary>
  )
}

export default App

