document.addEventListener('mousedown', (event) => {
  // Start selection on mouse down
  window.getSelection().removeAllRanges();
});

document.addEventListener('mouseup', (event) => {
  // Get the selection when mouse is released
  let selectedText = window.getSelection().toString();
  if (selectedText) {
    console.log('Selected Text:', selectedText);
  }
});
