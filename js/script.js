const user = "Special-Srit";   // Your GitHub username
const repo = "Chroma_Axis";    // Your repo name
const branch = "main";         // default branch
const workflow = "update-tasks.yml"; // workflow file

let tasks = [];

// Load tasks.json from GitHub
async function loadTasks() {
    try {
        const res = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/${branch}/tasks.json?${Date.now()}`);
        if (!res.ok) throw new Error("No tasks file yet");
        tasks = await res.json();
    } catch (e) {
        tasks = [];
    }
}

// Render tasks into a container, optional filter by type
function renderTasks(containerId, type = null) {
    const taskList = document.getElementById(containerId);
    taskList.innerHTML = "";
    tasks.filter(t => !type || t.type === type).forEach((task, i) => {
        const li = document.createElement("li");
        li.className = `task ${task.done ? "completed" : ""}`;
        li.innerHTML = `
      <span onclick="toggleTask(${i})">${task.text}</span>
      <button class="btn btn-sm btn-outline-light" onclick="deleteTask(${i})">×</button>
    `;
        taskList.appendChild(li);
    });
}

// Trigger GitHub Action workflow to save tasks
async function saveTasks() {
    const body = {
        ref: branch,
        inputs: { tasks: JSON.stringify(tasks) }
    };

    await fetch(`https://api.github.com/repos/${user}/${repo}/actions/workflows/${workflow}/dispatches`, {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": "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", // Use a private token / repo
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}

// Handlers
async function addTask(type) {
    const input = document.getElementById(`${type}Input`);
    if (!input.value.trim()) return;
    tasks.push({ text: input.value, done: false, type });
    input.value = "";
    renderTasks(type === "goal" ? "goalList" : "todoList", type);
    await saveTasks();
}

async function toggleTask(i) {
    tasks[i].done = !tasks[i].done;
    renderTasks("goalList", "goal");
    renderTasks("todoList", "todo");
    renderTasks("allList");
    await saveTasks();
}

async function deleteTask(i) {
    tasks.splice(i, 1);
    renderTasks("goalList", "goal");
    renderTasks("todoList", "todo");
    renderTasks("allList");
    await saveTasks();
}

// Compute completion percentage
function getCompletionPercent() {
    if (!tasks.length) return 0;
    const doneCount = tasks.filter(t => t.done).length;
    return Math.round((doneCount / tasks.length) * 100);
}
