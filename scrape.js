const fs = require("fs");
require("dotenv").config();
const puppeteer = require("puppeteer");

(async () => {
  const targetURL = `https://getlatka.com/saas-companies`; // First target URL

  //Choose your file name which you steal 🥷.
  const fileName = process.env.EXPORT_FILE_NAME; // || If you dont use .env dont forget to change second.js file too.

  const url = targetURL; // If pagination exist --> like targetURLs[i];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`${url}`);
  // await page.waitForNavigation({ waitUntil: 'networkidle2' }); --> For timeout issues.
  await autoScroll(page);

  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 900; // Scroll distance!
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 700); //Set specify time for scroll down.
      });
    });
  }

  let queryData = await page.evaluate(() => {
    let queries = [];
    let queriesElms = document.querySelectorAll(".data-table_row__aX_dq");
    queriesElms.forEach((queryelement) => {
      let resultJSON = {};
      try {
        resultJSON.companyName =
          queryelement.querySelector(".cells_link__PfQot").innerText;
        resultJSON.companyLinkedin = queryelement.querySelector(
          '[aria-label="Company LinkedIn"]'
        ).href;
        resultJSON.companyFounderLinkedin = queryelement.querySelector(
          '[aria-label="founder-linkedin"]'
        ).href;
        resultJSON.companyCrunchbase = queryelement.querySelector(
          '[aria-label="Company Crunchbase"]'
        ).href;
      } catch (exception) {}
      queries.push(resultJSON);
    });
    return queries;
  });
  const data = JSON.stringify(queryData);

  fs.writeFile(`./results/${fileName}.json`, data, "utf8", (err) => {
    if (err) {
      console.log(`Error writing file: ${err}`);
    } else {
      console.log(`Data is stealed successfully to ${fileName}! 🎉 `);
      targetURL.length > 0 ? browser.close() : null;
    }
  });

  browser.close();
})();
