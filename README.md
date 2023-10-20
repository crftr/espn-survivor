# espn-survivor

This is a strategy solver for a fantasy-like NFL game I play with my friends and friends-of-friends. The game is also known as _Last Man Standing_, _Knockout_, _Eliminator_, _Suicide_, or _King of the Hill_.

### The rules of the game
- The game starts at the beginning of the season
- Each week the players will choose one of the teams in the league. _Different players can choose the same team if they wish_.
- If a given player’s team wins, they go through to the next week; lose or draw, they’re out.
- The remaining players choose another team that they think will win the following week. **Importantly**, no player can choose a team they have chosen before.
- This continues until there is one player left. They win!

### Installation
1. Clone locally
2. `yarn install`

### Usage
1. Edit `lmsConfig.js` to define the scenario.
2. Edit `espnSurvivor.js` to load your scenario, by the key.
3. `node espnGetStats.js` to refresh stats from ESPN.
4. `node espnSurvivor.js` to generate the top scenario solutions.

## Discussion and strategy
There are 32 teams in the NFL and 18 weeks in the regular season for 2021. The number of possible permutations is quite large. `P(32, 18) = 32!/14!`.

...

### Other interesting sources

https://www.espn.com/nfl/picks
https://www.nfeloapp.com/games/nfl-ev-bets