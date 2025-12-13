import { modal } from "./modal.js";
const raw = localStorage.getItem("todos");
let todos = raw
  ? JSON.parse(raw)
  : [
      { id: 1, title: "Note", complete: true },
      { id: 2, title: "Note", complete: true },
    ];
let lastDeleted = {};
let interval;
let timer;
const undoBtn = document.querySelector(".undo");

const list = document.querySelector(".list");
render(list);

const select = document.querySelector(".select");
const input = document.querySelector(".input");

function applyFilters() {
  const status = select.value;
  const query = input.value.toLowerCase().trim();

  const filtered = todos.filter((el) => {
    const matchesText = el.title.toLowerCase().includes(query);

    if (status === "complete") {
      return el.complete === true && matchesText;
    }

    if (status === "incomplete") {
      return el.complete === false && matchesText;
    }

    return matchesText;
  });

  render(list, filtered);
}

select.addEventListener("change", applyFilters);
input.addEventListener("input", applyFilters);

//Модалка
const footerBtn = document.querySelector(".floating-btn");
footerBtn.addEventListener("click", modal.open);

//CheckBox
list.addEventListener("change", (event) => {
  const liElem = event.target.closest("li");
  if (!liElem) {
    return;
  }
  const checkbox = event.target.closest(".checkbox");
  if (checkbox) {
    const id = Number(checkbox.dataset.id);
    const todo = todos.find((todo) => todo.id === id);
    todo.complete = checkbox.checked;
    saveTodo();
    setTimeout(() => {
      applyFilters();
    }, 2000);
  }
});

//Delegate list
list.addEventListener("click", (event) => {
  const li = event.target.closest("li");
  if (!li) {
    return;
  }
  //Удаление задачи
  const removeTask = event.target.closest(".remove-task");
  if (removeTask) {
    const id = Number(removeTask.dataset.id);
    remove(id);
  }
  //Выход из режима редактирования
  const closeEdit = event.target.closest(".close-edit");
  if (closeEdit) {
    const checkbox = li.querySelector(".checkbox");
    const taskTitle = li.querySelector(".task-title");
    taskTitle.style.textDecoration = "none";
    checkbox.checked
      ? (taskTitle.style.textDecoration = "line-through")
      : (taskTitle.style.textDecoration = "none");
    const taskActions = li.querySelector(".task-actions");
    taskActions.classList.remove("hidden");
    const editMode = li.querySelector(".edit-mode");
    editMode.classList.add("hidden");
    const input = li.querySelector(".task-title");
    input.readOnly = true;
  }
  //Открытие режима редактирования
  const editTask = event.target.closest(".edit-task");
  if (editTask) {
    const taskTitle = li.querySelector(".task-title");
    taskTitle.style.textDecoration = "none";
    const taskActions = li.querySelector(".task-actions");
    taskActions.classList.add("hidden");
    const editMode = li.querySelector(".edit-mode");
    editMode.classList.remove("hidden");
    const input = li.querySelector(".task-title");
    input.readOnly = false;
    input.focus();
    const length = input.value.length;
    input.setSelectionRange(length, length);
  }
  const markEdit = event.target.closest(".mark-edit");
  if (markEdit) {
    const input = li.querySelector(".task-title");
    const inputValue = input.value;
    if (!inputValue.trim()) {
      return;
    }
    const id = Number(markEdit.dataset.id);
    const todo = todos.find((todo) => todo.id === id);
    todo.title = inputValue;
    saveTodo();
    applyFilters();
    const taskActions = li.querySelector(".task-actions");
    taskActions.classList.remove("hidden");
    const editMode = li.querySelector(".edit-mode");
    editMode.classList.add("hidden");
  }
});

//Клик по Undo
undoBtn.addEventListener("click", () => {
  const { index, item } = lastDeleted;
  todos.splice(index, 0, item);
  saveTodo();
  applyFilters();
  lastDeleted = null;
  clearInterval(interval);
  clearTimeout(timer);
  hideUndo();
});

function render(parent, list = todos) {
  if (!list.length) {
    parent.innerHTML = `<div class="flex flex-col gap-8 items-center justify-center">
            <img
              src="/img/Detective-check-footprint 1 (1).svg"
              alt="Empty-fallback"
            />
            <span>Empty...</span>
          </div>`;
    return;
  }
  parent.innerHTML = "";
  list.forEach((el) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <div class="flex items-center gap-16">
              <input class="checkbox" type="checkbox" data-id=${el.id} ${
      el.complete ? "checked" : ""
    }></input>
              <input class="task-title" type="text" readonly value=${
                el.title
              }></input>
              <div class="task-actions gap-8">
                <svg
                  data-id=${el.id}
                  class="edit-task"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.67272 5.99106L2 12.6637V16H5.33636L12.0091 9.32736M8.67272 5.99106L11.0654 3.59837L11.0669 3.59695C11.3962 3.26759 11.5612 3.10261 11.7514 3.04082C11.9189 2.98639 12.0993 2.98639 12.2669 3.04082C12.4569 3.10257 12.6217 3.26735 12.9506 3.59625L14.4018 5.04738C14.7321 5.37769 14.8973 5.54292 14.9592 5.73337C15.0136 5.90088 15.0136 6.08133 14.9592 6.24885C14.8974 6.43916 14.7324 6.60414 14.4025 6.93398L14.4018 6.93468L12.0091 9.32736M8.67272 5.99106L12.0091 9.32736"
                    stroke="#CDCDCD"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg
                  data-id=${el.id}
                  class="remove-task"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.87414 7.61505C3.80712 6.74386 4.49595 6 5.36971 6H12.63C13.5039 6 14.1927 6.74385 14.1257 7.61505L13.6064 14.365C13.5463 15.1465 12.8946 15.75 12.1108 15.75H5.88894C5.10514 15.75 4.45348 15.1465 4.39336 14.365L3.87414 7.61505Z"
                    stroke="#CDCDCD"
                  />
                  <path
                    d="M14.625 3.75H3.375"
                    stroke="#CDCDCD"
                    stroke-linecap="round"
                  />
                  <path
                    d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z"
                    stroke="#CDCDCD"
                  />
                  <path
                    d="M10.5 9V12.75"
                    stroke="#CDCDCD"
                    stroke-linecap="round"
                  />
                  <path
                    d="M7.5 9V12.75"
                    stroke="#CDCDCD"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
               <div class="edit-mode hidden">
              <span data-id=${el.id} class="mark-edit">✔</span><span data-id=${
      el.id
    }  class="close-edit">&times;</span>
            </div>
            </div>
            <hr />
          `;
    parent.appendChild(li);
  });
}

function remove(id) {
  const todo = todos.find((el) => el.id === id);
  lastDeleted = { index: todos.indexOf(todo), item: todo };
  todos = todos.filter((todo) => todo.id !== id);
  saveTodo();
  applyFilters();
  countDown(5);
}

//Сохранение в localStorage
function saveTodo() {
  localStorage.setItem("todos", JSON.stringify(todos));
}
//Удаление undo
function hideUndo() {
  undoBtn.classList.add("hidden");
}
//Отсчет удаления
function countDown(seconds) {
  undoBtn.classList.remove("hidden");
  undoBtn.textContent = `Undo(${seconds})`;
  clearInterval(interval);
  clearTimeout(timer);
  interval = setInterval(() => {
    seconds = seconds - 1;
    if (seconds >= 0) {
      undoBtn.textContent = `Undo(${seconds})`;
    } else {
      clearInterval(interval);
    }
  }, 1000);
  timer = setTimeout(() => {
    lastDeleted = null;
    hideUndo();
  }, seconds * 1000);
}
export { todos, saveTodo, render, list, applyFilters, select };
