import React, { useState } from 'react';
import { useMutation } from 'react-query';
import axios from 'axios';

const addTodo = async (newTodo: { text: string; dueDate: string; scheduledDate: string; isImportant: boolean }) => {
  const { data } = await axios.post('http://localhost:5000/todos', newTodo);
  return data;
};

const TodoForm: React.FC = () => {
  const [text, setText] = useState('');

  const mutation = useMutation(addTodo, {
    onSuccess: (data) => {
      console.log('Todo added successfully:', data);
    },
    onError: (error) => {
      console.error('Error adding todo:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTodo = { text, dueDate: '2024-12-15', scheduledDate: '2024-12-06', isImportant: false };
    mutation.mutate(newTodo);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New Todo"
      />
      <button type="submit">Add Todo</button>
    </form>
  );
};

export default TodoForm;
