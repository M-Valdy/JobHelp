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

            resultsDiv.innerHTML = "";

            data.data.forEach(job => {
                const companyName = job.company?.name || "Unknown";
                const jobTitle = job.title || "No title";
                const jobUrl = job.url || "#";
                const jobLocation = job.location || "No location listed";
                const companyLogo = job.company?.logo?.[0]?.url || "";

                resultsDiv.innerHTML += `
                    <div class="job-card">
                        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} logo" class="logo">` : ""}
                        <p><strong>${companyName}</strong></p>
                        <p>${jobTitle}</p>
                        <p>${jobLocation}</p>
                        <p><a href="${jobUrl}" target="_blank">Job Listing</a></p>
                    </div>
                    <hr>
                `;
            });
        } catch (error) {
            console.error("Search failed:", error);
            resultsDiv.innerHTML = "<p>Something went wrong while searching.</p>";
        }
    }
});