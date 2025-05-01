document.getElementById('save').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getSelectedText,
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          const selectedText = results[0].result;

          // Ask the user for a title using a prompt
          const title = prompt("Enter a title for the selected content:");

          if (title) {
            // Send the selected text and title to the backend
            saveSelection(selectedText, title);
          } else {
            alert("Title is required. Content not saved.");
          }
        } else {
          alert("No text selected.");
        }
      }
    );
  });
});

document.getElementById('openDashboard').addEventListener('click', () => {
  const dashboardUrl = "C:/Users/91893/my-learning-companion-dashboard/dashboard.html"; // Replace with the actual URL of your dashboard
  chrome.tabs.create({ url: dashboardUrl });
});

function getSelectedText() {
  return window.getSelection().toString();
}

function saveSelection(content, title) {
  const dateTime = new Date().toLocaleString(); // Get current date and time

  const selectionData = {
    content: content,
    title: title,
    date: dateTime,
  };

  // Send the data to the backend server
  fetch("http://localhost:3000/save-selection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(selectionData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Content saved successfully!");
    })
    .catch((error) => {
      console.error("Error saving content:", error);
    });
}
