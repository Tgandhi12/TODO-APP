import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";

// Types
interface Todo {
  _id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  scheduledDate: string;
  isImportant: boolean;
}

const API_URL = "http://localhost:5000/todos";

// Axios Configuration
axios.defaults.baseURL = "http://localhost:5000";
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login if unauthorized
    }
    return Promise.reject(error);
  }
);

// Login Component
const Login = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      onLogin(token);
      navigate("/"); // Redirect to todo app
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold mb-5">Login</h1>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded bg-gray-800 text-gray-300"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded bg-gray-800 text-gray-300"
          required
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded">
          Login
        </button>
      </form>
      <p className="text-sm text-gray-400 mt-3">
        Don't have an account? <a href="/register" className="text-blue-500">Register here</a>
      </p>
    </div>
  );
};

// Register Component
const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", { email, password });
      alert("Registration successful!");
      navigate("/login"); // Redirect to login
    } catch (err) {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold mb-5">Register</h1>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded bg-gray-800 text-gray-300"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded bg-gray-800 text-gray-300"
          required
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded">
          Register
        </button>
      </form>
      <p className="text-sm text-gray-400 mt-3">
        Already have an account? <a href="/login" className="text-blue-500">Login here</a>
      </p>
    </div>
  );
};

// Todo App Component
const TodoApp = ({ onLogout }: { onLogout: () => void }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list"); // State for toggling view mode

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get<Todo[]>("/todos", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setTodos(response.data))
        .catch((error) => console.error("Error fetching todos:", error));
    }
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (newTodo.trim() && scheduledDate && dueDate && token) {
      const todo = { text: newTodo, dueDate, scheduledDate, isImportant };
      axios
        .post<Todo>("/todos", todo, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setTodos((prev) => [...prev, response.data]))
        .catch((error) => console.error("Error adding todo:", error));

      resetForm();
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
    setNewTodo(todo.text);
    setScheduledDate(todo.scheduledDate);
    setDueDate(todo.dueDate);
    setIsImportant(todo.isImportant);
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (editTodo && newTodo.trim() && scheduledDate && dueDate && token) {
      const updatedTodo = { ...editTodo, text: newTodo, scheduledDate, dueDate, isImportant };
      axios
        .put(`/todos/${editTodo._id}`, updatedTodo, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setTodos((prev) => prev.map((t) => (t._id === editTodo._id ? response.data : t)));
          resetForm();
          setEditTodo(null);
        })
        .catch((error) => console.error("Error updating todo:", error));
    }
  };

  const resetForm = () => {
    setNewTodo("");
    setScheduledDate("");
    setDueDate("");
    setIsImportant(false);
  };

  const toggleComplete = (_id: string, completed: boolean) => {
    const todo = todos.find((t) => t._id === _id);
    if (todo && token) {
      axios
        .put(`/todos/${_id}`, { ...todo, completed }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setTodos((prev) =>
            prev.map((t) => (t._id === _id ? response.data : t))
          );
        })
        .catch((error) => console.error("Error toggling completion:", error));
    }
  };

  const deleteTodo = (_id: string) => {
    if (token) {
      axios
        .delete(`/todos/${_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setTodos((prev) => prev.filter((t) => t._id !== _id));
        })
        .catch((error) => console.error("Error deleting todo:", error));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-5">
      <button
        onClick={onLogout}
        className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded"
      >
        Logout
      </button>
      <div className="text-center text-gray-400 text-sm mb-4">
        Current Time: {currentTime}
      </div>
      <h1 className="text-2xl font-bold text-center mb-5">Todo List</h1>

      <div className="flex justify-center space-x-3 mb-5">
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-700"}`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-700"}`}
        >
          Grid View
        </button>
      </div>

      <form onSubmit={editTodo ? handleUpdate : handleSubmit} className="flex flex-col mb-5 space-y-3">
        <input
          type="text"
          placeholder="Add a task"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="p-2 border rounded bg-gray-800 text-gray-300"
        />
        <div className="flex space-x-3">
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="p-2 border rounded bg-gray-800 text-gray-300"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-2 border rounded bg-gray-800 text-gray-300"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-400">Mark as important</label>
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
          />
        </div>
        <button type="submit" className="p-2 bg-blue-600 text-white rounded">
          {editTodo ? "Update Task" : "Add Task"}
        </button>
      </form>

      <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-2 gap-4"}>
        {todos.map((todo) => (
          <div
            key={todo._id}
            className={`p-4 border rounded-lg ${
              todo.completed ? "bg-gray-700 line-through" : "bg-gray-800"
            } ${todo.isImportant ? "border-red-500" : "border-gray-500"}`}
          >
            <div className="flex justify-between items-center">
              <span>{todo.text}</span>
              <div className="flex space-x-3">
                <button
                  onClick={() => toggleComplete(todo._id, !todo.completed)}
                  className="p-1 bg-green-600 text-white rounded"
                >
                  {todo.completed ? "Undo" : "Complete"}
                </button>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="p-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(todo)}
                  className="p-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Scheduled: {todo.scheduledDate} | Due: {todo.dueDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// App Component
const App = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const handleLogin = (token: string) => {
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <TodoApp onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
