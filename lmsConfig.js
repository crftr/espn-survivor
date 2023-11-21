module.exports = {
  logInterval: 300000,
  topCombinations: 25,

  // LMS 1

  mike: {
    FILE_PREFIX: "mike",
    PAST_PICKS: [
      "Washington Commanders",
      "Buffalo Bills",
      "Jacksonville Jaguars",
      "San Francisco 49ers",
      "Detroit Lions",
      "Los Angeles Rams",
      "Seattle Seahawks",
      "New York Jets",
      "Cleveland Browns",
      "Dallas Cowboys",
      "Miami Dolphins",
    ],
    STARTING_WEEK: 1,
    ENDING_WEEK: 18,
    PERCENTAGE_DIFFERENCE_THRESHOLD: 25,
  },

  // LMS 2

  two_miguel: {
    FILE_PREFIX: "two_miguel",
    PAST_PICKS: [
      "Seattle Seahawks",
      "Baltimore Ravens",
      "Cleveland Browns",
      "Dallas Cowboys",
      "Buffalo Bills",
    ],
    STARTING_WEEK: 7,
    ENDING_WEEK: 18,
    PERCENTAGE_DIFFERENCE_THRESHOLD: 25,
  },

};
