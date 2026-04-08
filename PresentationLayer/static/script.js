// so html button calls searchJobs() here, which will call get_jobs() from python, which will call search_jobs() from python
document.getElementById("searchBtn").addEventListener("click", searchJobs);

function matchesLocation(jobLocation, selectedLocation) {
    const locationMap = {
        canada: ["canada"],
        alberta: ["alberta", "ab"],
        "british columbia": ["british columbia", "bc"],
        manitoba: ["manitoba", "mb"],
        "new brunswick": ["new brunswick", "nb"],
        "newfoundland and labrador": ["newfoundland and labrador", "newfoundland", "labrador", "nl"],
        "nova scotia": ["nova scotia", "ns"],
        ontario: ["ontario", "on"],
        "prince edward island": ["prince edward island", "pei", "pe"],
        quebec: ["quebec", "qc"],
        saskatchewan: ["saskatchewan", "sk"],
        "northwest territories": ["northwest territories", "nt"],
        nunavut: ["nunavut", "nu"],
        yukon: ["yukon", "yt"]
    };

    const terms = locationMap[selectedLocation] || [selectedLocation];
    return terms.some(term => jobLocation.includes(term));
}

async function searchJobs() {
    const keywordInput = document.getElementById("keywordInput");
    const resultsDiv = document.getElementById("results");

    if (!keywordInput) {
        console.error("No element found with id='keywordInput'");
        return;
    }

    if (!resultsDiv) {
        console.error("No element found with id='results'");
        return;
    }

    const keyword = keywordInput.value.trim();

    if (!keyword) {
        resultsDiv.innerHTML = "<p>Please enter a keyword.</p>";
        return;
    }

    try {
        const geocodeLocation = document.getElementById("location").value;

        const response = await fetch(
        `/api/jobs?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(geocodeLocation)}`
        );

        const data = await response.json();

        console.log("Returned data:", data);

        if (!response.ok) {
            resultsDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            return;
        }

        resultsDiv.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            resultsDiv.innerHTML = "<p>No jobs found.</p>";
            return;
        }

        resultsDiv.hidden = false;
        resultsDiv.innerHTML = "<p>TEST RESULTS ARE BEING WRITTEN</p>";
        
        console.log("resultsDiv found:", resultsDiv);
        console.log("data.data:", data.data);

        resultsDiv.hidden = false;
        resultsDiv.innerHTML = "";
        const selectedLocation = document.getElementById("location").value.toLowerCase();

        data.data.forEach(job => {
            const jobLocation = (job.location || "").toLowerCase();
        
            const companyName = job.company?.name || "Unknown";
            const jobTitle = job.title || "No title";
            const jobUrl = job.url || "#";
            const companyLogo = job.company?.logo?.[0]?.url || "";
            
            if (selectedLocation !== "canada" && !matchesLocation(jobLocation, selectedLocation)) {
                return;
            }
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

document.getElementById("keywordInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchJobs();
    }
});