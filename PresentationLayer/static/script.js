function findJobs() {
    const skill = document.getElementById("input").value.toLowerCase();
    if (!skill.trim()) {
        alert("Please enter a job you're interested in.");
        return;
    }
    const location = document.getElementById("location").value;
    
    const jobs = [
    {
    title: "Software Developer",
    company: "Google",
    location: "Alberta",
    match: 3
    },
    {
    title: "Web Developer Intern",
    company: "Startup Inc",
    location: "Ontario",
    match: 2
    },
    {
    title: "IT Support",
    company: "Tech Solutions",
    location: "British Columbia",
    match: 2
    },
    {
    title: "Website Developer Intern",
    company: "DataCat",
    location: "Ontario",
    match: 1
    },
    {
    title: "Cybersecurity Analyst",
    company: "SecureTech",
    location: "Alberta",
    match: 0
    }
    ];
    
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    
    let found = false;
    
    jobs.forEach(job => {

    // match location + flexible skill match
    const titleLower = job.title.toLowerCase();
    const skillWords = skill.split(' ').filter(word => word.trim() !== '');
    const skillMatch = skill === "" || skillWords.every(word => titleLower.includes(word));
    
    // Get selected match levels from checkboxes
    let checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    let selectedMatchLevels = [];
    checkboxes.forEach((checkbox) => {
        selectedMatchLevels.push(parseInt(checkbox.value));
    });
    
    // Check if job matches the selected criteria
    let matchLevelFilter = selectedMatchLevels.length === 0 || selectedMatchLevels.includes(job.match);
    
    if ((job.location === location || location === "Any Location") && skillMatch && matchLevelFilter) {
    found = true;
    
    resultsDiv.innerHTML += `
    <div>
    <h4>${job.title}</h4>
    <p>Company: ${job.company}</p>
    <p>Location: ${job.location}</p>
    <p>Match Score: ${job.match}</p>
    </div>
    `;
    }
    });
    
    // If no jobs found
if (!found) {
    resultsDiv.innerHTML = "<p>No jobs found.</p>";
    }
    
    // Show the results div
    resultsDiv.removeAttribute("hidden");
    resultsDiv.setAttribute("aria-selected", "true");
    }








// so html button calls searchJobs() here, which will call get_jobs() from python, which will call search_jobs() from python
document.getElementById("searchBtn").addEventListener("click", searchJobs);

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
        const response = await fetch(`/api/jobs?keyword=${encodeURIComponent(keyword)}`); // calls get_jobs() in test.py
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
        data.data.forEach(job => {
            const companyName = job.company?.name || "Unknown";
            const jobTitle = job.title || "No title";
            const jobUrl = job.url || "#";
            const companyLogo = job.company?.logo?.[0]?.url || "";

            resultsDiv.innerHTML += `
                <div class="job-card">
                    ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} logo" class="logo">` : ""}
                    <p><strong>${companyName}</strong></p>
                    <p>${jobTitle}</p>
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