import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Coins, RotateCcw, AlertTriangle } from 'lucide-react';

function BookingLedger({ bookingId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLedger() {
      try {
        const res = await api.get(`/payments/booking/${bookingId}`);
        setPayments(res.data.payments);
      } catch (err) {
        setError('Failed to load transaction ledger.');
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) {
      fetchLedger();
    }
  }, [bookingId]);

  if (loading) {
    return <span className="text-xs text-slate-500">Loading ledger details…</span>;
  }

  if (error || payments.length === 0) {
    return <span className="text-xs text-slate-600">No payment transaction records.</span>;
  }

  const typeLabels = {
    deposit: 'Security Hold',
    refund: 'Returned Refund',
    fine: 'Fee Assessed',
  };

  const typeIcons = {
    deposit: <Coins className="w-3.5 h-3.5 text-amber-400" />,
    refund: <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />,
    fine: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
  };

  const typeColors = {
    deposit: 'text-amber-400',
    refund: 'text-emerald-400',
    fine: 'text-red-400',
  };

  return (
    <div className="mt-4 p-4 bg-white/3 rounded-xl border border-white/5 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Ledger Logs</h4>
      
      <div className="space-y-2">
        {payments.map((payment) => (
          <div key={payment._id} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0 items-center">
            <div className="flex items-center gap-2">
              {typeIcons[payment.type]}
              <div>
                <span className={`font-semibold block sm:inline mr-2 ${typeColors[payment.type]}`}>
                  {typeLabels[payment.type] || payment.type}
                </span>
                <span className="text-slate-400 text-[10px] block sm:inline">{payment.description}</span>
              </div>
            </div>
            <span className={`font-bold ${payment.type === 'fine' ? 'text-red-400' : 'text-slate-200'}`}>
              {payment.type === 'refund' ? '+' : payment.type === 'fine' ? '-' : ''}₹{payment.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingLedger;
