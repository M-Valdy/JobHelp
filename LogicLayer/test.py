from flask import Flask, render_template, request, jsonify #render_template needs folder to be exactly named "templates"
from dotenv import load_dotenv
import os #library to access environment variables (because apparently uploading your API key to GitHub is bad... woops)
import requests #library that sends HTTP requests to the API and gets the response back
# https://www.youtube.com/watch?v=jQjjqEjZK58


load_dotenv() 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "..", "PresentationLayer", "templates"),
    static_folder=os.path.join(BASE_DIR, "..", "PresentationLayer", "static")
)

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY") 
RAPIDAPI_HOST = "fresh-linkedin-scraper-api.p.rapidapi.com" 
SEARCH_URL = f"https://{RAPIDAPI_HOST}/api/v1/job/search"
JOB_DETAIL_URL = f"https://{RAPIDAPI_HOST}/api/v1/job/detail"

geo_codes = {
        "Canada": "101174742",
        "Alberta": "103564821",
        "British Columbia": "102044150",
        "Manitoba": "104423466",
        "New Brunswick": "103790618",
        "Newfoundland and Labrador": "106199678",
        "Nova Scotia": "104823201",
        "Ontario": "105149290",
        "Prince Edward Island": "104663945",
        "Quebec": "102237789",
        "Saskatchewan": "104002611",
        "Northwest Territories": "105901604",
        "Nunavut": "106045149",
        "Yukon": "103208794"
    }


def search_jobs(keyword, location="", **kwargs):
    # Default parameters
    params = {
        "keyword": keyword,
        "page": 1,
        "sort_by": "recent"
    }

    geocode = geo_codes.get(location)

    if geocode:
        params["geocode"] = geocode


    params.update(kwargs)

    headers = { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": RAPIDAPI_HOST }

    response = requests.get(SEARCH_URL, headers=headers, params=params, timeout=10)

    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()


@app.route("/") 
@app.route("/home") 
def home(): 
    return render_template("index.html")


def get_job_details(job_id):
    querystring = {"job_id": job_id}

    headers = { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": RAPIDAPI_HOST }

    response = requests.get(JOB_DETAIL_URL, headers=headers, params=querystring)

    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()


@app.route("/api/jobs", methods=["GET"])
def get_jobs():
    keyword = request.args.get("keyword", "").strip()
    location = request.args.get("location", "").strip()

    if not keyword:
        return jsonify({"error": "Keyword is required"}), 400

    try:
        results = search_jobs(keyword, location)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/job-details", methods=["GET"])
def job_details():
    job_id = request.args.get("job_id", "").strip()

    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    try:
        results = get_job_details(job_id)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)


# PAOLO'S NOTE: IF YOU WANT TO TEST THE API, RUN THIS FILE AND THEN GO TO http://localhost:5000/