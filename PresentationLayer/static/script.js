console.log("script loaded");

document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const keywordInput = document.getElementById("keywordInput");
    const locationSelect = document.getElementById("location");
    const resultsDiv = document.getElementById("results");

    if (!searchBtn || !keywordInput || !locationSelect || !resultsDiv) {
        console.error("Missing required HTML elements.");
        return;
    }

    searchBtn.addEventListener("click", searchJobs);

    keywordInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            searchJobs();
        }
    });

    async function searchJobs() {
    const keyword = keywordInput.value.trim();
    const selectedLocation = locationSelect.value;
    const sortOption = document.getElementById("sortOption").value;

    if (!keyword) {
        resultsDiv.hidden = false;
        resultsDiv.innerHTML = "<p>Please enter a keyword.</p>";
        return;
    }

    resultsDiv.hidden = false;
    resultsDiv.innerHTML = "<p>Searching...</p>";

    try {
        const response = await fetch(
            `/api/jobs?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(selectedLocation)}`
        );

        const data = await response.json();
        console.log("Returned data:", data);

        if (!response.ok) {
            resultsDiv.innerHTML = `<p>Error: ${data.error || "Unknown error"}</p>`;
            return;
        }

        if (!data.data || data.data.length === 0) {
            resultsDiv.innerHTML = "<p>No jobs found.</p>";
            return;
        }

        let jobs = data.data;

        // relevance sort
        if (sortOption === "relevance") {
            const keywords = keyword.toLowerCase().split(/\s+/);

            jobs.sort((a, b) => {
                function score(job) {
                    const text = (
                        (job.title || "") +
                        " " +
                        (job.company?.name || "") +
                        " " +
                        (job.location || "")
                    ).toLowerCase();

                    let count = 0;
                    keywords.forEach(word => {
                        if (text.includes(word)) count++;
                    });

                    return count;
                }

                return score(b) - score(a); // descending
            });
        }
        // newest sort
        if (sortOption === "newest") {
            jobs.sort((a, b) => {
                const dateA = new Date(a.date_posted || a.created_at || 0);
                const dateB = new Date(b.date_posted || b.created_at || 0);

                return dateB - dateA; // newest first
            });
        }

        resultsDiv.innerHTML = "";

        jobs.forEach(job => {
            const companyName = job.company?.name || "Unknown";
            const jobTitle = job.title || "No title";
            const jobUrl = job.url || "#";
            const jobLocation = job.location || "No location listed";
            const companyLogo = job.company?.logo?.[0]?.url || "";

            const jobId = job.id || `${jobTitle}-${companyName}-${jobLocation}`;
            const alreadySaved = isFavorite(String(jobId));

            const card = document.createElement("div");
            card.className = "job-card";

            card.innerHTML = `
                ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} logo" class="logo">` : ""}
                <p><strong>${companyName}</strong></p>
                <p>${jobTitle}</p>
                <p>${jobLocation}</p>
                <p><a href="${jobUrl}" target="_blank">Job Listing</a></p>
                <button class="save-btn" ${alreadySaved ? "disabled" : ""}>
                ${alreadySaved ? "Saved" : "Save to Favorites"}</button>
            `;

            // click handler
            const saveButton = card.querySelector(".save-btn");
            saveButton.addEventListener("click", function () {
            addFavorite({
                id: String(jobId),
                title: jobTitle,
                company: companyName,
                location: jobLocation,
                url: jobUrl,
                logo: companyLogo
            });

                saveButton.textContent = "Saved";
                saveButton.disabled = true;
            });

            resultsDiv.appendChild(card);
            resultsDiv.appendChild(document.createElement("hr"));
        });

    } catch (error) {
        console.error("Search failed:", error);
        resultsDiv.innerHTML = "<p>Something went wrong while searching.</p>";
    }
}
    renderFavorites();
});

function addFavorite(job) {
    const favorites = getFavorites();

    const alreadyExists = favorites.some(favorite => favorite.id === job.id);
    if (alreadyExists) {
        alert("This job is already in your favorites.");
        return;
    }

    favorites.push(job);
    saveFavorites(favorites);
    renderFavorites();
}

function removeFavorite(jobId) {
    const favorites = getFavorites().filter(job => job.id !== jobId);
    saveFavorites(favorites);
    renderFavorites();
}

function getFavorites() {
    const favorites = localStorage.getItem("favoriteJobs");
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem("favoriteJobs", JSON.stringify(favorites));
}

function renderFavorites() {
    const favoritesList = document.getElementById("favoritesList");

    if (!favoritesList) {
        console.error("favoritesList element not found");
        return;
    }

    const favorites = getFavorites();
    favoritesList.innerHTML = "";

    if (favorites.length === 0) {
        favoritesList.innerHTML = "<p>No saved jobs yet.</p>";
        return;
    }

    favorites.forEach(job => {
        const card = document.createElement("div");
        card.className = "favorite-job";

        let logoHtml = "";
        if (job.logo) {
            logoHtml = `<img src="${job.logo}" alt="${job.company} logo" class="logo">`;
        }

        card.innerHTML = `
            ${logoHtml}
            <h4>${job.title}</h4>
            <p><strong>Company:</strong> ${job.company}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><a href="${job.url}" target="_blank">View Job Listing</a></p>
            <button class="remove-btn" data-job-id="${job.id}">Remove</button>
        `;

        favoritesList.appendChild(card);
    });

    const removeButtons = favoritesList.querySelectorAll(".remove-btn");
    removeButtons.forEach(button => {
        button.addEventListener("click", function () {
            const jobId = this.getAttribute("data-job-id");
            removeFavorite(jobId);
        });
    });
}

function isFavorite(jobId) {
    const favorites = getFavorites();
    return favorites.some(job => job.id === jobId);
}

function extractSalary(job) {
    const salaryText = job.salary || job.compensation || "";

    if (!salaryText) return 0;

    // extract numbers like 80000, 120000
    const matches = salaryText.match(/\d+/g);

    if (!matches) return 0;

    const numbers = matches.map(n => parseInt(n));
    return Math.max(...numbers);
}