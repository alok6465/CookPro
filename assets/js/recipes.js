// File: assets/js/recipes.js

let recipes = [];

async function loadRecipes() {
  try {
    const res = await fetch("assets/data/recipes.json");
    recipes = await res.json();
  } catch (err) {
    console.error("Failed to load recipes:", err);
  }
}

function fuzzyMatch(input, target) {
  input = input.toLowerCase();
  target = target.toLowerCase();
  return target.includes(input) || input.split(" ").some(word => target.includes(word));
}

function handleSearch() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const results = recipes.filter(recipe =>
    fuzzyMatch(query, recipe.name) ||
    recipe.ingredients.some(ing => fuzzyMatch(query, ing))
  );
  renderRecipes(results.slice(0, 3));
}

function renderRecipes(recipesToShow) {
  const container = document.getElementById("recipeResults");
  container.innerHTML = "";

  if (!recipesToShow.length) {
    container.innerHTML = `<p>No matching recipes found.</p>`;
    return;
  }

  recipesToShow.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}" />
      <div class="content">
        <h3 class="title">${recipe.name}</h3>
        <div class="time-likes">
          <span>⏱ ${recipe.time}</span>
          <span>❤️ ${recipe.likes || 100}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => showRecipeModal(recipe));
    container.appendChild(card);
  });
}

// ✅ New helper function to extract video ID from YouTube link
function extractYoutubeID(url) {
  const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function showRecipeModal(recipe) {
  document.getElementById("modalTitle").textContent = recipe.name;
  document.getElementById("modalIngredients").textContent = recipe.ingredients.join(", ");
  document.getElementById("modalSteps").textContent = recipe.steps || "Follow the video for steps.";
  document.getElementById("modalTime").textContent = recipe.time;

  // ✅ FIXED YouTube embed link
  const videoId = extractYoutubeID(recipe.youtube);
  document.getElementById("modalYoutube").src = videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : "";

  const txtContent = `Recipe: ${recipe.name}\nTime: ${recipe.time}\nIngredients: ${recipe.ingredients.join(", ")}\nSteps: ${recipe.steps || "Check video"}`;
  const blob = new Blob([txtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  document.getElementById("downloadBtn").href = url;
  document.getElementById("downloadBtn").download = `${recipe.name}.txt`;

  document.getElementById("groceryBtn").href = "https://blinkit.com/";

  document.getElementById("recipeModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("recipeModal").style.display = "none";
  document.getElementById("modalYoutube").src = "";
}

loadRecipes();
