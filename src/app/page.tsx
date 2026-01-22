'use client';

import { EnhancedAuraSphere } from '@/components/EnhancedAuraSphere';
import { TaskGrid } from '@/components/TaskGrid';
import { VoiceController } from '@/components/VoiceController';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { FeedbackToast } from '@/components/FeedbackToast';
import { ActionLog } from '@/components/ActionLog';
import { ConfirmActionModal } from '@/components/ConfirmActionModal';
import { useFirebaseSync } from '@/hooks/useFirebase';
import { useAuraStore } from '@/store/useAuraStore';
import { BackgroundGradientAnimation } from '@/components/aceternity/background-gradient-animation';
import { GridPattern } from '@/components/aceternity/grid-pattern';

export default function Home() {
  useFirebaseSync();
  const pendingAction = useAuraStore((state) => state.pendingAction);
  const executePendingAction = useAuraStore((state) => state.executePendingAction);
  const clearPendingAction = useAuraStore((state) => state.clearPendingAction);

  return (
    <>
      {/* Animated Background - OUTSIDE main content, won't affect LayoutGroup */}
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(2, 6, 23)"
        gradientBackgroundEnd="rgb(15, 23, 42)"
        firstColor="20, 184, 166"
        secondColor="245, 158, 11"
        thirdColor="225, 29, 72"
        fourthColor="100, 116, 139"
        fifthColor="45, 212, 191"
        pointerColor="20, 184, 166"
        size="80%"
        blendingValue="hard-light"
        interactive={false}
        containerClassName="fixed inset-0 -z-20"
      />

      {/* Grid Pattern Overlay */}
      <GridPattern
        width={40}
        height={40}
        className="fixed inset-0 -z-10 opacity-20"
        strokeDasharray="4 4"
      />

      <main className="min-h-screen bg-transparent text-slate-50 flex flex-col relative z-0">
        {/* Feedback Toast */}
        <FeedbackToast />
        
        {/* Confirmation Modal */}
        {pendingAction && (
          <ConfirmActionModal
            taskName={pendingAction.taskName}
            actionType={pendingAction.actionType}
            onConfirm={executePendingAction}
            onCancel={clearPendingAction}
          />
        )}
      {/* Global Header */}
      <header className="w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <img src="/logo.png" alt="Aura Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Aura</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Empathetic Proxy</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium opacity-40">
            <span>v1.0.0</span>
            <div className="w-px h-4 bg-white/10" />
            <span className="uppercase tracking-widest">System Optimal</span>
          </div>
        </div>
      </header>

      {/* Dashboard Substrate */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-6 gap-6">

        {/* Left Hub: Sticky Intelligence Sidebar */}
        <aside className="lg:w-80 flex flex-col gap-4 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
          {/* Sphere Visualizer Container - Now more compact and transparent */}
          <div className="relative flex flex-col items-center justify-center py-4 overflow-hidden group">
            <EnhancedAuraSphere />

            <div className="absolute bottom-2 left-0 right-0 text-center">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-10 group-hover:opacity-30 transition-opacity">
                Aura Matrix
              </div>
            </div>
          </div>

          {/* Voice & Emotion Control Hub */}
          <VoiceController />
          
          {/* Action Log */}
          <ActionLog />
        </aside>

        {/* Right Area: Action & Insights */}
        <section className="flex-1 flex flex-col gap-6 pb-20">
          {/* Main Task Interface */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Active Flow</h2>
            </div>
            <TaskGrid />
          </div>

          {/* Insights Layer */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Deep Analysis</h2>
            </div>
            <AnalyticsDashboard />
          </div>
        </section>
      </div>

      {/* Background Polish */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-calm/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-stressed/5 rounded-full blur-[120px]" />
      </div>
    </main>
    </>
  );
}
