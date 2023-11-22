/**
 * This function takes an array of arrays containing game data as input and performs two main operations:
 * 1. Filters out game objects where the 'Completed' property is set to 'true', indicating that the game has been completed.
 * 2. Removes any resulting empty arrays, which means no games in that week's array met the criteria to be included in the output.
 *
 * @param {Array} espnData - An array of arrays where each inner array represents a week of games, and contains objects representing individual games.
 * @return {Array} - A new array of arrays where each inner array contains only game objects with 'Completed' property not equal to 'true', and no empty arrays are present.
 */
function removeCompletedGames(espnData) {
  return espnData
    .map((arrayOfWeeklyGames) => {
      return arrayOfWeeklyGames.filter((item) => item.Completed !== "true");
    })
    .filter((arrayOfWeeklyGames) => arrayOfWeeklyGames.length > 0);
}

/**
 * This function takes an array of arrays containing game data as input and performs two main operations:
 * 1. Filters out game objects where the 'Day of Week' property is set to 'Thursday', indicating that the game was played on a Thursday.
 * 2. Removes any resulting empty arrays, which means no games in that week's array met the criteria to be included in the output.
 * 
 * @param {Array} espnData - An array of arrays where each inner array represents a week of games, and contains objects representing individual games.
 * @param {Array} exceptionalWeeks - An optional array of exceptional week numbers where Thursday games should not be filtered.
 * @return {Array} - A new array of arrays where each inner array contains only game objects with 'Day of Week' property not equal to 'Thursday' in exceptional weeks, and no empty arrays are present.
 */
function removeThursdayGames(espnData, exceptionalWeeks = []) {
  return espnData
    .map((arrayOfWeeklyGames) => {
      return arrayOfWeeklyGames.filter((item) => {
        const isThursdayGame = item['Day of Week'] === "Thursday";
        const isExceptionalWeek = exceptionalWeeks.includes(parseInt(item.Week, 10));
        return !isThursdayGame || isExceptionalWeek;
      });
    })
    .filter((arrayOfWeeklyGames) => arrayOfWeeklyGames.length > 0);
}

/**
 * This function takes an array of arrays containing game data and a percentage difference threshold as inputs. It performs two main operations:
 * 1. Filters out game objects where the 'Projected Winner's Percentage Difference' is less than the specified threshold.
 * 2. Removes any resulting empty arrays, which means no games in that week's array met the criteria to be included in the output.
 * 
 * @param {Array} espnData - An array of arrays where each inner array represents a week of games, and contains objects representing individual games.
 * @param {Number} percentageDifferenceThreshold - The threshold for the 'Projected Winner's Percentage Difference'. Games with a percentage difference less than this value will be filtered out.
 * @return {Array} - A new array of arrays where each inner array contains only game objects with 'Projected Winner's Percentage Difference' greater than or equal to the specified threshold, and no empty arrays are present.
 */
function filterByPercentageDifference(espnData, percentageDifferenceThreshold) {
  return espnData
    .map((arrayOfWeeklyGames) => {
      return arrayOfWeeklyGames.filter((item) => {
        let percentageDifference = parseFloat(item['Projected Winner\'s Percentage Difference']);
        return !isNaN(percentageDifference) && percentageDifference >= percentageDifferenceThreshold;
      });
    })
    .filter((arrayOfWeeklyGames) => arrayOfWeeklyGames.length > 0);
}

/**
 * This function takes an array of arrays containing game data and a ranking threshold as inputs. It performs two main operations:
 * 1. Filters out game objects where the 'Projected Winner's Rank' is greater than the specified threshold.
 * 2. Removes any resulting empty arrays, which means no games in that week's array met the criteria to be included in the output.
 * 
 * @param {Array} espnData - An array of arrays where each inner array represents a week of games, and contains objects representing individual games.
 * @param {Number} rankingThreshold - The threshold for the 'Projected Winner's Rank'. Games with a ranking greater than this value will be filtered out.
 * @return {Array} - A new array of arrays where each inner array contains only game objects with 'Projected Winner's Rank' less than or equal to the specified threshold, and no empty arrays are present.
 */
function filterByRanking(espnData, rankingThreshold) {
  return espnData
    .map((arrayOfWeeklyGames) => {
      return arrayOfWeeklyGames.filter((item) => {
        let ranking = parseInt(item['Projected Winner\'s Rank'], 10);
        return !isNaN(ranking) && ranking <= rankingThreshold;
      });
    })
    .filter((arrayOfWeeklyGames) => arrayOfWeeklyGames.length > 0);
}

/**
 * This function takes an array of arrays containing game data and a list of past picks as inputs. It performs two main operations:
 * 1. Filters out game objects where the 'Projected Winner' is in the list of past picks.
 * 2. Removes any resulting empty arrays, which means no games in that week's array met the criteria to be included in the output.
 * 
 * @param {Array} espnData - An array of arrays where each inner array represents a week of games, and contains objects representing individual games.
 * @param {Array} pastPicks - An array of team names that have been picked in the past.
 * @return {Array} - A new array of arrays where each inner array contains only game objects with 'Projected Winner' not in the list of past picks, and no empty arrays are present.
 */
function filterOutPastPicks(espnData, pastPicks) {
  return espnData
    .map((arrayOfWeeklyGames) => {
      return arrayOfWeeklyGames.filter((item) => !pastPicks.includes(item['Projected Winner']));
    })
    .filter((arrayOfWeeklyGames) => arrayOfWeeklyGames.length > 0);
}

/**
 * This function filters out games that occur before the STARTING_WEEK and after the ENDING_WEEK, based on the 'Week' attribute of each game object.
 *
 * @param {Array} espnData - An array of arrays where each inner array represents a week of games, and contains objects representing individual games.
 * @param {Number} startingWeek - The first week to include in the filtered data.
 * @param {Number} endingWeek - The last week to include in the filtered data.
 * @return {Array} - A new array of arrays where each inner array contains only game objects that occur from the starting week to the ending week, inclusive.
 */
function filterByWeekRange(espnData, startingWeek, endingWeek) {
  return espnData
    .map((arrayOfWeeklyGames) => {
      return arrayOfWeeklyGames.filter((item) => {
        const gameWeek = parseInt(item.Week, 10);
        return gameWeek >= startingWeek && gameWeek <= endingWeek;
      });
    })
    .filter((arrayOfWeeklyGames) => arrayOfWeeklyGames.length > 0);
}


module.exports = {
    removeCompletedGames,
    removeThursdayGames,
    filterByPercentageDifference,
    filterByRanking,
    filterOutPastPicks,
    filterByWeekRange,
};