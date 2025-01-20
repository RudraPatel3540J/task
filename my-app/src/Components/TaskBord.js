import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const COLUMN_TYPES = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const TaskCard = ({ task, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`task-card ${isDragging ? "dragging" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p className="due-date">Due: {task.dueDate}</p>
      <div className="task-action">
        <button className="btn-edit" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="btn-delete" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

const Column = ({ title, tasks, onDrop, onEdit, onDelete }) => {
  const [, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item) => onDrop(item.id, title),
  }));

  return (
    <div ref={drop} className="column">
      <h3>{title}</h3>
      <div className="tasks-container">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

const TaskBoard = () => {
  const savedTask = localStorage.getItem("task")
    ? JSON.parse(localStorage.getItem("task"))
    : [];
  const [tasks, setTasks] = useState(savedTask);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  useEffect(() => {
    localStorage.setItem("task", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    setCurrentTask({
      title: "",
      description: "",
      dueDate: "",
      column: COLUMN_TYPES.TODO,
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = (task) => {
    if (task.id) {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === task.id ? task : t))
      );
    } else {
      setTasks((prevTasks) => [...prevTasks, { ...task, id: uuidv4() }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDropTask = (taskId, newColumn) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, column: newColumn } : task
      )
    );
  };

  const showTaskByColumn = (column) =>
    tasks.filter((task) => task.column === column);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="task-board cursor-pointer">
        <header>
          <h1>Task Management Board</h1>
          <button className="btn-add" onClick={handleAddTask}>
            Add Task
          </button>
        </header>
        <div className="columns">
          {Object.values(COLUMN_TYPES).map((column) => (
            <Column
              key={column}
              title={column}
              tasks={showTaskByColumn(column)}
              onDrop={handleDropTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
        {isModalOpen && (
          <TaskModal
            task={currentTask}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTask}
          />
        )}
      </div>
    </DndProvider>
  );
};

const TaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState(task);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{task.id ? "Edit Task" : "Add Task"}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            name="title"
            className="modal-input"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="modal-input"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />
          <input
            type="date"
            name="dueDate"
            className="modal-input"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
          <div className="modal-action">
            <button onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button className="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskBoard;
