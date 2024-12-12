import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/todos";

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
  const [newTodo, setNewTodo] = useState<string>("");

  useEffect(() => {
    axios.get<Todo[]>(API_URL)
      .then((response) => setTodos(response.data))
      .catch((error) => console.error("Error fetching todos:", error));
  }, []);

  const addTodo = () => {
    if (newTodo.trim()) {
      axios.post<Todo>(API_URL, { text: newTodo, dueDate: new Date(), scheduledDate: new Date(), isImportant: false })
        .then((response) => {
          setTodos((prev) => [...prev, response.data]);
          setNewTodo("");
        })
        .catch((error) => console.error("Error adding todo:", error));
    }
  };

  const toggleCompleted = (id: string) => {
    if (!id) return; // Ensure id is valid

    const updatedTodo = todos.find((todo) => todo.id === id);
    if (updatedTodo) {
      updatedTodo.completed = !updatedTodo.completed;

      axios.put(`${API_URL}/${id}`, updatedTodo)
        .then((response) => {
          setTodos((prevTodos) =>
            prevTodos.map((todo) =>
              todo.id === id ? response.data : todo
            )
          );
        })
        .catch((error) => console.error("Error toggling completed:", error));
    }
  };

  const toggleImportant = (id: string) => {
    if (!id) return; // Ensure id is valid

    const updatedTodo = todos.find((todo) => todo.id === id);
    if (updatedTodo) {
      updatedTodo.isImportant = !updatedTodo.isImportant;

      axios.put(`${API_URL}/${id}`, updatedTodo)
        .then((response) => {
          setTodos((prevTodos) =>
            prevTodos.map((todo) =>
              todo.id === id ? response.data : todo
            )
          );
        })
        .catch((error) => console.error("Error toggling important:", error));
    }
  };

  const deleteTodo = (id: string) => {
    if (!id) return; // Ensure id is valid

    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      })
      .catch((error) => console.error("Error deleting todo:", error));
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
              <span style={{ textDecoration: todo.completed ? "line-through" : "" }}>
                {todo.text} - {todo.dueDate}
              </span>
              <button onClick={() => toggleCompleted(todo.id)}>
                {todo.completed ? "Mark Incomplete" : "Mark Complete"}
              </button>
              <button onClick={() => toggleImportant(todo.id)}>
                {todo.isImportant ? "Mark Not Important" : "Mark Important"}
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
