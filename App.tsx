import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";

type Todo = {
  _id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  scheduledDate: string;
  isImportant: boolean;
};

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [isImportant, setIsImportant] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "gr_id">("list");

  const API_URL = "http://localhost:5000/todos";

  // Fetch todos from the backend
  useEffect(() => {
    axios
      .get<Todo[]>(API_URL)
      .then((response) => setTodos(response.data))
      .catch((error) => console.error("Error fetching todos:", error));
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (newTodo.trim() && scheduledDate && dueDate) {
      const todo = { text: newTodo, dueDate, scheduledDate, isImportant };
      axios
        .post<Todo>(API_URL, todo)
        .then((response) => setTodos((prev) => [...prev, response.data]))
        .catch((error) => console.error("Error adding todo:", error));

      resetForm();
    }
  };

  const handleEditSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (editTodo && newTodo.trim() && scheduledDate && dueDate) {
      const updatedTodo = { ...editTodo, text: newTodo, dueDate, scheduledDate, isImportant };
      axios
        .put<Todo>(`${API_URL}/${editTodo._id}`, updatedTodo)
        .then((response) => {
          // Replace the old task with the updated task in the state
          setTodos((prev) =>
            prev.map((t) => (t._id === editTodo._id ? response.data : t))
          );
          setEditMode(false);
          resetForm();
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

  // Toggle task completion state
  const toggleComplete = (_id: string, completed: boolean) => {
    const todo = todos.find((t) => t._id === _id);
    if (todo) {
      const updatedTodo = { ...todo, completed };
      axios
        .put<Todo>(`${API_URL}/${_id}`, updatedTodo)
        .then((response) => {
          setTodos((prev) =>
            prev.map((t) => (t._id === _id ? response.data : t))
          );
        })
        .catch((error) => console.error("Error toggling completion:", error));
    }
  };

  const toggleImportant = (_id: string) => {
    const todo = todos.find((t) => t._id === _id);
    if (todo) {
      const updatedTodo = { ...todo, isImportant: !todo.isImportant };
      axios
        .put<Todo>(`${API_URL}/${_id}`, updatedTodo)
        .then((response) => {
          setTodos((prev) =>
            prev.map((t) => (t._id === _id ? response.data : t))
          );
        })
        .catch((error) => console.error("Error toggling importance:", error));
    }
  };

  const deleteTodo = (_id: string) => {
    axios
      .delete(`${API_URL}/${_id}`)
      .then(() => {
        setTodos((prev) => prev.filter((t) => t._id !== _id));
      })
      .catch((error) => console.error("Error deleting todo:", error));
  };

  const startEdit = (todo: Todo) => {
    setEditMode(true);
    setEditTodo(todo);
    setNewTodo(todo.text);
    setScheduledDate(todo.scheduledDate);
    setDueDate(todo.dueDate);
    setIsImportant(todo.isImportant);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "gr_id" : "list");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-5">
      <div className="text-center text-gray-400 text-sm mb-4">
        Current Time: {currentTime}
      </div>
      <h1 className="text-2xl font-bold text-center mb-5">Todo List</h1>

      <div className="text-center mb-5">
        <button
          onClick={toggleViewMode}
          className="p-2 bg-blue-600 text-white rounded"
        >
          Toggle {viewMode === "list" ? "Grid View" : "List View"}
        </button>
      </div>

      <form
        onSubmit={editMode ? handleEditSubmit : handleSubmit}
        className="flex flex-col mb-5 space-y-3"
      >
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
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded"
        >
          {editMode ? "Update Task" : "Add Task"}
        </button>
      </form>

      <ul
        className={`${
          viewMode === "gr_id" ? "grid grid-cols-3 gap-4" : "space-y-4"
        }`}
      >
        
        {todos.map((todo) => (
          
          <li
            key={todo._id}
            className={`flex flex-col justify-between p-4 border bg-gray-800 rounded ${
              todo.isImportant ? "border-yellow-500" : "border-gray-700"
            }`}
          >
            <div>
              <p
                className={`text-lg ${todo.completed ? "line-through text-gray-500" : ""}`}
              >
                {todo.text}
              </p>
              <small className="text-gray-400">Due: {todo.dueDate}</small>
              <br />
              <small className="text-gray-400">
                Scheduled: {todo.scheduledDate}
              </small>
            </div>
            <div className="flex space-x-2 mt-2">
              {todo.completed ? (
                <button
                  onClick={() => toggleComplete(todo._id, false)}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded"
                >
                  Mark as Incomplete
                </button>
              ) : (
                <button
                  onClick={() => toggleComplete(todo._id, true)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                >
                  Mark as Complete
                </button>
              )}
              <button
                onClick={() => toggleImportant(todo._id)}
                className={`px-3 py-1 text-sm ${
                  todo.isImportant ? "bg-yellow-500" : "bg-gray-600"
                } text-white rounded`}
              >
                Important
              </button>
              <button
                onClick={() => startEdit(todo)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTodo(todo._id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
