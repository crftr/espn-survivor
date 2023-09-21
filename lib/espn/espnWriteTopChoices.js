const fs = require("fs");

function writeTopChoicesToFile(topChoices, filePrefix = '') {
  // Create a timestamped filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `./picks/${filePrefix}_${timestamp}.txt`;

  // Create a formatted string of the top choices
  const outputData = topChoices.map((item, index) => {
    const gameDetails = item.combination.map((game, gameIndex) => {
      return `|${game["Week"].toString().padStart(3, " ")}|${game[ "Projected Winner" ].toString().padEnd(25, " ")}|${game["Projected Winner's Rank"]
        .toString()
        .padStart(3, " ")}| ${parseFloat(game["Projected Winner's Percentage Difference"])
        .toFixed(1)
        .padEnd(4, " ")}%|`;
    }).join('\n');

    return `
# ${index + 1}
Min: ${item.scoreTimid.toFixed(3).padStart(7, " ")}
Avg: ${item.scoreAvg.toFixed(3).padStart(7, " ")}
Sum: ${item.scoreSum.toFixed(3).padStart(7, " ")}
${gameDetails}
-----------------------------------------`;
}).join('\n');

  // Write the data to the file
  fs.writeFile(filename, outputData, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log(`Top choices written to file: ${filename}`);
    }
  });
}

module.exports = {
  writeTopChoicesToFile,
};
