import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';

interface Todo {
  _id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  scheduledDate: string;
  isImportant: boolean;
}

const fetchTodos = async (): Promise<Todo[]> => {
  const { data } = await axios.get('http://localhost:5000/todos');
  return data;
};

const TodoList: React.FC = () => {
  const { data, isLoading, error } = useQuery<Todo[]>('todos', fetchTodos);

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Todo List</h1>
      <ul>
        {data?.map((todo) => (
          <li key={todo._id}>
            {todo.text} - {todo.completed ? 'Completed' : 'Pending'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
