/**
 * This logic should find any team that is the favored choice for
 * ONLY one week over the entire season.
 */

function getWeekLeaders(records) {
  return Object.values(records).map((week) => week[0]);
}

function getCountOfTimesLeader(weekLeaders) {
  return weekLeaders.reduce((acc, curr) => {
    const winner = curr["Projected Winner"];
    acc[winner] = (acc[winner] || 0) + 1;
    return acc;
  }, {});
}

function getSingleWeekLeaders(countOfTimesLeader) {
  return Object.keys(countOfTimesLeader).filter(
    (key) => countOfTimesLeader[key] === 1
  );
}

function getSingleWeeks(weekLeaders, singleWeekLeaders) {
  return weekLeaders.filter((weekLeader) =>
    singleWeekLeaders.includes(weekLeader["Projected Winner"])
  );
}

function getSingleWeekNumbers(singleWeeks) {
  return singleWeeks.map((singleWeek) => parseInt(singleWeek["Week"]));
}

function findSingleWeekLeaders(records) {
  let weekLeaders = getWeekLeaders(records);
  let countOfTimesLeader = getCountOfTimesLeader(weekLeaders);
  let singleWeekLeaders = getSingleWeekLeaders(countOfTimesLeader);
  let singleWeeks = getSingleWeeks(weekLeaders, singleWeekLeaders);
  let singleWeekNumbers = getSingleWeekNumbers(singleWeeks);

  return {
    singleWeekLeaders,
    singleWeeks,
    singleWeekNumbers,
  };
}

const espnCsvLoader = require("./espnCsvLoader");
(async () => {
  try {
    const records = await espnCsvLoader();
    if (!records.success) {
      console.log(records.status);
      return;
    }
    console.log(findSingleWeekLeaders(records.data));
  } catch (error) {
    console.error("Error loading data:", error);
  }
})();

module.exports = findSingleWeekLeaders;
