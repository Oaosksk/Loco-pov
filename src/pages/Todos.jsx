import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function Todos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('todos').select('*')
      if (error) {
        console.error('Failed to load todos:', error)
        setError(error.message)
        setTodos([])
      } else {
        setTodos(data || [])
      }
      setLoading(false)
    }

    loadTodos()
  }, [])

  if (loading) return <p>Loading todos...</p>
  if (error) return <p>Error loading todos: {error}</p>

  return (
    <div>
      <h2>Todos</h2>
      <ul>
        {todos.length === 0 && <li>No todos found</li>}
        {todos.map((todo) => (
          <li key={todo.id ?? JSON.stringify(todo)}>
            {todo.title ?? JSON.stringify(todo)}
          </li>
        ))}
      </ul>
    </div>
  )
}
