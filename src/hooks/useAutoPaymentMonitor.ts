import { useEffect, useState, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useExecutePayments } from './useExecutePayments';
import { RoleData } from '@/types/role';
import { showToast } from '@/components/Toast/Toast';

interface AutoPaymentStatus {
  isMonitoring: boolean;
  nextPaymentTime: number | null;
  readyCount: number;
  lastCheck: number;
  autoExecuteEnabled: boolean;
}

export const useAutoPaymentMonitor = (
  roleData: RoleData | null | undefined,
  isCreator: boolean,
  isActive: boolean
) => {
  const account = useCurrentAccount();
  const executePayments = useExecutePayments(roleData?.id || '', roleData?.remainingBalance || 0);
  const [status, setStatus] = useState<AutoPaymentStatus>({
    isMonitoring: false,
    nextPaymentTime: null,
    readyCount: 0,
    lastCheck: Date.now(),
    autoExecuteEnabled: true,
  });
  const executingRef = useRef(false);
  const lastExecutionRef = useRef(0);

  useEffect(() => {
    // Only monitor if creator is connected and role is active
    if (!account || !isCreator || !roleData || !isActive || !status.autoExecuteEnabled) {
      setStatus(prev => ({ ...prev, isMonitoring: false }));
      return;
    }

    console.log('🤖 PAYMENT MONITOR: Started (display-only - bot executes)');
    setStatus(prev => ({ ...prev, isMonitoring: true }));

    const checkAndExecute = async () => {
      if (executingRef.current) {
        console.log('⏭️ AUTO-PAYMENT: Already executing, skipping...');
        return;
      }

      const now = Date.now();
      setStatus(prev => ({ ...prev, lastCheck: now }));

      // Find payments ready to execute
      const readyPayments = roleData.payments.filter(p => {
        const isExecuted = p.executed || roleData.executedPayments.some(
          ep => ep.recipient.toLowerCase() === p.recipient.toLowerCase() && 
               Math.abs(ep.amount - p.amount) < 100000
        );
        return !isExecuted && now >= p.scheduledTime;
      });

      // Find next upcoming payment
      const upcomingPayments = roleData.payments.filter(p => {
        const isExecuted = p.executed || roleData.executedPayments.some(
          ep => ep.recipient.toLowerCase() === p.recipient.toLowerCase() && 
               Math.abs(ep.amount - p.amount) < 100000
        );
        return !isExecuted && now < p.scheduledTime;
      });

      const nextPaymentTime = upcomingPayments.length > 0
        ? Math.min(...upcomingPayments.map(p => p.scheduledTime))
        : null;

      setStatus(prev => ({
        ...prev,
        readyCount: readyPayments.length,
        nextPaymentTime,
      }));

      // DISABLED: Auto-execute if payments are ready
      // Frontend auto-execution is disabled - payment-bot.js handles all executions
      // This monitor is now display-only to show payment status
      if (readyPayments.length > 0 && roleData.remainingBalance > 0) {
        console.log(`ℹ️ ${readyPayments.length} payment(s) ready - payment-bot.js will execute them`);
        
        // Show notification that bot will handle it
        if (now - lastExecutionRef.current > 60000) { // Only show once per minute
          lastExecutionRef.current = now;
          showToast({
            type: 'info',
            title: 'Payments Ready',
            message: `${readyPayments.length} payment(s) ready. Payment bot will execute automatically.`,
            duration: 5000,
          });
        }
      } else if (readyPayments.length > 0 && roleData.remainingBalance <= 0) {
        console.log('⚠️ Payments ready but insufficient balance!');
      }
    };

    // Initial check
    checkAndExecute();

    // Check every 15 seconds for display updates only
    const interval = setInterval(checkAndExecute, 15000);

    return () => {
      console.log('🛑 PAYMENT MONITOR: Stopped');
      clearInterval(interval);
    };
  }, [account, isCreator, roleData, isActive, status.autoExecuteEnabled, executePayments]);

  const toggleAutoExecute = () => {
    setStatus(prev => ({
      ...prev,
      autoExecuteEnabled: !prev.autoExecuteEnabled,
    }));

    showToast({
      type: 'info',
      title: status.autoExecuteEnabled ? 'Payment Monitor Disabled' : 'Payment Monitor Enabled',
      message: status.autoExecuteEnabled
        ? 'Payment status monitoring paused'
        : 'Monitoring payments - payment-bot.js will execute automatically',
      duration: 5000,
    });
  };

  return {
    status,
    toggleAutoExecute,
    isExecuting: executingRef.current,
  };
};
