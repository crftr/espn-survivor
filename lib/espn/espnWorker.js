const { parentPort } = require('worker_threads');
const { generateAllCombinations, scoreChoices_timidPuppy, sumPercentageDifference, averagePercentageDifference } = require('./espnGenAndScoring');

parentPort.on('message', ({ espnData, currentWeek, currentCombination, pickedTeams }) => {
  const combinations = [];

  for (const combination of generateAllCombinations(espnData, currentWeek, currentCombination, pickedTeams)) {
    const scoreTimidPuppy = scoreChoices_timidPuppy(combination, espnData);
    const scoreAveragePercentage = averagePercentageDifference(combination, espnData);
    const scoreSumPercentage = sumPercentageDifference(combination, espnData);
    combinations.push({
      combination,
      scoreTimid: scoreTimidPuppy,
      scoreAvg: scoreAveragePercentage,
      scoreSum: scoreSumPercentage,
    });
  }

  parentPort.postMessage(combinations);
});
