


// Load hero image animation
window.addEventListener("load", () => {
  const heroImg = document.querySelector(".hero-img");
  if (heroImg) heroImg.classList.add("loaded");

  updateArrowVisibility(); // Check arrows for category carousel
});

// Toggle menu for mobile
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("active");
}

// Navbar scroll shrink effect
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.padding = "10px 50px";
    navbar.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
  } else {
    navbar.style.padding = "20px 50px";
    navbar.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
  }
});

// Smooth scroll to section & close mobile menu
const navLinks = document.querySelectorAll(".nav-links a");
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("navLinks").classList.remove("active");
  });
});

// Highlight Active Nav Link on Scroll
const sections = document.querySelectorAll("section");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.clientHeight;
    if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Category Scroll Buttons
function scrollCategory(direction) {
  const row = document.getElementById("categoryCarousel");
  const scrollAmount = 300;
  if (direction === "left") {
    row.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else {
    row.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
}

// Show/hide scroll arrows based on overflow
function updateArrowVisibility() {
  const carousel = document.getElementById("categoryCarousel");
  const leftBtn = document.querySelector(".scroll-btn.left");
  const rightBtn = document.querySelector(".scroll-btn.right");

  if (!carousel) return;

  if (carousel.scrollWidth > carousel.clientWidth) {
    leftBtn.style.display = "block";
    rightBtn.style.display = "block";
  } else {
    leftBtn.style.display = "none";
    rightBtn.style.display = "none";
  }
}

window.addEventListener("resize", updateArrowVisibility);


// Falling Foods Animation
const foodImages = [
  "🍕", "🍔", "🍟", "🥗", "🍩", "🍉", "🍇", "🍌", "🥑", "🍪"
];

function triggerFoodRain(duration = 3000) {
  const container = document.querySelector('.falling-foods');
  let interval = setInterval(() => {
    const food = document.createElement('div');
    food.classList.add('falling-food');
    food.textContent = foodImages[Math.floor(Math.random() * foodImages.length)];
    food.style.left = Math.random() * window.innerWidth + 'px';
    food.style.animationDuration = (Math.random() * 2 + 2) + 's';
    container.appendChild(food);

    // Remove food after it falls
    setTimeout(() => food.remove(), 4000);
  }, 150);

  setTimeout(() => clearInterval(interval), duration); // Stop after 3s
}

document.querySelector(".logo").addEventListener("click", () => {
  document.getElementById("home").scrollIntoView({ behavior: "smooth" });
  triggerFoodRain(3000);
});

// AOS Refresh after scroll & resize to ensure re-trigger
window.addEventListener("scroll", () => {
  AOS.refresh();
});

window.addEventListener("resize", () => {
  AOS.refresh();
});

// Initialize AOS For Contact Section
AOS.init({
  duration: 1000,
  once: false,
  mirror: true
});
