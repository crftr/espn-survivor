const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.espn.com/nfl/schedule/_/week/";
const YEAR = "2024";
const SEASON_TYPE = "2";
const NUMBER_OF_TEAMS = 32;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

const axiosInstance = axios.create({
  headers: {
    "User-Agent": USER_AGENT,
  },
});

async function getTeamFpi() {
  const url = "https://www.espn.com/nfl/fpi";
  console.log(`Fetching FPI data...`);

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const fpiData = {};
    const names = {};

    $("tbody tr.Table__TR").each((i, element) => {
      let text = $(element).text();
      let dIdx = element.attribs["data-idx"];
      if (dIdx) {
        if (Object.keys(names).length === NUMBER_OF_TEAMS) {
          const teamData = $(element)
            .find("td.Table__TD")
            .toArray()
            .map((td) => $(td).text());

          fpiData[dIdx] = {
            teamName: names[dIdx],
            winLossTie: teamData[0],
            powerIndex: parseFloat(teamData[1]),
            rank: parseInt(teamData[2]),
            rankChange: parseInt(teamData[3]),
            powerOffense: parseFloat(teamData[4]),
            powerDefense: parseFloat(teamData[5]),
            powerSpecial: parseFloat(teamData[6]),
            strengthOfSeason: parseFloat(teamData[7]),
            strengthOfSeasonRemaining: parseFloat(teamData[8]),
            avgWinProb: parseFloat(teamData[9]),
          };

          fpiData[names[dIdx]] = fpiData[dIdx];

        } else {
          names[dIdx] = text;
        }
      }
    });

    return fpiData;
  } catch (error) {
    console.error(`Error fetching FPI data: ${error.message}`);
  }
}

async function getGameLinks(week) {
  const url = `${BASE_URL}${week}/year/${YEAR}/seasontype/${SEASON_TYPE}`;
  console.log(`Fetching game links for week ${week}...`);
  const { data } = await axiosInstance.get(url);
  const $ = cheerio.load(data);
  const gameLinks = [];

  $("a").each((i, element) => {
    const link = $(element).attr("href");
    if (link && link.includes("game/_/gameId")) {
      gameLinks.push(`https://www.espn.com${link}`);
    }
  });

  console.log(`Found ${gameLinks.length} game links for week ${week}.`);
  return gameLinks;
}

async function getMatchupPredictorStats(gameLink, week) {
  console.log(`Fetching matchup predictor stats for game: ${gameLink}...`);
  const { data } = await axiosInstance.get(gameLink);
  const $ = cheerio.load(data);

  let percentages = $("div.matchupPredictor").text().split("%");
  let awayPercentage = parseFloat(percentages[0]);
  let homePercentage = parseFloat(percentages[1]);

  let projectedWinner;
  if (awayPercentage > homePercentage) {
    projectedWinner = $(
      ".Gamestrip__TeamContent--left .ScoreCell__TeamName"
    ).text();
  } else {
    projectedWinner = $(
      ".Gamestrip__TeamContent--right .ScoreCell__TeamName"
    ).text();
  }

  const pageTitleText = $('title').text();

  // Date format e.g. Sep 8, 2024
  const titleDateRegex= pageTitleText.match(/\w{3,}\ \d{1,2},\ \d{4}/);
  const gameDate = new Date(titleDateRegex[0])
  const dayOfWeek = getDayOfWeek(gameDate);
  const date = gameDate.toDateString();

  const projectedWinnersWinProbability = Math.max(awayPercentage, homePercentage);
  const projectedLoserWinProbability = Math.min(awayPercentage, homePercentage);
  const projectedWinnersPercentageDifference = parseFloat(
    (projectedWinnersWinProbability - projectedLoserWinProbability).toFixed(2)
  );

  const stats = {
    gameUrl: gameLink,
    week,
    date,
    dayOfWeek: dayOfWeek,
    awayTeam: $(
      ".Gamestrip__TeamContent--left .ScoreCell__TeamName"
    ).text(),
    awayPercentage,
    homeTeam: $(
      ".Gamestrip__TeamContent--right .ScoreCell__TeamName"
    ).text(),
    homePercentage,
    projectedWinner,
    projectedWinnersWinProbability,
    projectedLoserWinProbability,
    projectedWinnersPercentageDifference,
  };

  console.log(`Stats for game:`, stats);
  return stats;
}

function writeStatsToCSV(gameStatsArray, powerIndex) {
  // Sort the gameStatsArray by week and then by Projected Winner's Percentage Difference
  gameStatsArray.sort((a, b) => {
    if (a.week !== b.week) {
      return a.week - b.week; // Sort by week in ascending order
    }
    return (
      b.projectedWinnersPercentageDifference -
      a.projectedWinnersPercentageDifference
    ); // Sort by Projected Winner's Percentage Difference in descending order
  });

  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const folderName = "espnStats";
  const filename = path.join(folderName, `espn_nfl_stats_${timestamp}.csv`);
  const header = [
    "Completed",
    "Week",
    "Day of Week",
    "Projected Winner",
    "Projected Winner's Rank",
    "Projected Winner's Percentage",
    "Projected Winner's Percentage Difference",
    "Rank Difference",
    "Away Team",
    "Away Percentage",
    "Home Team",
    "Home Percentage",
    "Game URL",
  ];

  const csvContent = [
    header.join(","),
    ...gameStatsArray.map((gameStats) => {
      const powerIndexAway = powerIndex[gameStats.awayTeam];
      const powerIndexHome = powerIndex[gameStats.homeTeam];

      const rankDifference = Math.abs(powerIndexAway.rank - powerIndexHome.rank);
      const projectedWinnersRank =
        gameStats.projectedWinner === gameStats.awayTeam
          ? powerIndexAway.rank
          : powerIndexHome.rank;

      const gameCompleted = isNaN(gameStats.projectedWinnersPercentageDifference);

      return [
        gameCompleted,
        gameStats.week,
        gameStats.dayOfWeek,
        gameStats.projectedWinner,
        projectedWinnersRank,
        gameCompleted ? '' : gameStats.projectedWinnersWinProbability,
        gameCompleted ? '' : gameStats.projectedWinnersPercentageDifference,
        rankDifference,
        gameStats.awayTeam,
        gameStats.awayPercentage,
        gameStats.homeTeam,
        gameStats.homePercentage,
        gameStats.gameUrl,
      ].join(",");
    }),
  ].join("\n");

  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }

  fs.writeFileSync(filename, csvContent);
  console.log(`Stats written to ${filename}`);
}

function getDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Main function to fetch and write stats
(async () => {
  try {
    const powerIndex = await getTeamFpi();

    const gameStats = [];
    for (let week = 1; week <= 18; week++) {
      const gameLinks = await getGameLinks(week);
      for (const gameLink of gameLinks) {
        const stats = await getMatchupPredictorStats(gameLink, week);
        gameStats.push(stats);
      }
    }

    writeStatsToCSV(gameStats, powerIndex);
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
})();
