document.addEventListener("DOMContentLoaded", function () {
    fetchSelections(); // Load saved content

    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("searchBox").addEventListener("input", searchContent);
    document.getElementById("sortOptions").addEventListener("change", sortContent);
});

function fetchSelections() {
    fetch("http://localhost:3000/selections")
        .then(response => response.json())
        .then(data => {
            displaySelections(data);
        })
        .catch(error => console.error("Error fetching selections:", error));
}

function displaySelections(selections) {
    const contentList = document.getElementById("contentList");
    contentList.innerHTML = ""; // Clear previous content

    selections.forEach(selection => {
        const div = document.createElement("div");
        div.classList.add("content-item");
        div.innerHTML = `
            <h3>${selection.name.replace(".json", "")}</h3>
            <button onclick="deleteSelection('${selection.id}')">Delete</button>
        `;
        contentList.appendChild(div);
    });
}

function searchContent() {
    const query = document.getElementById("searchBox").value.toLowerCase();
    const items = document.querySelectorAll(".content-item");

    items.forEach(item => {
        const title = item.querySelector("h3").textContent.toLowerCase();
        item.style.display = title.includes(query) ? "block" : "none";
    });
}

function sortContent() {
    const option = document.getElementById("sortOptions").value;
    const contentList = document.getElementById("contentList");
    let items = Array.from(contentList.children);

    items.sort((a, b) => {
        const titleA = a.querySelector("h3").textContent.toLowerCase();
        const titleB = b.querySelector("h3").textContent.toLowerCase();

        if (option === "newest") return -1; // Newest first
        if (option === "oldest") return 1;  // Oldest first
        if (option === "alpha") return titleA.localeCompare(titleB); // Alphabetical
    });

    items.forEach(item => contentList.appendChild(item));
}

function logout() {
    fetch("http://localhost:3000/logout", { method: "POST" })
        .then(() => window.location.href = "login.html")
        .catch(error => console.error("Logout error:", error));
}
