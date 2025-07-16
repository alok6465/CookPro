// Recipes (offline fallback)
let recipes = [];

async function loadOfflineRecipes() {
  try {
    const res = await fetch('recipes_offline.json');
    recipes = await res.json();
  } catch (err) {
    console.error("❌ Failed to load offline recipes:", err);
  }
}

// Offline Mode
if (document.getElementById('ingredientForm')) {
  document.getElementById("ingredientForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const ingredients = document.getElementById("ingredients").value;
    localStorage.setItem("userIngredients", ingredients);
    localStorage.setItem("searchMode", "offline");
    window.location.href = "results.html";
  });
}

// Smart AI Mode (Online)
if (document.getElementById('smartBtn')) {
  document.getElementById("smartBtn").addEventListener("click", function () {
    const ingredients = document.getElementById("ingredients").value.trim();
    if (!ingredients) {
      alert("Please enter some ingredients first.");
      return;
    }
    localStorage.setItem("userIngredients", ingredients);
    localStorage.setItem("searchMode", "online");
    window.location.href = "results.html";
  });
}

// RenderResult Recipes
async function renderResults() {
  const mode = localStorage.getItem("searchMode") || "offline";
  const ingredients = localStorage.getItem("userIngredients");
  const container = document.getElementById("recipeResults");
  container.innerHTML = "<p>Loading recipes...</p>";

  if (!ingredients) {
    container.innerHTML = "<p>No ingredients found in localStorage.</p>";
    return;
  }

  if (mode === "offline") {
    const userIngredients = ingredients.toLowerCase().split(",").map(i => i.trim());
    const matchedRecipes = recipes.filter(recipe =>
      recipe.ingredients.some(ing => userIngredients.includes(ing.toLowerCase()))
    );

    container.innerHTML = "";
    if (matchedRecipes.length === 0) {
      container.innerHTML = "<p>No matching offline recipes found.</p>";
      return;
    }

    matchedRecipes.slice(0, 3).forEach((r) => {
  const stepsHTML = r.steps
    ? `<p><strong>Steps:</strong><ol>${r.steps.map(step => `<li>${step}</li>`).join('')}</ol></p>`
    : '';

  container.innerHTML += `
    <div class="recipe-card">
      <h3>${r.name}</h3>
      <div class="recipe-content">
        <p><strong>Cooking Time:</strong> ${r.time}</p>
        <p><strong>Health Benefits:</strong> ${r.benefits}</p>
        ${stepsHTML}
      </div>
        <button onclick='handleWatchClick("${r.youtube || ""}")' class="btn">▶️ Watch</button>
      <button onclick='saveRecipe("${r.name}")' class="btn">🔖 Save</button>
    </div>
  `;
});

  } else if (mode === "online") {
    const apiBase = "http://localhost:4000";

    try {
      const encoded = encodeURIComponent(ingredients);
      const res = await fetch(`${apiBase}?q=${encoded}`);
      if (!res.ok) throw new Error("API response not OK");

      const data = await res.json();
      container.innerHTML = "";

      if (!data || data.length === 0) {
        container.innerHTML = "<p>No recipes found for your ingredients.</p>";
        return;
      }

      const seen = new Set();
      data.slice(0, 6).forEach((r) => {
        if (!r.RecipeName || seen.has(r.RecipeName)) return;
        seen.add(r.RecipeName);

        const encodedRecipe = encodeURIComponent(JSON.stringify(r));
        container.innerHTML += `
          <div class="recipe-card">
            <h3>${r.RecipeName}</h3>
            <div class="recipe-content">
              <p><strong>Ingredients:</strong><br> ${r.Ingredients || "N/A"}</p>
              <p><strong>Instructions:</strong><br> ${r.TranslatedInstruction || "N/A"}</p>
            </div>
            <button onclick='handleWatchClick("${r.youtube || ""}")' class="btn">▶️ Watch</button>
            <button onclick='saveRecipe("${r.RecipeName}", JSON.parse(decodeURIComponent("${encodedRecipe}")))' class="btn">🔖 Save</button>
          </div>
        `;
      });
    } catch (error) {
      console.error("❌ API fetch failed:", error);
      container.innerHTML = "<p>❌ Failed to fetch recipes from local API.</p>";
    }
  }
}

function watchVideo(url) {
  if (!url) return alert("No video available.");
  const popup = window.open("", "YouTube Video", "width=800,height=600");
  popup.document.write(`
    <html>
      <head><title>Watch Tutorial</title></head>
      <body style='margin:0;padding:0;'>
        <iframe width="100%" height="100%" src="${url.replace("watch?v=", "embed/").replace("shorts/", "embed/")}" frameborder="0" allowfullscreen></iframe>
      </body>
    </html>
  `);
}

function saveRecipe(name, fullRecipe = null) {
  const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
  if (saved.some(r => r.name === name || r.RecipeName === name)) {
    alert("Recipe already saved!");
    return;
  }
  if (fullRecipe) {
    saved.push(fullRecipe);
  } else {
    const r = recipes.find(r => r.name === name);
    if (r) saved.push(r);
  }
  localStorage.setItem('savedRecipes', JSON.stringify(saved));
  alert("Recipe saved!");
}

if (window.location.pathname.includes("results.html")) {
  (async () => {
    await loadOfflineRecipes();
    renderResults();
    loadReviewsPreview();
  })();
}


function showSavedRecipes() {
  const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
  const container = document.getElementById('savedRecipes');
  container.innerHTML = "";

  if (saved.length === 0) {
    container.innerHTML = "<p>No saved recipes yet.</p>";
    return;
  }

  saved.forEach((r, index) => {
    const name = r.name || r.RecipeName;
    const time = r.time || "30 min";
    const ingredients = r.ingredients?.join(', ') || r.Ingredients || "Not available";
    const instructions = r.TranslatedInstruction || r.benefits || "Instructions not available";
    const video = r.youtube || r.URL || "#";

    const stepsHTML = r.steps && Array.isArray(r.steps)
      ? `<p><strong>Steps:</strong><ol>${r.steps.map(step => `<li>${step}</li>`).join('')}</ol></p>`
      : "";

    container.innerHTML += `
      <div class="recipe-card">
        <h3>${name}</h3>
        <p><strong>Time:</strong> ${time}</p>
        <div class="recipe-scrollable">
          <p><strong>Ingredients:</strong><br> ${ingredients}</p>
          <p><strong>Instructions:</strong><br> ${instructions}</p>
${r.steps && r.steps.length ? `
  <p><strong>Steps:</strong></p>
  <ol>${r.steps.map(step => `<li>${step}</li>`).join("")}</ol>
` : ""}

          ${stepsHTML}
        </div>
        <div class="recipe-buttons">
  ${video && video !== "#" ? `<button class="btn" onclick="handleWatchClick('${video}')">▶️ Watch</button>` : ""}

          <button class="btn" onclick='downloadRecipeAsTxt(
  \`${name}\`,
  \`${ingredients}\`,
  \`${instructions}\`,
  ${JSON.stringify(r.steps || [])}
)'>📥 Download</button>

          <button class="btn danger" onclick="deleteRecipe(${index})">🗑️ Delete</button>
        </div>
      </div>
    `;
  });
}

// downloadRecipeAsTxt
function downloadRecipeAsTxt(name, ingredients, instructions, steps = []) {
  let content = `🍽️ Recipe: ${name}\n\n🧂 Ingredients:\n${ingredients}\n\n📝 Instructions:\n${instructions}`;

  if (steps.length > 0) {
    content += `\n\n📋 Steps:\n`;
    steps.forEach((step, index) => {
      content += `${index + 1}. ${step}\n`;
    });
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${name.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
  link.click();
}


function deleteRecipe(index) {
  let saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
  saved.splice(index, 1);
  localStorage.setItem('savedRecipes', JSON.stringify(saved));
  showSavedRecipes();
}

if (window.location.pathname.includes("results.html")) {
  renderResults();
  loadReviewsPreview();
}
if (window.location.pathname.includes("saved.html")) showSavedRecipes();

// Reviews
if (document.getElementById('reviewForm')) {
  document.getElementById('reviewForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('username').value;
    const comment = document.getElementById('comment').value;
    const rating = document.getElementById('rating').value;
    const image = document.getElementById('imageUpload').files[0];

    const reader = new FileReader();
    reader.onload = function () {
      const imgData = image ? reader.result : null;
      const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      reviews.push({ name, comment, rating, img: imgData });
      localStorage.setItem('reviews', JSON.stringify(reviews));
      alert("Review submitted!");
      document.getElementById('reviewForm').reset();
      loadReviews();
    };

    if (image) reader.readAsDataURL(image);
    else {
      const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      reviews.push({ name, comment, rating, img: null });
      localStorage.setItem('reviews', JSON.stringify(reviews));
      alert("Review submitted!");
      document.getElementById('reviewForm').reset();
      loadReviews();
    }
  });
}

function loadReviews() {
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  const container = document.getElementById('reviewsList');
  container.innerHTML = '';

  reviews.forEach((r, index) => {
    container.innerHTML += `
      <div class="review-card">
        <h3>${r.name} - ${'⭐'.repeat(r.rating)}</h3>
        ${r.img ? `<img src="${r.img}" alt="Review Image" class="review-img">` : ''}
        <div class="review-content">
          <p>${r.comment}</p>
        </div>
        <div class="recipe-buttons">
          <button class="btn danger" onclick="deleteReview(${index})">🗑️ Delete</button>
        </div>
      </div>
    `;
  });
}


//deleteReview 
function deleteReview(index) {
  let reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  reviews.splice(index, 1);
  localStorage.setItem('reviews', JSON.stringify(reviews));
  loadReviews(); // refresh UI
}



if (window.location.pathname.includes("reviews.html")) loadReviews();


// loadReviewsPreview  this use too see user comments/reviews on results.html page 
function loadReviewsPreview() {
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  const container = document.getElementById('reviewsList');
  if (!container) return;
  container.innerHTML = '';

  if (reviews.length === 0) {
    container.innerHTML = "<p>No reviews yet. Be the first to post!</p>";
    return;
  }

  reviews.slice(-10).reverse().forEach(r => {
    container.innerHTML += `
      <div class="review-card preview">
        <div class="review-header">
          <strong>${r.name}</strong> - ${'⭐'.repeat(r.rating)}
        </div>
        ${r.img ? `<img src="${r.img}" class="review-thumb" onclick="openReviewImageModal('${r.img}')">` : ''}
        <div class="review-content scrollable">
          <p>${r.comment}</p>
        </div>
      </div>
    `;
  });
}

//openYouTubemodel 
function openYouTubeModal(url) {
  const modal = document.getElementById('youtubeModal');
  const iframe = document.getElementById('youtubeFrame');

  let embedUrl = "";

  // Convert regular YouTube URLs to embed format
  if (url.includes("watch?v=")) {
    embedUrl = url.replace("watch?v=", "embed/");
  } else if (url.includes("shorts/")) {
    // Shorts URLs
    embedUrl = url.replace("shorts/", "embed/");
  } else if (url.includes("youtu.be/")) {
    // youtu.be links
    const videoId = url.split("youtu.be/")[1];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else {
    embedUrl = url; // fallback
  }

  iframe.src = embedUrl;
  modal.style.display = "block";
}

function closeYouTubeModal() {
  const modal = document.getElementById('youtubeModal');
  const iframe = document.getElementById('youtubeFrame');
  iframe.src = "";
  modal.style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById('youtubeModal');
  if (event.target === modal) {
    closeYouTubeModal();
  }
};

function handleWatchClick(url) {
  if (!url || !url.startsWith("http")) {
    alert("❌ No video tutorial available for this recipe.");
    return;
  }
  openYouTubeModal(url);
}


//  toggleSidebar    ------(☰ icon on the top-left that opens a sliding sidebar menu.)
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.width = sidebar.style.width === "250px" ? "0" : "250px";
}

// img popup on result.html pages reviews/comments 
function openReviewImageModal(imgSrc) {
  const modal = document.createElement("div");
  modal.className = "image-modal";
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
    <div class="modal-box">
      <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <img src="${imgSrc}" class="modal-full-img" />
    </div>
  `;
  document.body.appendChild(modal);
}

