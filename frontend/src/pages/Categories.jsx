import { useEffect, useState } from 'react'

import {
  createCategory,
  deleteCategory,
  listCategories,
  renameCategory,
} from '../api.js'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    refresh()
  }, [])

  /** Reload the list from the server, so it always reflects what was stored. */
  function refresh() {
    listCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
  }

  async function handleAdd(event) {
    event.preventDefault()
    setError('')
    try {
      await createCategory(newName)
      setNewName('')
      refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRename(event) {
    event.preventDefault()
    setError('')
    try {
      await renameCategory(editingId, editingName)
      setEditingId(null)
      setEditingName('')
      refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    setError('')
    try {
      await deleteCategory(id)
      refresh()
    } catch (err) {
      // A category still in use comes back as a 409 whose message names how
      // many expenses are assigned. Showing it as-is tells the user why.
      setError(err.message)
    }
  }

  return (
    <div>
      <h1>Categories</h1>

      {error && <div className="error">{error}</div>}

      {editingId === null ? (
        <form onSubmit={handleAdd}>
          <div className="field">
            <label htmlFor="new-category">New category</label>
            <input
              id="new-category"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="e.g. Groceries"
            />
          </div>
          <button className="primary" type="submit">
            Add
          </button>
        </form>
      ) : (
        <form onSubmit={handleRename}>
          <div className="field">
            <label htmlFor="edit-category">Rename category</label>
            <input
              id="edit-category"
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
            />
          </div>
          <button className="primary" type="submit">
            Save
          </button>
          <button type="button" onClick={() => setEditingId(null)}>
            Cancel
          </button>
        </form>
      )}

      {categories.length === 0 ? (
        <p className="empty">No categories yet. Add one above.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>
                  <button
                    className="link"
                    type="button"
                    onClick={() => {
                      setEditingId(category.id)
                      setEditingName(category.name)
                      setError('')
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="link danger"
                    type="button"
                    onClick={() => handleDelete(category.id)}
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
