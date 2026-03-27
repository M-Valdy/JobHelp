import requests

def search_jobs(keyword, **kwargs):
    url = "https://fresh-linkedin-scraper-api.p.rapidapi.com/api/v1/job/search"

    # Default parameters
    params = {
        "keyword": keyword,
        "page": 1,
        "sort_by": "recent"
    }

    # Update with any additional parameters
    params.update(kwargs)

    headers = {
        "x-rapidapi-host": "fresh-linkedin-scraper-api.p.rapidapi.com",
        "x-rapidapi-key": "YOUR_API_KEY"
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()

def get_job_details(job_id):
    url = "https://fresh-linkedin-scraper-api.p.rapidapi.com/api/v1/job/detail"

    querystring = {"job_id": job_id}

    headers = {
        "x-rapidapi-host": "fresh-linkedin-scraper-api.p.rapidapi.com",
        "x-rapidapi-key": "146e205abfmsh851eab553108d5ap178586jsn9242f1a0c5fd"
    }

    response = requests.get(url, headers=headers, params=querystring)

    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()


def test(input):
    # Example usage
    if __name__ == "__main__":
        try:
            # Search for data science jobs with specific filters
            search_params = {
                "date_posted": "past_month",
                "experience_level": "entry_level",
                "remote": "hybrid",
                "easy_apply": True,
                "under_10_applicants": True
            }

            search_results = search_jobs(input, **search_params)
            print(f"Found {search_results['total']} jobs for 'input'")

            if search_results.get("data") and len(search_results["data"]) > 0:
                # Get the first job's ID
                first_job_id = search_results["data"][0]["id"]

                # Get detailed information about the job
                job_details = get_job_details(first_job_id)
                print(f"Job Title: {job_details['data']['title']}")
                print(f"Company: {job_details['data']['company']['name']}")
                print(f"Location: {job_details['data']['location']}")
                description = job_details['data']['description']
                print(f"Description: {description[:200]}...")
        except Exception as e:
            print(f"Error: {e}")

def main():
    test()
