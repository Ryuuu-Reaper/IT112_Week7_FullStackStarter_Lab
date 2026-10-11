const contactForm = document.getElementById("contactForm");
const contactRows = document.getElementById("contactRows");
const messageRegion = document.getElementById("messageRegion");
const userCount = document.getElementById("userCount");
const saveButton = document.getElementById("saveButton");
const cancelEditButton = document.getElementById("cancelEdit");
const searchInput = document.getElementById("searchInput");
let users = [];
let editingId = null;
let messageTimer;

function showMessage(text, error = false) {
  window.clearTimeout(messageTimer);
  messageRegion.replaceChildren();
  const message = document.createElement("p");
  message.className = `message${error ? " error" : ""}`;
  message.setAttribute("role", error ? "alert" : "status");
  message.textContent = text;
  messageRegion.append(message);
  messageTimer = window.setTimeout(() => messageRegion.replaceChildren(), 4000);
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(`The API returned an unexpected response (${response.status}).`);
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
}

function makeAction(label, className, handler, accessibleName) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn-row-action ${className}`.trim();
  button.textContent = label;
  button.setAttribute("aria-label", accessibleName);
  button.addEventListener("click", handler);
  return button;
}

function makeRow(user) {
  const row = document.createElement("tr");

  const nameCell = document.createElement("td");
  const name = document.createElement("span");
  name.className = "contact-name";
  name.textContent = user.name;
  nameCell.append(name);

  const emailCell = document.createElement("td");
  emailCell.className = "contact-email";
  emailCell.textContent = user.email;

  const ageCell = document.createElement("td");
  ageCell.className = "contact-age";
  ageCell.textContent = user.age === null || user.age === undefined ? "-" : user.age;

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "table-actions";
  actions.append(
    makeAction("Edit", "", () => beginEdit(user), `Edit ${user.name}`),
    makeAction("Delete", "delete", () => deleteUser(user._id), `Delete ${user.name}`)
  );
  actionsCell.append(actions);
  row.append(nameCell, emailCell, ageCell, actionsCell);
  return row;
}

function renderUsers() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query)
  );
  userCount.textContent = users.length;

  if (filteredUsers.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "table-state";
    cell.colSpan = 4;
    cell.textContent = users.length === 0 ? "No users found." : "No users match that search.";
    row.append(cell);
    contactRows.replaceChildren(row);
    return;
  }

  contactRows.replaceChildren(...filteredUsers.map(makeRow));
}

async function loadUsers() {
  try {
    const data = await requestJson("/api/users");
    users = data;
    renderUsers();
  } catch (error) {
    userCount.textContent = "!";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "table-state";
    cell.colSpan = 4;
    cell.textContent = error.message || "Could not load users.";
    row.append(cell);
    contactRows.replaceChildren(row);
  }
}

function beginEdit(user) {
  editingId = user._id;
  document.getElementById("name").value = user.name;
  document.getElementById("email").value = user.email;
  document.getElementById("age").value = user.age ?? "";
  document.getElementById("formTitle").textContent = "Edit details";
  saveButton.firstChild.textContent = "Save changes ";
  cancelEditButton.hidden = false;
  document.getElementById("contactForm").scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("name").focus();
}

function resetEditor() {
  editingId = null;
  contactForm.reset();
  document.getElementById("formTitle").textContent = "Add User";
  saveButton.firstChild.textContent = "Save User ";
  cancelEditButton.hidden = true;
}

async function deleteUser(id) {
  try {
    const result = await requestJson(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (editingId === id) resetEditor();
    showMessage(result.message);
    await loadUsers();
  } catch (error) {
    showMessage(error.message, true);
  }
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  saveButton.disabled = true;
  const wasEditing = Boolean(editingId);

  const payload = Object.fromEntries(new FormData(contactForm).entries());
  if (payload.age === "") delete payload.age;
  else if (payload.age !== undefined) payload.age = Number(payload.age);

  try {
    const url = editingId ? `/api/users/${encodeURIComponent(editingId)}` : "/api/users";
    const result = await requestJson(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    resetEditor();
    showMessage(wasEditing ? "User updated." : "User saved.");
    await loadUsers();
    return result;
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    saveButton.disabled = false;
  }
});

cancelEditButton.addEventListener("click", resetEditor);
searchInput.addEventListener("input", renderUsers);
document.getElementById("refreshButton").addEventListener("click", loadUsers);

loadUsers();
