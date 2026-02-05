import React, { useState } from 'react';
import { useWallet } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useNavigate } from 'react-router-dom';

const PACKAGE_ID = '0x0067cc0149eabee42d24049acabd450486977295fac652f71dd5b2f4f69cbdab'; // Your package ID

function RoleCreation() {
  const { currentAccount, signAndExecuteTransactionBlock } = useWallet();
  const navigate = useNavigate();
  
  // Form state
  const [roleName, setRoleName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [leftoverRecipient, setLeftoverRecipient] = useState('');
  const [developerFee, setDeveloperFee] = useState('10000000'); // 0.01 SUI in MIST
  
  // Payment fields
  const [payments, setPayments] = useState([
    { recipient: '', amount: '', scheduledDate: '' }
  ]);
  
  const [loading, setLoading] = useState(false);

  // Add payment row
  const addPayment = () => {
    setPayments([...payments, { recipient: '', amount: '', scheduledDate: '' }]);
  };

  // Remove payment row
  const removePayment = (index) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);
  };

  // Update payment field
  const updatePayment = (index, field, value) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  // Handle form submission
  const handleCreateRole = async (e) => {
    e.preventDefault();

    if (!currentAccount) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);

      // ===== FIX: Proper date to timestamp conversion =====
      const startTimeMs = new Date(startDate).getTime();
      const expiryTimeMs = new Date(expiryDate).getTime();

      // Validate timestamps
      if (isNaN(startTimeMs) || isNaN(expiryTimeMs)) {
        alert('Invalid date format. Please select valid dates.');
        setLoading(false);
        return;
      }

      const now = Date.now();
      
      if (startTimeMs >= expiryTimeMs) {
        alert('Start date must be before expiry date');
        setLoading(false);
        return;
      }

      // Debug logs
      console.log('=== DATE VALIDATION ===');
      console.log('Current time:', now, new Date(now));
      console.log('Start time:', startTimeMs, new Date(startTimeMs));
      console.log('Expiry time:', expiryTimeMs, new Date(expiryTimeMs));

      // Prepare payment data
      const recipients = [];
      const amounts = [];
      const scheduledTimes = [];

      for (const payment of payments) {
        if (!payment.recipient || !payment.amount || !payment.scheduledDate) {
          alert('Please fill in all payment fields');
          setLoading(false);
          return;
        }

        // ===== FIX: Convert payment scheduled date to timestamp =====
        const scheduledTimeMs = new Date(payment.scheduledDate).getTime();
        
        if (isNaN(scheduledTimeMs)) {
          alert('Invalid payment scheduled date');
          setLoading(false);
          return;
        }

        if (scheduledTimeMs < startTimeMs || scheduledTimeMs > expiryTimeMs) {
          alert('Payment scheduled time must be between start and expiry dates');
          setLoading(false);
          return;
        }

        recipients.push(payment.recipient);
        amounts.push(Math.floor(parseFloat(payment.amount) * 1000000000)); // Convert SUI to MIST
        scheduledTimes.push(scheduledTimeMs);
        
        console.log(`Payment ${recipients.length}:`, scheduledTimeMs, new Date(scheduledTimeMs));
      }

      // Convert role name to bytes
      const nameBytes = Array.from(new TextEncoder().encode(roleName));

      // Set leftover recipient (default to creator if not specified)
      const leftoverAddr = leftoverRecipient || currentAccount.address;

      // Build transaction
      const txb = new TransactionBlock();

      txb.moveCall({
        target: `${PACKAGE_ID}::role::create_role`,
        arguments: [
          txb.pure(nameBytes, 'vector<u8>'),
          txb.pure(startTimeMs, 'u64'),              // ✅ Correct timestamp in milliseconds
          txb.pure(expiryTimeMs, 'u64'),             // ✅ Correct timestamp in milliseconds
          txb.pure(recipients, 'vector<address>'),
          txb.pure(amounts, 'vector<u64>'),
          txb.pure(scheduledTimes, 'vector<u64>'),   // ✅ Correct timestamps in milliseconds
          txb.pure(leftoverAddr, 'address'),
          txb.pure(developerFee, 'u64'),
        ],
      });

      console.log('=== TRANSACTION DATA ===');
      console.log('Name:', roleName);
      console.log('Start:', startTimeMs);
      console.log('Expiry:', expiryTimeMs);
      console.log('Recipients:', recipients);
      console.log('Amounts:', amounts);
      console.log('Scheduled Times:', scheduledTimes);

      // Execute transaction
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      console.log('Transaction result:', result);

      // Find created role object
      const createdObjects = result.effects?.created || [];
      const roleObject = createdObjects.find(obj => 
        obj.owner?.Shared !== undefined
      );

      if (roleObject) {
        alert(`Role created successfully!\nRole ID: ${roleObject.reference.objectId}`);
        console.log('Created Role ID:', roleObject.reference.objectId);
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        alert('Role created successfully!');
      }

    } catch (error) {
      console.error('Error creating role:', error);
      alert('Failed to create role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get current date-time in local timezone for input default
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get date-time 30 days from now
  const getDateTimePlus30Days = () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const year = future.getFullYear();
    const month = String(future.getMonth() + 1).padStart(2, '0');
    const day = String(future.getDate()).padStart(2, '0');
    const hours = String(future.getHours()).padStart(2, '0');
    const minutes = String(future.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your Sui wallet to create a role</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Payment Role</h2>

          <form onSubmit={handleCreateRole} className="space-y-6">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Marketing Team Salary"
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {startDate && new Date(startDate).toLocaleString()}
              </p>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date & Time *
              </label>
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {expiryDate && new Date(expiryDate).toLocaleString()}
              </p>
            </div>

            {/* Payments Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Schedule *
                </label>
                <button
                  type="button"
                  onClick={addPayment}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  + Add Payment
                </button>
              </div>

              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Payment #{index + 1}</h4>
                      {payments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePayment(index)}
                          className="text-red-600 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Recipient Address
                        </label>
                        <input
                          type="text"
                          value={payment.recipient}
                          onChange={(e) => updatePayment(index, 'recipient', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0x..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Amount (SUI)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={payment.amount}
                          onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="10.5"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Scheduled Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={payment.scheduledDate}
                          onChange={(e) => updatePayment(index, 'scheduledDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {payment.scheduledDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Will execute: {new Date(payment.scheduledDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leftover Recipient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leftover Funds Recipient (Optional)
              </label>
              <input
                type="text"
                value={leftoverRecipient}
                onChange={(e) => setLeftoverRecipient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={currentAccount.address}
              />
              <p className="text-xs text-gray-500 mt-1">
                Defaults to your address if not specified
              </p>
            </div>

            {/* Developer Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer Fee (MIST)
              </label>
              <input
                type="number"
                value={developerFee}
                onChange={(e) => setDeveloperFee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10000000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(developerFee / 1000000000).toFixed(4)} SUI
              </p>
            </div>

            {/* Quick Date Buttons */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Set Dates:</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStartDate(getCurrentDateTime());
                    setExpiryDate(getDateTimePlus30Days());
                  }}
                  className="px-3 py-1 bg-white border border-blue-300 text-blue-700 text-sm rounded hover:bg-blue-50"
                >
                  Now → +30 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = getCurrentDateTime();
                    setStartDate(now);
                    setPayments([{ ...payments[0], scheduledDate: now }]);
                  }}
                  className="px-3 py-1 bg-white border border-blue-300 text-blue-700 text-sm rounded hover:bg-blue-50"
                >
                  Set All to Now
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Creating Role...' : 'Create Role'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoleCreation;