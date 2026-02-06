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

    console.log('🤖 AUTO-PAYMENT MONITOR: Started');
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

      // Auto-execute if payments are ready
      if (readyPayments.length > 0 && roleData.remainingBalance > 0) {
        // Prevent duplicate executions (min 10 seconds between executions)
        if (now - lastExecutionRef.current < 10000) {
          console.log('⏳ AUTO-PAYMENT: Cooldown period, waiting...');
          return;
        }

        console.log(`🚀 AUTO-PAYMENT: ${readyPayments.length} payment(s) ready! Executing automatically...`);
        executingRef.current = true;
        lastExecutionRef.current = now;

        try {
          showToast({
            type: 'info',
            title: 'Auto-Payment Executing',
            message: `Automatically executing ${readyPayments.length} payment(s)...`,
            duration: 5000,
          });

          await executePayments.mutateAsync();

          showToast({
            type: 'success',
            title: 'Auto-Payment Success!',
            message: `${readyPayments.length} payment(s) executed automatically!`,
            duration: 8000,
          });

          console.log('✅ AUTO-PAYMENT: Execution successful!');
        } catch (error) {
          console.error('❌ AUTO-PAYMENT: Execution failed:', error);
          showToast({
            type: 'error',
            title: 'Auto-Payment Failed',
            message: `Failed to execute payments: ${(error as Error).message}`,
            duration: 10000,
          });
        } finally {
          executingRef.current = false;
        }
      } else if (readyPayments.length > 0 && roleData.remainingBalance <= 0) {
        console.log('⚠️ AUTO-PAYMENT: Payments ready but insufficient balance!');
      }
    };

    // Initial check
    checkAndExecute();

    // Check every 15 seconds for payments that are ready
    const interval = setInterval(checkAndExecute, 15000);

    return () => {
      console.log('🛑 AUTO-PAYMENT MONITOR: Stopped');
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
      title: status.autoExecuteEnabled ? 'Auto-Payments Disabled' : 'Auto-Payments Enabled',
      message: status.autoExecuteEnabled
        ? 'Payments will no longer execute automatically'
        : 'Payments will execute automatically when time arrives',
      duration: 5000,
    });
  };

  return {
    status,
    toggleAutoExecute,
    isExecuting: executingRef.current,
  };
};
