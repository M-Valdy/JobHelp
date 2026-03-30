function findJobs() {
    const skill = document.getElementById("input").value.toLowerCase();
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
    }
    ];
    
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    
    let found = false;
    
    jobs.forEach(job => {
    if (
    job.location === location &&
    job.title.toLowerCase().includes(skill)
    ) {
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
    }