import { useEffect, useState } from 'react'

import { getDashboard } from '../api.js'
import { formatMoney } from '../settings.js'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  // Load the summary once when the page mounts. Because the router remounts the
  // page on every visit, navigating back here always shows fresh figures.
  useEffect(() => {
    getDashboard().then(setSummary).catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="error">{error}</div>
  if (!summary) return <p className="empty">Loading...</p>

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="cards">
        <div className="card">
          <div className="label">Total expenses</div>
          <div className="value">{formatMoney(summary.total)}</div>
        </div>
        <div className="card">
          <div className="label">This month</div>
          <div className="value">{formatMoney(summary.current_month_total)}</div>
        </div>
      </div>

      <h2>Recent expenses</h2>
      {summary.recent.length === 0 ? (
        <p className="empty">No expenses yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {summary.recent.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td>{expense.description}</td>
                <td>{expense.category_name}</td>
                <td className="amount">{formatMoney(expense.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
