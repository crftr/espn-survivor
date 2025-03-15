const { PriorityQueue } = require("./lib/dataStructures");
const lmsConfig = require("./lmsConfig");
const espnCsvLoader = require("./lib/espn/espnCsvLoader");
const {
  removeCompletedGames,
  removeThursdayGames,
  filterByPercentageDifference,
  filterByRanking,
  filterOutPastPicks,
  filterByWeekRange,
} = require("./lib/espn/espnFilterFunctions");
const {
  generateAllCombinations,
  scoreChoices_timidPuppy,
  sumPercentageDifference,
  averagePercentageDifference,
} = require("./lib/espn/espnGenAndScoring");
const { writeTopChoicesToFile } = require("./lib/espn/espnWriteTopChoices");
const { Worker } = require('worker_threads');

// /* CONFIG */
const userConfigs = [
  lmsConfig.miguel,
  lmsConfig.mikael,
];

const LOG_INTERVAL = lmsConfig.logInterval;
const TOP_COMBINATIONS = lmsConfig.topCombinations;

(async () => {
  for (const userConfig of userConfigs) {
    try {
      const FILE_PREFIX = userConfig.FILE_PREFIX;
      const PAST_PICKS = userConfig.PAST_PICKS;
      const STARTING_WEEK = userConfig.STARTING_WEEK;
      const ENDING_WEEK = userConfig.ENDING_WEEK;
      const PERCENTAGE_DIFFERENCE_THRESHOLD =
        userConfig.PERCENTAGE_DIFFERENCE_THRESHOLD;
      const TEAM_RANKING_THRESHOLD = userConfig.TEAM_RANKING_THRESHOLD;

      const espnCsv = await espnCsvLoader();

      if (!espnCsv.success) {
        console.log(espnCsv.status);
        continue; // Go to the next userConfig
      }

      if (!Array.isArray(espnCsv.data)) {
        console.error("Invalid data format");
        continue;
      }

      let espnData = espnCsv.data;

      espnData = filterByWeekRange(
        espnData,
        STARTING_WEEK + PAST_PICKS.length,
        ENDING_WEEK
      );
      espnData = removeCompletedGames(espnData);
      // espnData = removeThursdayGames(espnData, [12]); // Keep Thursday games during Week 12 (i.e. Thanksgiving exception)
      espnData = removeThursdayGames(espnData);
      espnData = filterOutPastPicks(espnData, PAST_PICKS);
      espnData = filterByRanking(espnData, TEAM_RANKING_THRESHOLD);
      espnData = filterByPercentageDifference(
        espnData,
        PERCENTAGE_DIFFERENCE_THRESHOLD
      );

      console.log("Filtering completed successfully");

      // Create a max priority queue to store the top combinations
      const topCombinations = new PriorityQueue((a, b) => {
        if (a.scoreTimid !== b.scoreTimid) {
          return a.scoreTimid < b.scoreTimid;
        } else {
          return a.scoreAvg < b.scoreAvg;
        }
      });

      let combinationCounter = 0;
      const logInterval = LOG_INTERVAL;

      const worker = new Worker('./lib/espn/espnWorker.js');
      worker.postMessage({ espnData, currentWeek: 0, currentCombination: [], pickedTeams: new Set() });

      worker.on('message', (combinations) => {
        for (const combination of combinations) {
          topCombinations.push(combination);

          if (topCombinations.size() > TOP_COMBINATIONS) {
            topCombinations.pop();
          }

          combinationCounter += 1;
          if (combinationCounter % logInterval === 0) {
            console.log(
              `Processed ${combinationCounter.toLocaleString(
                "en-US"
              )} combinations...`
            );
          }
        }

        const top_N_Combinations = [];
        while (!topCombinations.isEmpty()) {
          top_N_Combinations.push(topCombinations.pop());
        }

        // Reverse the array to have the highest scores first
        top_N_Combinations.reverse();

        // Write the top combinations to a file
        writeTopChoicesToFile(top_N_Combinations, FILE_PREFIX);
      });

      worker.on('error', (error) => {
        console.error('Worker error:', error);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
        }
      });

    } catch (error) {
      console.error("Error loading data:", error);
    }
  }
})();
