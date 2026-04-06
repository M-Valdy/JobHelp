from flask import Flask, render_template, request, jsonify #render_template needs folder to be exactly named "templates"
from dotenv import load_dotenv
import os #library to access environment variables (because apparently uploading your API key to GitHub is bad... woops)
import requests #library that sends HTTP requests to the API and gets the response back
# https://www.youtube.com/watch?v=jQjjqEjZK58

load_dotenv() 
app = Flask(__name__) 
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY") 
RAPIDAPI_HOST = "fresh-linkedin-scraper-api.p.rapidapi.com" 
SEARCH_URL = f"https://{RAPIDAPI_HOST}/api/v1/job/search"
JOB_DETAIL_URL = f"https://{RAPIDAPI_HOST}/api/v1/job/detail"



def search_jobs(keyword):
    # Default parameters
    params = {
        "keyword": keyword,
        "page": 1,
        "sort_by": "recent"
    }

    headers = { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": RAPIDAPI_HOST }

    response = requests.get(SEARCH_URL, headers=headers, params=params)

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





if __name__ == "__main__":
    app.run(debug=True)