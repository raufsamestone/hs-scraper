const fs = require("fs");
require("dotenv").config();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const data = require(`./results/${process.env.EXPORT_FILE_NAME}.json`);

(async () => {
  puppeteer.use(StealthPlugin());
  const urls = data.map((item) => item.companyName);
  const TITLE = "CMO, Marketing VP";

  const filteredURLS = urls.filter((x) => x !== undefined); // Filter undefined values from previously dataset.

  for (let i = 0; i < filteredURLS.length; i++) {
    const COMPANY_NAME = filteredURLS[i];
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.waitForTimeout(3000);
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(
      `https://www.google.com/search?q=site%3Alinkedin.com%2Fin%2F%20AND%20%22${COMPANY_NAME}%22%20AND%20%22${TITLE}%22`
    );
    // await page.waitForNavigation({ waitUntil: "networkidle2" });
    await autoScroll(page);

    async function autoScroll(page) {
      await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
            var scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 400); //Set specify time for scroll down.
        });
      });
    }

    let queryData = await page.evaluate(() => {
      let queries = [];
      let queriesElms = document.querySelectorAll(".yuRUbf"); //yuRUbf is the Google's search UI class name of the search result. BUT DON'T TRUST IT! You may change it.
      queriesElms.forEach((queryelement) => {
        let resultJSON = {};
        try {
          resultJSON.name = queryelement.firstChild.innerText;
        } catch (exception) {}
        queries.push(resultJSON);
        console.log(queryelement, queriesElms);
      });
      return queries;
    });

    const data = JSON.stringify(queryData);
    fs.writeFile(
      `./results/${COMPANY_NAME}${[i]}.json`,
      data,
      "utf8",
      (err) => {
        if (err) {
          console.log(`Error writing file: ${err}`);
        } else {
          console.log(`${COMPANY_NAME}-${[i]} is written successfully! 🎉 `);
        }
      }
    );
    browser.close();
  }
})();
