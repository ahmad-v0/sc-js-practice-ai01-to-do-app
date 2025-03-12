document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoTasks = document.getElementById('todo-tasks');
    const inProgressTasks = document.getElementById('in-progress-tasks');
    const doneTasks = document.getElementById('done-tasks');
    const dateElement = document.getElementById('date');
    const taskSummaryElement = document.getElementById('task-summary');
  
    // Load tasks from local storage or initialize an empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
    // Ensure tasks is always an array
    if (!Array.isArray(tasks)) {
      tasks = [];
    }
  
    // Display current date
    const today = new Date();
    dateElement.textContent = today.toDateString();
  
    // Load tasks from local storage on page load
    function loadTasks() {
      tasks.forEach(task => {
        createTaskElement(task);
      });
      updateTaskSummary();
    }
  
    // Create a task element and append it to the correct column
    function createTaskElement(task) {
      const taskElement = document.createElement('div');
      taskElement.className = `task priority-${task.priority}`;
      taskElement.draggable = true;
      taskElement.innerHTML = `
        <div class="task-header">
          <span>${task.text}</span>
          <div>
            <button class="add-comment"><i class="fas fa-comment"></i></button>
            <button class="delete-task"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        ${task.comment ? `<div class="task-comments">${task.comment}</div>` : ''}
      `;
  
      // Add drag event listeners
      taskElement.addEventListener('dragstart', () => {
        taskElement.classList.add('dragging');
      });
  
      taskElement.addEventListener('dragend', () => {
        taskElement.classList.remove('dragging');
        updateTaskStatus(taskElement);
        updateLocalStorage();
        updateTaskSummary();
      });
  
      // Add delete button functionality
      const deleteButton = taskElement.querySelector('.delete-task');
      deleteButton.addEventListener('click', () => {
        taskElement.remove();
        tasks = tasks.filter(t => t.text !== task.text);
        updateLocalStorage();
        updateTaskSummary();
      });
  
      // Add comment toggle functionality
      const addCommentButton = taskElement.querySelector('.add-comment');
      let commentSection = taskElement.querySelector('.task-comments');
  
      addCommentButton.addEventListener('click', () => {
        if (!commentSection) {
          // Create a new comment section
          commentSection = document.createElement('div');
          commentSection.className = 'task-comments';
          commentSection.innerHTML = `
            <textarea class="comment-input" placeholder="Add a comment..."></textarea>
            <button class="save-comment">Save</button>
          `;
          taskElement.appendChild(commentSection);
  
          // Add event listener for the "Save" button
          const saveCommentButton = commentSection.querySelector('.save-comment');
          saveCommentButton.addEventListener('click', () => {
            const commentInput = commentSection.querySelector('.comment-input');
            task.comment = commentInput.value.trim();
            if (task.comment) {
              commentSection.innerHTML = `<div>${task.comment}</div>`;
            } else {
              commentSection.remove();
              commentSection = null; // Reset commentSection to null
            }
            updateLocalStorage();
          });
        } else {
          // Remove the comment section
          commentSection.remove();
          commentSection = null; // Reset commentSection to null
        }
      });
  
      // Append the task to the correct column based on its status
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
        const task = {
          text,
          priority,
          status: 'todo',
          comment: '',
        };
  
        // Add the task to the tasks array
        tasks.push(task);
  
        // Create and append the task element to the 'To Do' column
        createTaskElement(task);
  
        // Update local storage
        updateLocalStorage();
  
        // Clear the input field
        taskInput.value = '';
  
        // Update task summary
        updateTaskSummary();
      }
    }
  
    // Add task on button click
    addTaskBtn.addEventListener('click', addTask);
  
    // Add task on pressing Enter key
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTask();
      }
    });
  
    // Update local storage with the current tasks
    function updateLocalStorage() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    // Update task status based on the column it's dropped into
    function updateTaskStatus(taskElement) {
      const taskText = taskElement.querySelector('span').textContent;
      const taskIndex = tasks.findIndex(task => task.text === taskText);
  
      if (taskElement.parentElement.id === 'todo-tasks') {
        tasks[taskIndex].status = 'todo';
        showNotification('Task moved to To Do');
      } else if (taskElement.parentElement.id === 'in-progress-tasks') {
        tasks[taskIndex].status = 'in-progress';
        showNotification(`You have ${inProgressTasks.children.length} tasks in progress. Keep going!`);
      } else if (taskElement.parentElement.id === 'done-tasks') {
        tasks[taskIndex].status = 'done';
        showNotification(`You have completed ${doneTasks.children.length} tasks. Great job!`);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  
    // Show notification
    function showNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = message;
      document.body.appendChild(notification);
  
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  
    // Update task summary
    function updateTaskSummary() {
      const todoCount = todoTasks.children.length;
      const inProgressCount = inProgressTasks.children.length;
      const doneCount = doneTasks.children.length;
  
      let summary = '';
      if (todoCount === 0) {
        summary = `You have no tasks to do. Great job! (${inProgressCount} in progress, ${doneCount} done)`;
      } else if (todoCount <= 3) {
        summary = `You have ${todoCount} tasks to do. Keep going! (${inProgressCount} in progress, ${doneCount} done)`;
      } else {
        summary = `You have ${todoCount} tasks to do. Let's tackle them one by one! (${inProgressCount} in progress, ${doneCount} done)`;
      }
  
      taskSummaryElement.textContent = summary;
    }
  
    // Drag and drop functionality for the whole board
    document.querySelectorAll('.column').forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(column, e.clientY);
        const tasksContainer = column.querySelector('.tasks');
  
        if (afterElement == null) {
          tasksContainer.appendChild(dragging);
        } else {
          tasksContainer.insertBefore(dragging, afterElement);
        }
      });
    });
  
    // Helper function to determine where to insert the dragged task
    function getDragAfterElement(column, y) {
      const draggableElements = [...column.querySelectorAll('.task:not(.dragging)')];
  
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
  
    // Load tasks when the page loads
    loadTasks();
  });