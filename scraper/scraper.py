import requests
import json
import os

filedir = os.path.dirname(os.path.abspath(__file__))
scrap_data_dir = os.path.join(filedir, 'scrap_data')
# TODO - maybe move to main
os.makedirs(scrap_data_dir, exist_ok=True)

KNESSET_API_BASE_URL = 'https://knesset.gov.il/WebSiteApi/knessetapi/Votes/'
CMB = 'GetVotesCmbData'
CMB_URL = KNESSET_API_BASE_URL + CMB
CMB_JSON_FILENAME = os.path.join(scrap_data_dir, CMB +  '.json')

def pull_json_to_file(url: str, filename: str) -> dict:
    # Make a GET request to an API that returns JSON
    response = requests.get(url)
    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()  # Parse JSON response into a Python dictionary
        with open(filename, 'w') as f:
            f.write(json.dumps(data, indent=4))
            return data
    else:
        raise Exception(f"{url} GET request failed with status code: {response.status_code}")


def main():
    # 
    pull_json_to_file(CMB_URL, CMB_JSON_FILENAME)
    

if __name__ == '__main__':
    main()