const request = require("request-promise-native");
const cheerio = require("cheerio");
const fs = require("fs");
const axios = require('axios');

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

async function immowelt(url) {
  const res = await axios.get(url);
  let $ = cheerio.load(res.data);

  let ads = $("div#listItemWrapperFixed > div.listitem_wrap").map((_i, e) => {
    const id = $(e).attr("data-oid");
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://immowelt.de/expose/${id}`,
    };
  });
  return Array.from(ads);
}

async function immoscout24(url) {
  const res = await axios.get(url);
  let $ = cheerio.load(res.data);

  const listingSelector = "ul#resultListItems > li.result-list__listing";

  let ads = $(listingSelector).map((_i, e) => {
    const id = $(e).attr("data-id");
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://www.immobilienscout24.de/expose/${id}`,
    };
  });
  return Array.from(ads);
}

async function immonet(url) {
  const res = await axios.get(url);
  let $ = cheerio.load(res.data);

  const listingSelector =
    "div#result-list-stage > div.place-over-understitial > div > div.item";

  let ads = $(listingSelector).map((_i, e) => {
    const id = $(e).attr("id").split("_")[1];
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://www.immonet.de/angebot/${id}`,
    };
  });
  return Array.from(ads);
}

async function immobilio(url) {
  const res = await axios.get(url);
  let $ = cheerio.load(res.data);

  const listingSelector = "div.item-list > div.item-wrap";

  let ads = $(listingSelector).map((_i, e) => {
    const id = $(e).attr("id").split("-")[1];
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://www.immobilo.de/immobilien/${id}`,
    };
  });
  return Array.from(ads);
}

async function ebaykleinanzeigen(url) {
  const res = await axios.get(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36",
      cookie:
        "ekcmpSeen=true; ekConsentData=BOyKxp_OyKxp_B9ChBDECh-AAAAp57v______9______9uz_Ov_v_f__33e8__9v_l_7_-___u_-3zd4u_1vf99yfm1-7etr3tp_87ues2_Xur__79__3z3_9phP78k89r7337Ew-v83oA; ekConsentBucket=full; ekCustomConsentData=42%2C43; overlayV21=seen; JSESSIONID=39C9BBBE5BF1F54ECF755A3E20BBC22B-mc4.koeb47-25_i01_1001; GCLB=CLnOt7DTw_bo9QE; rbzid=564e3u6TCYDyrCaPbnCyIxWp7an6iLVTPTGI1y+TGvXPET3anCq5ZEt1rHPg1dfaroS+GlLfceZa6ioIKqITmPgrn0rKfJYSpTbAkjLL/IrdKgPqCMwDcH714EE0HwQ1CUp4Ntk9cRSnn60y974EEOEnDKI4nkb/ybl0txKOB1ljsrFyVoHdOEDzD+PeMBEMc2RdIZ+9XH4QRLn/fTIPOW5OVo8MJSG6Q73xNgWVLkC+pKWbOrOO/5EZ24Mu5RYyGIkFcfoIPc3aWlg8wxSTS5AwfRQ354NPJ6yjW2sBTGgXo7okoIE+P7CSOxYDZshx6BunoNG/G7+6MXzUz252jw==; rbzsessionid=859202a0becbb6f12ebd996d625ab349; sc=%7B%22va%22%3A%221424097672%2C-38417%2C-806103%2C-148216%2C-445103%2C-270606%22%7D; uh=%7B%22sh%22%3A%22l%3D7667%26att%3Dwohnung_mieten.qm_d%4040%2C%3Awohnung_mieten.zimmer_d%401%2C2%26c%3D203%26wohnung_mieten.qm_d%3D40%2C%26wohnung_mieten.zimmer_d%3D1%2C2%26at%3DOFFER%26map%3D700%3A%3Al%3D7667%26c%3D203%22%7D; up=%7B%22ln%22%3A%2237324093%22%2C%22ls%22%3A%22l%3D7667%26att%3Dwohnung_mieten.qm_d%4040%2C%3Awohnung_mieten.zimmer_d%401%2C2%26c%3D203%26wohnung_mieten.qm_d%3D40%2C%26wohnung_mieten.zimmer_d%3D1%2C2%26at%3DOFFER%26map%3D700%22%2C%22va%22%3A%221424059255%2C-806103%2C-148216%2C-445103%2C-270606%2C1708445%22%7D",
    },
  });
  let $ = cheerio.load(res.data);

  const listingSelector = "ul.ad-list > li.ad-listitem > article.aditem";

  let ads = $(listingSelector).map((_i, e) => {
    const id = $(e).attr("data-adid");
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://www.ebay-kleinanzeigen.de/s-anzeige/${id}`,
    };
  });
  return Array.from(ads);
}

async function wggesucht(url) {
  const res = await axios.get(url);

  let $ = cheerio.load(res.data);

  const listingSelector = "#main_column > div.offer_list_item";

  const ads = $(listingSelector).map((_i, e) => {
    const id = $(e).attr("data-id");
    const link = $(e).find("div.row > div.card_image > a").first().attr("href");
    return {
      id,
      timestamp: new Date().toLocaleString(),
      link: `https://www.wg-gesucht.de/${link}`,
    };
  });

  return Array.from(ads);
}

const services = {
  wggesucht: wggesucht,
  immoscout24: immoscout24,
  immonet: immonet,
  immowelt: immowelt,
  immobilio: immobilio,
  ebaykleinanzeigen: ebaykleinanzeigen
};

async function run(config) {
  // Debug log
  // console.debug(`Fetching for ${Object.keys(config)}`);

  const ads_per_site = await Promise.all(Object.keys(config).map(key => services[key](config[key])));

  const all_ads = ads_per_site
    .reduce((prev, current) => prev.concat(current), [])
    .map((ad) => {
      let x = {};
      x[ad.id] = ad;
      return x;
    })
    .reduce((prev, current) => Object.assign(prev, current), {});

  const notifications = Object.values(all_ads)
    .filter((ad) => !seenAds[ad.link])
    .map((ad) => {
      seenAds[ad.link] = ad;
      return ad.link;
    });

  persistAds(JSON.stringify(seenAds, null, 2));
  if (notifications.length > 0) {
    console.log(
      `Found ${notifications.length} new ads:\n\n${notifications.join("\n\n")}`
    );
  }
}

const configs = {
  1: {
    immoscout24: "https://www.immobilienscout24.de/Suche/de/bayern/wuerzburg/frauenland/wohnung-mieten?numberofrooms=1.5-2.5&price=-700.0&livingspace=37.0-&sorting=2&enteredFrom=result_list",
    immobilio: "https://www.immobilo.de/suchergebnisse?s=lowest_price_first&l=W%C3%BCrzburg&as%5B%5D=de.wuerzburg-frauenland&as%5B%5D=de.wuerzburg-mainviertel&as%5B%5D=de.wuerzburg-moenchberg&as%5B%5D=de.wuerzburg-rennweg&as%5B%5D=de.wuerzburg-rottenbauer&as%5B%5D=de.wuerzburg-sanderau&usageType=private&t=apartment%3Arental&a=de.wuerzburg&pf=&pt=700&rf=1&rt=2.5&sf=40&st=&yf=&yt=&ff=&ft=&pa=&o=&ad=&u=",
    immonet: "https://www.immonet.de/immobiliensuche/sel.do?zip=97074&fromarea=40.0&latitude=49.75979306254099&torooms=2.5&parentcat=1&suchart=2&marketingtype=2&toprice=700.0&fromrooms=1.0&radius=5&listsize=26&objecttype=1&longitude=9.991224749299306&pageoffset=1&sortby=2",
    immowelt: "https://www.immowelt.de/liste/wuerzburg-frauenland/wohnungen/mieten?lat=49.7896&lon=9.95042&sr=2&roomi=1&rooma=2.5&prima=800&wflmi=40&eqid=-3&sort=createdate%2Bdesc",
    // ebaykleinanzeigen: "https://www.ebay-kleinanzeigen.de/s-wohnung-mieten/wuerzburg/anzeige:angebote/preis::700/c203l7667+wohnung_mieten.qm_d:40,+wohnung_mieten.zimmer_d:1,2",
  },
  2: {
    immoscout24: "https://www.immobilienscout24.de/Suche/de/bayern/wuerzburg/wohnung-mieten?numberofrooms=1.0-&price=-370.0&geocodes=1276002094021,1276002094001,1276002094025,1276002094022,1276002094020,1276002094023,1276002094016,1276002094029&enteredFrom=result_list",
    immonet: "https://www.immonet.de/immobiliensuche/sel.do?&sortby=0&suchart=1&objecttype=1&marketingtype=2&parentcat=1&toprice=370&torooms=1.5&city=153145&locationname=W%C3%BCrzburg",
    immowelt: "https://www.immowelt.de/liste/wuerzburg-altstadt/wohnungen/mieten?geoid=10809663000012%2C10809663000016&rooma=1&prima=370&sort=createdate%2Bdesc",
    wggesucht: "http://www.wg-gesucht.de/wg-zimmer-und-1-zimmer-wohnungen-in-Wurzburg.141.0+1.1.0.html?offer_filter=1&city_id=141&sort_column=0&noDeact=1&categories%5B%5D=0&categories%5B%5D=1&rent_types%5B%5D=2&sMin=30"
  }
};

const configId = process.env.CONFIG;

if (!configId) {
  throw new Error("no configuration key env set");
}

Promise.resolve(run(configs[configId]));
