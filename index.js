async function getUsers() {
    const response = await fetch("http://localhost:3000/users");
    const users = await response.json();
    displayUsers(users);
}

function displayUsers(users) {
    const tableBody = document.getElementById("users-table-body");
    const columns = ["name", "email", "city", "phone", "role"];

    tableBody.innerHTML = ""
    for (const user of users) {
        const row = document.createElement("tr");

        for (const column of columns) {
            const cell = document.createElement("td");
            cell.textContent = user[column];
            row.appendChild(cell);
        }

        tableBody.appendChild(row);
    }
}

getUsers()