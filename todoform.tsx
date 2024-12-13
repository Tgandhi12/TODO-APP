// src/components/TodoList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/todos';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  scheduledDate: string;
  isImportant: boolean;
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');

  useEffect(() => {
    const fetchTodos = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to view todos');
        return;
      }

      try {
        const response = await axios.get<Todo[]>(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to request headers
          },
        });
        setTodos(response.data);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (newTodo.trim()) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to add a todo');
        return;
      }

      try {
        const response = await axios.post<Todo>(API_URL, 
          { text: newTodo, dueDate: new Date(), scheduledDate: new Date(), isImportant: false },
          {
            headers: { Authorization: `Bearer ${token}` }, // Add token to request headers
          }
        );
        setTodos((prev) => [...prev, response.data]);
        setNewTodo('');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const toggleCompleted = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const updatedTodo = todos.find((todo) => todo.id === id);
    if (updatedTodo) {
      updatedTodo.completed = !updatedTodo.completed;
      try {
        await axios.put(`${API_URL}/${id}`, updatedTodo, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
      } catch (error) {
        console.error('Error toggling completed:', error);
      }
    }
  };

  const toggleImportant = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const updatedTodo = todos.find((todo) => todo.id === id);
    if (updatedTodo) {
      updatedTodo.isImportant = !updatedTodo.isImportant;
      try {
        await axios.put(`${API_URL}/${id}`, updatedTodo, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
      } catch (error) {
        console.error('Error toggling important:', error);
      }
    }
  };

  const deleteTodo = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div>
      <h1>Todo List</h1>
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a new todo"
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <div>
              <span style={{ textDecoration: todo.completed ? 'line-through' : '' }}>
                {todo.text} - {todo.dueDate}
              </span>
              <button onClick={() => toggleCompleted(todo.id)}>
                {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <button onClick={() => toggleImportant(todo.id)}>
                {todo.isImportant ? 'Mark Not Important' : 'Mark Important'}
              </button>
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
