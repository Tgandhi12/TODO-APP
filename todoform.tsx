// src/components/TodoForm.tsx
import React, { useState, FormEvent } from 'react';
import axios from 'axios';

const TodoForm: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [isImportant, setIsImportant] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newTodo = { text, dueDate, scheduledDate, isImportant };
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please log in to create a todo');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/todos', newTodo, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage('Todo created successfully!');
      setText('');
      setDueDate('');
      setScheduledDate('');
      setIsImportant(false);
    } catch (error) {
      setError('Failed to create todo. Please try again.');
    }
  };

  return (
    <div>
      <h1>Create a New Todo</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Todo text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          required
        />
        <label>
          Important:
          <input
            type="checkbox"
            checked={isImportant}
            onChange={() => setIsImportant(!isImportant)}
          />
        </label>
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
};

export default TodoForm;
