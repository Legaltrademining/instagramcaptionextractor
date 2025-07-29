async function extractCaption() {
  const url = document.getElementById('instaUrl').value;
  const errorBox = document.getElementById('error');
  const resultBox = document.getElementById('result');
  const preview = document.getElementById('preview');
  const captionText = document.getElementById('captionText');

  errorBox.classList.add('hidden');
  resultBox.classList.add('hidden');

  if (!url.trim()) {
    errorBox.textContent = "Please enter a valid Instagram post URL.";
    errorBox.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    preview.src = data.image;
    captionText.textContent = data.caption || "(No caption found)";
    resultBox.classList.remove('hidden');
  } catch (err) {
    errorBox.textContent = err.message || "Something went wrong.";
    errorBox.classList.remove('hidden');
  }
}
