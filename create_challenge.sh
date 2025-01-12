#!/bin/bash

# Set variables
RIOT_TOKEN="RGAPI-63488878-6a0e-49a2-b38b-20782eabfb1e"
WALLET="6icfmsk1QcaP8VgbG2zMPJcKatYu8fCxe9ALa4F527Az"

# Get player name and tagline from command line
echo "Enter player name (e.g., Caps):"
read PLAYER_NAME
echo "Enter tagline (e.g., EUW):"
read TAGLINE

# Step 1: Get PUUID
echo "Getting player PUUID..."
PLAYER_INFO=$(curl -s -H "X-Riot-Token: $RIOT_TOKEN" \
  "https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/$PLAYER_NAME/$TAGLINE")

PUUID=$(echo $PLAYER_INFO | jq -r '.puuid')

if [ -z "$PUUID" ] || [ "$PUUID" = "null" ]; then
    echo "Error: Could not find player"
    exit 1
fi

echo "PUUID found: $PUUID"

# Step 2: Get recent matches
echo "Getting recent matches..."
MATCHES=$(curl -s -H "X-Riot-Token: $RIOT_TOKEN" \
  "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/$PUUID/ids?count=1")

MATCH_ID=$(echo $MATCHES | jq -r '.[0]')

if [ -z "$MATCH_ID" ] || [ "$MATCH_ID" = "null" ]; then
    echo "Error: No recent matches found"
    exit 1
fi

echo "Most recent match ID: $MATCH_ID"

# Step 3: Get match details
echo "Getting match details..."
MATCH_DETAILS=$(curl -s -H "X-Riot-Token: $RIOT_TOKEN" \
  "https://europe.api.riotgames.com/lol/match/v5/matches/$MATCH_ID")

# Step 4: Create challenge
echo "Creating challenge..."
curl -X POST "http://localhost:3000/api/challenges/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"gameType\": \"league\",
    \"wagerAmount\": 1000000000,
    \"matchId\": \"$MATCH_ID\",
    \"wallet\": \"$WALLET\",
    \"playerPuuid\": \"$PUUID\"
  }"