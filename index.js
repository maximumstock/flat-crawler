const request = require("request-promise-native");
const cheerio = require("cheerio");
const fs = require("fs");

let seenAds = JSON.parse(fs.readFileSync("./db.json").toString());
const persistAds = (data) => fs.writeFileSync("./db.json", data);
let newAds = {};

async function immowelt() {
  const url =
    "https://www.immowelt.de/liste/wuerzburg-frauenland/wohnungen/mieten?lat=49.7896&lon=9.95042&sr=2&roomi=1&rooma=2&prima=800&wflmi=40&eqid=-3&sort=createdate%2Bdesc";

  const html = await request.get(url);
  let $ = cheerio.load(html);

  let ads = $("div#listItemWrapperFixed > div.listitem_wrap").map((idx, e) => {
    const id = $(e).attr("data-oid");
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://immowelt.de/expose/${id}`,
    };
  });
  return Array.from(ads);
}

async function immoscout24() {
  /**
   * - Würzburg, Frauenland
   * - max. 900€ kalt
   * - sortiert nach Einstellungsdatum (`S-2`)
   * - min. 37qm
   * - ab 1,5 Zimmer
   */
  const url =
    "https://www.immobilienscout24.de/Suche/de/bayern/wuerzburg/frauenland/wohnung-mieten?numberofrooms=1.5-&price=-900.0&livingspace=37.0-&sorting=2&enteredFrom=result_list";
  const html = await request.get(url);
  let $ = cheerio.load(html);

  const listingSelector = "ul#resultListItems > li.result-list__listing";

  // 1 page of results
  let ads = $(listingSelector).map((idx, e) => {
    const id = $(e).attr("data-id");
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://www.immobilienscout24.de/expose/${id}`,
    };
  });
  return Array.from(ads);
}

async function run() {
  const ads_per_site = [await immoscout24(), await immowelt()];
  const all_ads = ads_per_site
    .reduce((prev, current) => prev.concat(current), [])
    .map((ad) => {
      let x = {};
      x[ad.id] = ad;
      return x;
    })
    .reduce((prev, current) => Object.assign(prev, current));

  const notifications = Object.values(all_ads)
    .filter((ad) => !seenAds[ad.link])
    .map((ad) => {
      seenAds[ad.link] = ad;
      return ad.link;
    });

  persistAds(JSON.stringify(seenAds, null, 2));
  if (notifications.length > 0) {
    console.log(`Found ${notifications.length} new ads`);
    console.log(notifications);
  }
}

Promise.resolve(run());