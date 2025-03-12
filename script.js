document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const taskInput = document.getElementById('task-input');
  const prioritySelect = document.getElementById('priority-select');
  const addTaskBtn = document.getElementById('add-task-btn');
  const todoTasks = document.getElementById('todo-tasks-container');
  const inProgressTasks = document.getElementById('in-progress-tasks-container');
  const doneTasks = document.getElementById('done-tasks-container');
  const dateElement = document.getElementById('date');
  const taskSummaryElement = document.getElementById('task-summary');

  // Load tasks from local storage or initialize an empty array
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Display current date
  const today = new Date();
  dateElement.textContent = today.toDateString();

  // Clear all columns before loading tasks
  function clearColumns() {
    todoTasks.innerHTML = '';
    inProgressTasks.innerHTML = '';
    doneTasks.innerHTML = '';
  }

  // Load tasks from local storage on page load
  function loadTasks() {
    clearColumns(); // Clear columns to prevent duplicates
    tasks.forEach(task => createTaskElement(task));
    updateTaskSummary();
  }

  // Create a task element and append it to the correct column
  function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task priority-${task.priority}`; // Set priority class for styling
    taskElement.draggable = true;
    taskElement.dataset.text = task.text;

    taskElement.innerHTML = `
      <div class="task-header">
        <span>${task.text}</span>
        <div>
          <button class="add-comment"><i class="fas fa-comment"></i></button>
          <button class="delete-task"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      ${task.comment ? `
        <div class="task-comments visible">
          <div class="comment-text">${task.comment}</div>
          <button class="edit-comment">Edit</button>
        </div>
      ` : ''}
    `;

    // Append to the correct column based on the task's status
    if (task.status === 'todo') {
      todoTasks.appendChild(taskElement);
    } else if (task.status === 'in-progress') {
      inProgressTasks.appendChild(taskElement);
    } else if (task.status === 'done') {
      doneTasks.appendChild(taskElement);
    }
  }

  // Add a new task
  function addTask() {
    const text = taskInput.value.trim();
    const priority = prioritySelect.value;

    if (text) {
      const task = { text, priority, status: 'todo', comment: '' }; // Default status is 'todo'
      tasks.push(task);
      createTaskElement(task);
      updateLocalStorage();
      taskInput.value = '';
      updateTaskSummary();
    }
  }

  // Update local storage
  function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Update task summary with motivational messages
  function updateTaskSummary() {
    const todoCount = todoTasks.children.length;
    const inProgressCount = inProgressTasks.children.length;
    const doneCount = doneTasks.children.length;
    let summaryMessage = '';

    // Handle cases where all columns are empty
    if (todoCount === 0 && inProgressCount === 0 && doneCount === 0) {
      summaryMessage = 'No tasks yet. Add some tasks and get started!';
    } else {
      // Build the summary message based on task counts
      const parts = [];
      if (todoCount > 0) {
        parts.push(`You have ${todoCount} task${todoCount > 1 ? 's' : ''} to start.`);
      }
      if (inProgressCount > 0) {
        parts.push(`You have ${inProgressCount} task${inProgressCount > 1 ? 's' : ''} in progress.`);
      }
      if (doneCount > 0) {
        parts.push(`You've completed ${doneCount} task${doneCount > 1 ? 's' : ''}. Great job!`);
      }

      // Combine parts into a single message
      if (parts.length === 1) {
        summaryMessage = parts[0];
      } else if (parts.length === 2) {
        summaryMessage = `${parts[0]} ${parts[1]}`;
      } else if (parts.length === 3) {
        summaryMessage = `${parts[0]} ${parts[1]} ${parts[2]}`;
      }
    }

    taskSummaryElement.textContent = summaryMessage;
  }

  // Event delegation for dynamic elements
  document.addEventListener('click', (e) => {
    // Add Comment Button
    if (e.target.closest('.add-comment')) {
      const taskElement = e.target.closest('.task');
      const commentSection = taskElement.querySelector('.task-comments');

      // Close all other comment boxes
      document.querySelectorAll('.task-comments').forEach(section => {
        if (section !== commentSection && section.classList.contains('visible')) {
          section.classList.remove('visible');
        }
      });

      // Toggle the current comment section
      if (commentSection) {
        commentSection.classList.toggle('visible');
      } else {
        const newCommentSection = document.createElement('div');
        newCommentSection.className = 'task-comments';
        newCommentSection.innerHTML = `
          <textarea class="comment-input" placeholder="Add a comment..."></textarea>
          <div class="actions">
            <button class="save-comment">Save</button>
            <button class="cancel-comment">Cancel</button>
          </div>
        `;
        taskElement.appendChild(newCommentSection);

        // Save Comment Button
        const saveCommentButton = newCommentSection.querySelector('.save-comment');
        saveCommentButton.addEventListener('click', () => {
          const commentInput = newCommentSection.querySelector('.comment-input');
          const taskText = taskElement.querySelector('span').textContent;
          const taskIndex = tasks.findIndex(task => task.text === taskText);
          tasks[taskIndex].comment = commentInput.value.trim();
          newCommentSection.innerHTML = `
            <div class="comment-text">${tasks[taskIndex].comment}</div>
            <button class="edit-comment">Edit</button>
          `;
          newCommentSection.classList.add('visible');
          updateLocalStorage();
        });

        // Cancel Comment Button
        const cancelCommentButton = newCommentSection.querySelector('.cancel-comment');
        cancelCommentButton.addEventListener('click', () => {
          newCommentSection.classList.remove('visible');
        });

        // Show the new comment section
        newCommentSection.classList.add('visible');
      }
    }

    // Edit Comment Button
    if (e.target.closest('.edit-comment')) {
      const taskElement = e.target.closest('.task');
      const commentSection = taskElement.querySelector('.task-comments');
      const taskText = taskElement.querySelector('span').textContent;
      const taskIndex = tasks.findIndex(task => task.text === taskText);
      commentSection.innerHTML = `
        <textarea class="comment-input">${tasks[taskIndex].comment}</textarea>
        <div class="actions">
          <button class="save-comment">Save</button>
          <button class="cancel-comment">Cancel</button>
        </div>
      `;
      commentSection.classList.add('visible');

      // Save Edited Comment
      const saveCommentButton = commentSection.querySelector('.save-comment');
      saveCommentButton.addEventListener('click', () => {
        const commentInput = commentSection.querySelector('.comment-input');
        tasks[taskIndex].comment = commentInput.value.trim();
        commentSection.innerHTML = `
          <div class="comment-text">${tasks[taskIndex].comment}</div>
          <button class="edit-comment">Edit</button>
        `;
        updateLocalStorage();
      });

      // Cancel Editing
      const cancelCommentButton = commentSection.querySelector('.cancel-comment');
      cancelCommentButton.addEventListener('click', () => {
        commentSection.innerHTML = `
          <div class="comment-text">${tasks[taskIndex].comment}</div>
          <button class="edit-comment">Edit</button>
        `;
      });
    }

    // Delete Task Button
    if (e.target.closest('.delete-task')) {
      const taskElement = e.target.closest('.task');
      const taskText = taskElement.querySelector('span').textContent;
      taskElement.remove();
      tasks = tasks.filter(task => task.text !== taskText);
      updateLocalStorage();
      updateTaskSummary();
    }
  });

  // Add task on button click
  addTaskBtn.addEventListener('click', addTask);

  // Add task on pressing Enter key
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  // Drag-and-drop functionality
  document.querySelectorAll('.column').forEach(column => {
    const tasksContainer = column.querySelector('.tasks');
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      column.classList.add('dragover'); // Highlight column
      const dragging = document.querySelector('.dragging');
      const afterElement = getDragAfterElement(tasksContainer, e.clientY);
      if (afterElement == null) {
        tasksContainer.appendChild(dragging); // Append to the end if no valid target
      } else {
        tasksContainer.insertBefore(dragging, afterElement); // Insert before the target element
      }
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('dragover'); // Remove highlight
    });

    column.addEventListener('drop', () => {
      column.classList.remove('dragover'); // Remove highlight after drop
    });
  });

  // Helper function to determine where to insert the dragged task
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // Add dragstart and dragend listeners to tasks
  document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('task')) {
      e.target.classList.add('dragging');
    }
  });

  document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('task')) {
      e.target.classList.remove('dragging');

      // Debugging: Log the task element and its parent column (commented out)
      // console.log('Task dropped:', e.target);
      // console.log('Parent column ID:', e.target.parentElement.parentElement.id);

      // Update task status based on the column it's dropped into
      const taskText = e.target.querySelector('span').textContent.trim(); // Trim whitespace
      const taskIndex = tasks.findIndex(task => task.text === taskText);

      if (taskIndex === -1) {
        // console.error('Task not found in tasks array:', taskText); // Commented out
        return;
      }

      const columnId = e.target.parentElement.parentElement.id;

      if (columnId === 'todo-tasks') {
        tasks[taskIndex].status = 'todo';
      } else if (columnId === 'in-progress-tasks') {
        tasks[taskIndex].status = 'in-progress';
      } else if (columnId === 'done-tasks') {
        tasks[taskIndex].status = 'done';
      } else {
        // console.error('Invalid column ID:', columnId); // Commented out
        return;
      }

      // console.log('Updated task status:', tasks[taskIndex]); // Commented out

      updateLocalStorage();
      updateTaskSummary();
    }
  });

  // Load tasks when the page loads
  loadTasks();
});