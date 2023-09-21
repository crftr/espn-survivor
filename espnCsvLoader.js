const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const DIRECTORY_PATH = "./espnStats";

/**
 * Load the latest CSV file from the specified directory and return its contents as an object.
 * @param {string} [specificDate] - An optional date string in the format 'YYYY-MM-DD'.
 * @returns {Object} The contents of the latest CSV file as an object.
 */
async function espnCsvLoader(specificDate) {
  try {
    //
    // ----- Find the appropriate CSV file -----
    //

    // Read the directory to get all files
    const files = fs.readdirSync(DIRECTORY_PATH);

    // Filter out only CSV files
    let csvFiles = files.filter((file) => path.extname(file) === ".csv");

    // If a specific date is provided, filter files by that date
    if (specificDate) {
      csvFiles = csvFiles.filter((file) => file.includes(specificDate));
    }

    // Sort the files by their timestamps in descending order
    csvFiles.sort((a, b) => {
      // Extract timestamps from filenames
      const timestampA = a
        .split("_")
        .pop()
        .replace(".csv", "")
        .replace(/-/g, ":");
      const timestampB = b
        .split("_")
        .pop()
        .replace(".csv", "")
        .replace(/-/g, ":");

      return new Date(timestampB) - new Date(timestampA);
    });

    // No CSV found that matches the criteria
    if (csvFiles.length === 0) {
      return {
        success: false,
        status: `No CSV found for ${specificDate || "the latest date"}. `,
      };
    }

    //
    // ----- Parse the CSV file into an array of records -----
    //

    const records = [];

    // Read the contents of the CSV file
    const parser = fs
      .createReadStream(path.join(DIRECTORY_PATH, csvFiles[0]))
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
        })
      );

    for await (const record of parser) {
      const weekKey = record["Week"];

      // If the week doesn't exist in records, initialize it with an empty array
      if (!records[weekKey]) {
        records[weekKey] = [];
      }
      records[weekKey].push(record);
    }

    return {
      success: true,
      status: `Loaded the latest CSV for ${
        specificDate || "the latest date"
      } successfully.`,
      data: records,
    };
  } catch (error) {
    console.error("Error loading the latest CSV:", error.message);
    return {
      success: false,
      status: `Error loading the latest CSV: ${error.message}`,
    };
  }
}

// (async () => {
//   const data = await espnCsvLoader();
//   console.log(data.data);
// })();

module.exports = espnCsvLoader;
