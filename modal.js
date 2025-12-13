import { saveTodo, todos, render, list, select } from "./index.js";

export const modal = {
  open() {
    const backdrop = document.createElement("div");
    backdrop.className = "backdrop";
    backdrop.innerHTML = ` <div class="modal">
        <div class="modal-header">
          <form>
            <h3>New note</h3>
            <input
              class="task-title-field"
              type="text"
              placeholder="Input your note..."
            />
          </form>
        </div>
        <div class="modal-footer flex justify-between">
          <button class="modal-btn cancel">Cancel</button>
          <button class="modal-btn apply" type="submit">Apply</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (event) => {
      const modalElem = event.target.closest(".modal");
      if (!modalElem) {
        modal.close();
        return;
      }
      const cancel = event.target.closest(".cancel");
      if (cancel) {
        modal.close();
      }
      const apply = event.target.closest(".apply");
      if (apply) {
        const input = modalElem.querySelector(".task-title-field");
        if (!input.value.trim()) {
          return;
        }
        const newTask = { id: Date.now(), title: input.value, complete: false };
        input.value = "";
        select.value = "all";
        todos.push(newTask);
        saveTodo();
        render(list);
        modal.close();
      }
    });
    const form = backdrop.querySelector("form");
    form.addEventListener("submit", () => {
      const input = backdrop.querySelector(".task-title-field");
      if (!input.value.trim()) {
        return;
      }
      const newTask = { id: Date.now(), title: input.value, complete: false };
      input.value = "";
      todos.push(newTask);
      saveTodo();
      select.value = "all";
      render(list);
      modal.close();
    });
  },
  close() {
    const backdrop = document.querySelector(".backdrop");
    backdrop.remove();
  },
};
