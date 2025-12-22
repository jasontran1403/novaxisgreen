import { formatCurrency } from '../utils/formatCurrency';

function TransactionHistory({ transactions = [], currency = 'USDT' }) {
  return (
    <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
      <h3 className="text-sm font-semibold text-emerald-400 dark:text-emerald-300 mb-3">
        Transaction History
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-emerald-500/30 dark:border-emerald-400/30">
              <th className="text-left py-2 px-3 text-xs font-semibold text-emerald-400 dark:text-emerald-300">
                Type
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-emerald-400 dark:text-emerald-300">
                Amount
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-emerald-400 dark:text-emerald-300">
                Date
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-emerald-400 dark:text-emerald-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
              >
                <td className="py-2 px-3 text-xs text-emerald-300 dark:text-emerald-400">
                  {transaction.type}
                </td>
                <td
                  className={`py-2 px-3 text-xs font-medium ${
                    transaction.amount >= 0
                      ? 'text-green-400 dark:text-green-300'
                      : 'text-red-400 dark:text-red-300'
                  }`}
                >
                  {transaction.amount >= 0 ? '+' : ''}
                  {formatCurrency(transaction.amount, currency)}
                </td>
                <td className="py-2 px-3 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                  {transaction.date}
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      transaction.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 dark:text-green-300'
                        : 'bg-yellow-500/20 text-yellow-400 dark:text-yellow-300'
                    }`}
                  >
                    {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionHistory;

