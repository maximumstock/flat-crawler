const request = require("request-promise-native");
const cheerio = require("cheerio");
const fs = require("fs");

const getDatabase = (path = "./db.json") => {
  const doesExist = fs.existsSync(path);
  if (doesExist) {
    return require(path);
  } else {
    fs.writeFileSync(path, JSON.stringify({}));
    return {};
  }
};

const dbPath = "./db.json";
let seenAds = getDatabase(dbPath);
const persistAds = (data) => fs.writeFileSync(dbPath, data);

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

async function immonet() {
  const url =
    "https://www.immonet.de/immobiliensuche/sel.do?zip=97074&fromarea=40.0&latitude=49.75979306254099&torooms=2.0&parentcat=1&suchart=2&marketingtype=2&toprice=700.0&fromrooms=1.0&radius=5&listsize=26&objecttype=1&longitude=9.991224749299306&pageoffset=1&sortby=2";
  const html = await request.get(url);
  let $ = cheerio.load(html);

  const listingSelector =
    "div#result-list-stage > div.place-over-understitial > div > div.item";

  let ads = $(listingSelector).map((idx, e) => {
    const id = $(e).attr("id").split("_")[1];
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://www.immonet.de/angebot/${id}`,
    };
  });
  return Array.from(ads);
}

async function immobilio() {
  const url =
    "https://www.immobilo.de/suchergebnisse?s=lowest_price_first&l=W%C3%BCrzburg&as%5B%5D=de.wuerzburg-frauenland&as%5B%5D=de.wuerzburg-mainviertel&as%5B%5D=de.wuerzburg-moenchberg&as%5B%5D=de.wuerzburg-rennweg&as%5B%5D=de.wuerzburg-rottenbauer&as%5B%5D=de.wuerzburg-sanderau&usageType=private&t=apartment%3Arental&a=de.wuerzburg&pf=&pt=700&rf=1&rt=2&sf=40&st=&yf=&yt=&ff=&ft=&pa=&o=&ad=&u=";
  const html = await request.get(url);
  let $ = cheerio.load(html);

  const listingSelector = "div.item-list > div.item-wrap";

  let ads = $(listingSelector).map((idx, e) => {
    const id = $(e).attr("id").split("-")[1];
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://www.immobilo.de/immobilien/${id}`,
    };
  });
  return Array.from(ads);
}

async function ebaykleinanzeigen() {
  const url =
    "https://www.ebay-kleinanzeigen.de/s-wohnung-mieten/wuerzburg/anzeige:angebote/preis::700/c203l7667+wohnung_mieten.qm_d:40,+wohnung_mieten.zimmer_d:1,2";
  const html = await request.get(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36",
      cookie:
        "ekcmpSeen=true; ekConsentData=BOyKxp_OyKxp_B9ChBDECh-AAAAp57v______9______9uz_Ov_v_f__33e8__9v_l_7_-___u_-3zd4u_1vf99yfm1-7etr3tp_87ues2_Xur__79__3z3_9phP78k89r7337Ew-v83oA; ekConsentBucket=full; ekCustomConsentData=42%2C43; overlayV21=seen; JSESSIONID=39C9BBBE5BF1F54ECF755A3E20BBC22B-mc4.koeb47-25_i01_1001; GCLB=CLnOt7DTw_bo9QE; rbzid=564e3u6TCYDyrCaPbnCyIxWp7an6iLVTPTGI1y+TGvXPET3anCq5ZEt1rHPg1dfaroS+GlLfceZa6ioIKqITmPgrn0rKfJYSpTbAkjLL/IrdKgPqCMwDcH714EE0HwQ1CUp4Ntk9cRSnn60y974EEOEnDKI4nkb/ybl0txKOB1ljsrFyVoHdOEDzD+PeMBEMc2RdIZ+9XH4QRLn/fTIPOW5OVo8MJSG6Q73xNgWVLkC+pKWbOrOO/5EZ24Mu5RYyGIkFcfoIPc3aWlg8wxSTS5AwfRQ354NPJ6yjW2sBTGgXo7okoIE+P7CSOxYDZshx6BunoNG/G7+6MXzUz252jw==; rbzsessionid=859202a0becbb6f12ebd996d625ab349; sc=%7B%22va%22%3A%221424097672%2C-38417%2C-806103%2C-148216%2C-445103%2C-270606%22%7D; uh=%7B%22sh%22%3A%22l%3D7667%26att%3Dwohnung_mieten.qm_d%4040%2C%3Awohnung_mieten.zimmer_d%401%2C2%26c%3D203%26wohnung_mieten.qm_d%3D40%2C%26wohnung_mieten.zimmer_d%3D1%2C2%26at%3DOFFER%26map%3D700%3A%3Al%3D7667%26c%3D203%22%7D; up=%7B%22ln%22%3A%2237324093%22%2C%22ls%22%3A%22l%3D7667%26att%3Dwohnung_mieten.qm_d%4040%2C%3Awohnung_mieten.zimmer_d%401%2C2%26c%3D203%26wohnung_mieten.qm_d%3D40%2C%26wohnung_mieten.zimmer_d%3D1%2C2%26at%3DOFFER%26map%3D700%22%2C%22va%22%3A%221424059255%2C-806103%2C-148216%2C-445103%2C-270606%2C1708445%22%7D",
    },
  });
  console.log(html);
  let $ = cheerio.load(html);

  const listingSelector = "ul.ad-list > li.ad-listitem > article.aditem";

  let ads = $(listingSelector).map((idx, e) => {
    const id = $(e).attr("data-adid");
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://www.ebay-kleinanzeigen.de/s-anzeige/${id}`,
    };
  });
  return Array.from(ads);
}

async function run() {
  const ads_per_site = [
    await immoscout24(),
    await immowelt(),
    await immonet(),
    await immobilio(),
    await ebaykleinanzeigen(),
  ];
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
    console.log(
      `Found ${notifications.length} new ads:\n${notifications.join("\n\n")}`
    );
  }
}

Promise.resolve(run());
