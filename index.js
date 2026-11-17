let userEditId = null

async function getUsers() {
    const response = await fetch("http://localhost:3000/users");
    const users = await response.json();
    displayUsers(users);
}

function displayUsers(users) {
    const tableBody = document.getElementById("users-table-body");
    const columns = ["name", "email", "city", "phone", "role", "actions"];

    tableBody.innerHTML = ""

    for (const user of users) {
        const row = document.createElement("tr");

        for (const column of columns) {
            if (column !== "actions") {
                const cell = document.createElement("td");
                cell.textContent = user[column];
                row.appendChild(cell);
            } else {
                const cell = document.createElement("td");
                const actions = document.createElement("div");
                actions.className = "d-flex flex-row gap-2";

                const editButton = document.createElement("button");
                editButton.className = "btn btn-primary btn-sm";
                editButton.textContent = "Módosítás";
                editButton.onclick = () => editUser(user)

                const deleteButton = document.createElement("button");
                deleteButton.className = "btn btn-danger btn-sm";
                deleteButton.textContent = "Törlés";
                deleteButton.onclick = () => deleteUser(user.id)

                actions.append(editButton, deleteButton)
                cell.appendChild(actions)
                row.appendChild(cell)
            }
        }

        tableBody.appendChild(row);
    }
}

const form = document.getElementById("userForm");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const city = document.getElementById("cityInput").value.trim();
    const phone = document.getElementById("phoneInput").value.trim();

    const toast = document.createElement("div")
    const p = document.createElement("p")

    try {

        if (name.length < 3 || name.length > 50 || !/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(name)) {
            throw new Error("A név 3-50 karakter között legyen és a magyar ABC betűit tartalmazza!");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Érvénytelen email cím!");
        }

        if (city.length < 2 || city.length > 50 || !/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(city)) {
            throw new Error("A város neve 2-50 karakter között legyen és a magyar ABC betűit tartalmazza!");
        }

        if (!/^[0-9+\s()-]{6,20}$/.test(phone)) {
            throw new Error("Érvénytelen telefonszám!");
        }

        const user = {
            name,
            email,
            city,
            phone,
            role: "Vevő"
        };

        if (userEditId == null) {
            const response = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                throw new Error("Sikertelen mentés!");
            }

            toast.className = "toast position-fixed top-0 start-0 m-3 p-3 show bg-success border-0 shadow";
            p.className = "mb-0 fw-semibold text-white";
            p.textContent = "Sikeres felvétel!";

            form.reset();
            getUsers()
        }
        else {
            const response = await fetch(`http://localhost:3000/users/${userEditId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                throw new Error("Sikertelen változtatás!");
            }

            toast.className = "toast position-fixed top-0 start-0 m-3 p-3 show bg-success border-0 shadow";
            p.className = "mb-0 fw-semibold text-white";
            p.textContent = "Sikeres változtatás!";

            form.reset();
            getUsers()
        }
    }
    catch (err) {
        toast.className = "toast position-fixed top-0 start-0 m-3 p-3 show bg-danger border-0 shadow";
        p.className = "mb-0 fw-semibold text-white";
        p.textContent = err.message;
    }

    toast.appendChild(p);
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
})

async function editUser(user) {
    userEditId = user.id
    document.getElementById("nameInput").value = user.name
    document.getElementById("emailInput").value = user.email
    document.getElementById("cityInput").value = user.city
    document.getElementById("phoneInput").value = user.phone
}


async function deleteUser(id) {
    const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
    });

    const toast = document.createElement("div")
    const p = document.createElement("p")

    if (response.ok) {
        toast.className = "toast position-fixed top-0 start-0 m-3 p-3 show bg-success border-0 shadow";
        p.className = "mb-0 fw-semibold text-white";
        p.textContent = "Felhasználó sikeresen törölve!";
    } else {
        toast.className = "toast position-fixed top-0 start-0 m-3 p-3 show bg-danger border-0 shadow";
        p.className = "mb-0 fw-semibold text-white";
        p.textContent = "Hiba történt a tölrés közben!";
    }

    getUsers()
}

getUsers()