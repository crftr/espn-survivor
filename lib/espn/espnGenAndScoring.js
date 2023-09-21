/**
 * This is a generator function that generates all possible combinations of picks for a Knockout (Last Man Standing) game,
 * adhering to the rule that a team cannot be picked more than once throughout the season.
 *
 * @param {Array} espnData - A nested array containing data for each week of the NFL season. Each inner array contains objects representing individual games.
 * @param {number} currentWeek - The index of the current week being processed (starting from 0). Defaults to 0.
 * @param {Array} currentCombination - An array containing the picks made so far. Defaults to an empty array.
 * @param {Set} pickedTeams - A set of teams that have been picked so far in the current combination to avoid duplicate picks. Defaults to an empty set.
 *
 * @yields {Array} - Yields an array representing a valid combination of picks (without duplicates) once all weeks have been processed.
 */
function* generateAllCombinations(
  espnData,
  currentWeek = 0,
  currentCombination = [],
  pickedTeams = new Set()
) {
  // If we have processed all weeks, yield the current combination
  if (currentWeek >= espnData.length) {
    yield currentCombination;
    return;
  }

  // Iterate through each game in the current week
  for (const game of espnData[currentWeek]) {
    const projectedWinner = game["Projected Winner"];

    // If the projected winner has not been picked yet in this combination, proceed to generate combinations with this pick
    if (!pickedTeams.has(projectedWinner)) {
      yield* generateAllCombinations(
        espnData,
        currentWeek + 1,
        currentCombination.concat(game),
        new Set(pickedTeams).add(projectedWinner) // Add the current pick to the set of picked teams
      );
    }
  }
}

/**
 * This function calculates the score of a given combination of picks based on the lowest 'Projected Winner's Percentage Difference' across all games in the combination.
 *
 * @param {Array} combination - An array of game objects representing a combination of picks.
 * @param {Array} espnData - A nested array containing data for each week of the NFL season. Each inner array contains objects representing individual games.
 *
 * @returns {number} - The score of the combination, represented by the minimum 'Projected Winner's Percentage Difference' found in the combination. Lower scores indicate combinations with higher risk.
 */
function scoreChoices_timidPuppy(combination, espnData) {
  let minPercentageDifference = 100;

  for (let weekIndex = 0; weekIndex < combination.length; weekIndex++) {
    const pickedGame = espnData[weekIndex].find(game => game['Projected Winner'] === combination[weekIndex]['Projected Winner']);
    if (pickedGame) {
      const percentageDifference = parseFloat(pickedGame["Projected Winner's Percentage Difference"]);
      if (!isNaN(percentageDifference)) {
        minPercentageDifference = Math.min(minPercentageDifference, percentageDifference);
      }
    }
  }

  return minPercentageDifference;
}

/**
 * This function calculates the sum of the 'Projected Winner's Percentage Difference' across all games in the combination.
 *
 * @param {Array} combination - An array of game objects representing a combination of picks.
 * @param {Array} espnData - A nested array containing data for each week of the NFL season. Each inner array contains objects representing individual games.
 *
 * @returns {number} - The sum of the 'Projected Winner's Percentage Difference' across all games in the combination.
 */
function sumPercentageDifference(combination, espnData) {
  let sumPercentageDifference = 0;

  for (let weekIndex = 0; weekIndex < combination.length; weekIndex++) {
    const pickedGame = espnData[weekIndex].find(game => game['Projected Winner'] === combination[weekIndex]['Projected Winner']);
    if (pickedGame) {
      const percentageDifference = parseFloat(pickedGame["Projected Winner's Percentage Difference"]);
      if (!isNaN(percentageDifference)) {
        sumPercentageDifference += percentageDifference;
      }
    }
  }

  return sumPercentageDifference;
}

/**
 * This function calculates the average score of a given combination of picks based on the 'Projected Winner's Percentage Difference' across all games in the combination.
 *
 * @param {Array} combination - An array of game objects representing a combination of picks.
 * @param {Array} espnData - A nested array containing data for each week of the NFL season. Each inner array contains objects representing individual games.
 *
 * @returns {number} - The average score of the combination, represented by the average 'Projected Winner's Percentage Difference' found in the combination.
 */
function averagePercentageDifference(combination, espnData) {
  let sumPercentageDifference = 0;
  let count = 0;

  for (let weekIndex = 0; weekIndex < combination.length; weekIndex++) {
    const pickedGame = espnData[weekIndex].find(game => game['Projected Winner'] === combination[weekIndex]['Projected Winner']);
    if (pickedGame) {
      const percentageDifference = parseFloat(pickedGame["Projected Winner's Percentage Difference"]);
      if (!isNaN(percentageDifference)) {
        sumPercentageDifference += percentageDifference;
        count += 1;
      }
    }
  }

  return count === 0 ? 0 : sumPercentageDifference / count;
}


module.exports = {
  generateAllCombinations,
  scoreChoices_timidPuppy,
  sumPercentageDifference,
  averagePercentageDifference,
};
