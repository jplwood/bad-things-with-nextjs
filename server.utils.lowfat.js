const fetch = require("isomorphic-unfetch");
const cheerio = require("cheerio");

// const lowfatUrl = "https://www.eftours.com/";
const lowfatUrl = "http://etus.tourslocal.com/";

async function parseLowfatGoodiesCurdsAndWhey(tourCode) {
  const res = await fetch(`${lowfatUrl}/${tourCode}`);
  let html = await res.text();

  const $ = cheerio.load(html);

  return {
    tourHeader: `
            ${$.html("header.page-header ~ style")}
            ${$.html("header.page-header")}
        `,
    itinerary: $.html("#itinerary"),
    mainStyle: `
            ${$.html('link[href*="/bundles/css/base"]')}
        `,
    scriptBundles: `
            ${$.html('script[src*="/bundles/require"]')}
            ${$.html('script[src*="/bundles/modernizr"]')}
            ${$.html('script[src*="/bundles/rq-app"]')}
        `,
    panelizrScripts: `
            ${$.html('script[src*="/core/modules/panelizr"]')}
        `,
    gtmScript: $.html("head > title + script")
  };

}


module.exports = parseLowfatGoodiesCurdsAndWhey; // memoize this bish at some point!


