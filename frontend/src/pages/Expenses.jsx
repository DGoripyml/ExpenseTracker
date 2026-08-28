import { useEffect, useState } from 'react'

import {
  createExpense,
  deleteExpense,
  listCategories,
  listExpenses,
  updateExpense,
} from '../api.js'
import { formatMoney } from '../settings.js'

/** An empty form, also used to reset after a save. */
const BLANK = { amount: '', category_id: '', description: '', date: '' }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(BLANK)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    refresh()
    listCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
  }, [])

  function refresh() {
    listExpenses()
      .then(setExpenses)
      .catch((err) => setError(err.message))
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function startEdit(expense) {
    setEditingId(expense.id)
    setForm({
      amount: String(expense.amount),
      category_id: String(expense.category_id),
      description: expense.description,
      date: expense.date,
    })
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(BLANK)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const payload = {
      amount: Number(form.amount),
      category_id: Number(form.category_id),
      description: form.description,
      date: form.date,
    }

    try {
      if (editingId === null) {
        await createExpense(payload)
      } else {
        await updateExpense(editingId, payload)
      }
      cancelEdit()
      refresh()
    } catch (err) {
      // Validation problems from the server are shown as-is.
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    setError('')
    try {
      await deleteExpense(id)
      refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1>Expenses</h1>

      {error && <div className="error">{error}</div>}

      {categories.length === 0 ? (
        <p className="empty">
          Add a category first — every expense needs one.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="e.g. Groceries at market"
            />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category_id}
              onChange={(event) => updateField('category_id', event.target.value)}
            >
              <option value="">Choose...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(event) => updateField('amount', event.target.value)}
            />
          </div>
          <button className="primary" type="submit">
            {editingId === null ? 'Add' : 'Save'}
          </button>
          {editingId !== null && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>
      )}

      {expenses.length === 0 ? (
        <p className="empty">No expenses yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="amount">Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td>{expense.description}</td>
                <td>{expense.category_name}</td>
                <td className="amount">{formatMoney(expense.amount)}</td>
                <td>
                  <button
                    className="link"
                    type="button"
                    onClick={() => startEdit(expense)}
                  >
                    Edit
                  </button>
                  <button
                    className="link danger"
                    type="button"
                    onClick={() => handleDelete(expense.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
