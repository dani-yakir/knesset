import requests
import json
import os
import time
import random

filedir = os.path.dirname(os.path.abspath(__file__))
scrap_data_dir = os.path.join(filedir, 'scrap_data')
# TODO - maybe move to main
os.makedirs(scrap_data_dir, exist_ok=True)


OPEN_SITE_CMD = 'start chrome --incognito "https://main.knesset.gov.il/Activity/plenum/Votes/Pages/default.aspx"'
CONNECTION_SLEEP = 30
CONNECTION_RETRIES = 10
KNESSET_API_BASE_URL = 'https://knesset.gov.il/WebSiteApi/knessetapi/Votes/'
CMB = 'GetVotesCmbData'
CMB_URL = KNESSET_API_BASE_URL + CMB
CMB_JSON_FILENAME = os.path.join(scrap_data_dir, CMB +  '.json')

VOTE_DETAILS = 'GetVoteDetails/'
VOTE_DETAILS_URL = KNESSET_API_BASE_URL + VOTE_DETAILS

KNOWN_VOTE = 44096

class VoteData:
    def __init__(self, raw_data: dict):
        self._raw_data = raw_data

    @property
    def next(self):
        return self._raw_data['NextAndPrevVotes'][0]['NextVote']

    @property
    def prev(self):
        return self._raw_data['NextAndPrevVotes'][0]['PrevVote']

    @property
    def title(self):
        if (len(self._raw_data['VoteHeader'])):
            return self._raw_data['VoteHeader'][0]['ItemTitle']
        else:
            return 'No title'
        

    @property
    def date(self):
        if (len(self._raw_data['VoteHeader'])):
            return self._raw_data['VoteHeader'][0]['VoteDate']
        else:
            return 'No Date'


def pull_json_to_file(url: str, filename: str) -> dict:
    # Make a GET request to an API that returns JSON
    response_gotten = False
    for i in range(CONNECTION_RETRIES):
        try:
            response = requests.get(url)
            response_gotten = True
        except Exception:
            print(f'Timeout, sleeping for {CONNECTION_SLEEP} seconds...')
            time.sleep(CONNECTION_SLEEP)
    if not response_gotten:
        raise Exception(f'Connection not established: {url}')
    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()  # Parse JSON response into a Python dictionary
        with open(filename, 'w', encoding="utf-8") as f:
            f.write(json.dumps(data, indent=4, ensure_ascii=False))
            return data
    else:
        raise Exception(f"{url} GET request failed with status code: {response.status_code}")
    time.sleep(random.uniform(0.1, 0.2))

def get_vote_details(id: int) -> VoteData:
    url = VOTE_DETAILS_URL + str(id)
    filename = os.path.join(scrap_data_dir, str(id) + '.json')
    return VoteData(pull_json_to_file(url, filename))

def main():
    print('Setting up connection...')
    os.system(OPEN_SITE_CMD)
    print(f'sleeping for {CONNECTION_SLEEP} seconds...')
    time.sleep(CONNECTION_SLEEP)
    print('Getting CMB data...')
    # get CMB metadata first
    pull_json_to_file(CMB_URL, CMB_JSON_FILENAME)

    print('Got CMB, getting a known vote...')
    known_vote_data = get_vote_details(KNOWN_VOTE) 
    print(f'got known vote data {known_vote_data.date}. prev: {known_vote_data.prev}, next: {known_vote_data.next}')

    # get all votes from known to first
    current_vote_data = known_vote_data

    print(f'getting votes in descending order...')
    while (current_vote_data.prev):
        current_vote_data = get_vote_details(current_vote_data.prev)
        print(f'got vote data {current_vote_data.date}. prev: {current_vote_data.prev}')

    # get all votes from known to most recent
    current_vote_data = known_vote_data
    print(f'getting votes in ascending order...')
    while (current_vote_data.next):
        current_vote_data = get_vote_details(current_vote_data.next)
        print(f'got vote data {current_vote_data.date}. next: {current_vote_data.next}')
    

    
    

if __name__ == '__main__':
    main()