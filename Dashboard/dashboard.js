const contentContainer = document.getElementById("contentContainer");
const searchInput = document.getElementById("searchInput");
const sortOptions = document.getElementById("sortOptions");
const searchBtn = document.getElementById("searchBtn");

let savedContent = []; // This will hold the fetched content

// Fetch data from the backend
function fetchContent() {
  fetch("http://localhost:3000/selections")
    .then((response) => response.json())
    .then((data) => {
      savedContent = data;
      renderContent(savedContent);
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// Render content dynamically
function renderContent(content) {
  contentContainer.innerHTML = ""; // Clear the container
  content.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.content}</p>
      <p class="date">Saved on: ${item.date}</p>
      <button class="deleteBtn" data-index="${index}">Delete</button>
    `;
    contentContainer.appendChild(card);
  });

  // Add event listeners for delete buttons
  const deleteBtns = document.querySelectorAll(".deleteBtn");
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      deleteContent(index);
    });
  });
}

// Search content by title or date
function searchContent() {
  const query = searchInput.value.toLowerCase();
  const filteredContent = savedContent.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.date.toLowerCase().includes(query)
  );
  renderContent(filteredContent);
}

// Sort content by selected criteria
function sortContent() {
  const option = sortOptions.value;
  let sortedContent = [...savedContent];
  
  switch (option) {
    case "newest":
      sortedContent.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "oldest":
      sortedContent.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "alphabetical":
      sortedContent.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "reverseAlphabetical":
      sortedContent.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }
  renderContent(sortedContent);
}

// Delete selected content
function deleteContent(index) {
  const selectedContent = savedContent[index];

  // Make a DELETE request to remove the selected content from the backend
  fetch("http://localhost:3000/delete-selection", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: selectedContent.title, date: selectedContent.date }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Content deleted successfully") {
        alert("Content deleted!");
        savedContent.splice(index, 1); // Remove the content from the frontend array
        renderContent(savedContent); // Re-render the content
      }
    })
    .catch((error) => console.error("Error deleting content:", error));
}

// Event listeners
searchBtn.addEventListener("click", searchContent);
sortOptions.addEventListener("change", sortContent);

// Initial data fetch
fetchContent();
