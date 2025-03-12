document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("task-input");
    const priorityInput = document.getElementById("priority");
    const addTaskBtn = document.getElementById("add-task-btn");

    const todoList = document.getElementById("todo-list");
    const inProgressList = document.getElementById("in-progress-list");
    const doneList = document.getElementById("done-list");

    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addTask(); });

    function addTask() {
        const taskText = taskInput.value.trim();
        const priority = priorityInput.value;

        if (taskText === "") return;

        const task = createTaskElement(taskText, priority);
        todoList.appendChild(task);
        updateCount();
        taskInput.value = "";
    }

    function createTaskElement(text, priority) {
        const task = document.createElement("div");
        task.classList.add("task", priority);
        task.draggable = true;
        task.innerHTML = `${text} <button class="delete">✖</button>`;

        task.querySelector(".delete").addEventListener("click", () => {
            task.remove();
            updateCount();
        });

        task.addEventListener("dragstart", () => task.classList.add("dragging"));
        task.addEventListener("dragend", () => {
            task.classList.remove("dragging");
            updateCount();
        });

        return task;
    }

    document.querySelectorAll(".task-list").forEach(list => {
        list.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingTask = document.querySelector(".dragging");
            list.appendChild(draggingTask);
        });
    });

    function updateCount() {
        document.getElementById("todo-count").innerText = todoList.children.length;
        document.getElementById("in-progress-count").innerText = inProgressList.children.length;
        document.getElementById("done-count").innerText = doneList.children.length;
    }

    updateCount();
});
