import { fetchOrLoad, HTMLParser, CSV, nextTag, prevTag, table2json, dl2json, table2csv, sleep } from "https://code4fukui.github.io/scrapeutil/scrapeutil.js";
import { getLocationByAddress } from "./getLocationByAddress.js";

const fn = "pin-of-fukui.csv";
const baseurl = "https://makef.jp/pin/focus/";

const skipsleep = true;

const list = [];
for (let i = 1;; i++) {
  const url = baseurl + (i == 1 ? "" : "page/" + i + "/");
  const html = await fetchOrLoad(url);
  const dom = HTMLParser.parse(html);
  const divs = dom.querySelectorAll("li.anim");
  console.log(url, divs.length);
  if (divs.length == 0) break;
  for (const div of divs) {
    const a = div.querySelector("a");
    list.push(a.getAttribute("href"));
  }
  if (!skipsleep) await sleep(500);
}
console.log(list);

/*
	<meta property="og:title" content="田中 佑典 - 福井のPin!" />
	<meta property="og:url" content="https://makef.jp/pin/focus/fid543/" />
	<meta property="og:site_name" content="福井のPin!" />
	<meta property="article:modified_time" content="2022-06-24T07:34:11+00:00" />
	<meta property="og:image" content="https://makef.jp/pin/wp-content/uploads/2022/03/39fec75d11d032693d3452813b71333f-scaled.jpg" />
*/

export const getMeta = (dom, prop) => {
  const metas = dom.querySelectorAll("meta");
  const m = metas.find(i => i.getAttribute("property") == prop);
  if (!m) return null;
  return m.getAttribute("content");
};

/*
			<table class="information_table">
								<tr>
					<th><h3>会いに行ける場所</h3></th>
					<td><p>小安文青街</p>
</td>
				</tr>
								<tr>
					<th><h3>SNS</h3></th>
					<td><p><a href="http://tanaka-asia.com/">WEBSITE →</a>　<a href="https://www.facebook.com/tanakaangel.asia">Facebook →</a>　<a href="https://www.instagram.com/tanaka_asia/">Instagram →</a></p>
</td>
				</tr>
							</table>

*/

const items = [];

for (const url of list) {
  const html = await fetchOrLoad(url);
  const dom = HTMLParser.parse(html);
  const o = {};
  const metas = dom.querySelectorAll("meta");
  o.url = getMeta(dom, "og:url");
  o.title = getMeta(dom, "og:title");
  o.name = o.title.substring(0, o.title.indexOf(" - "));
  o.modified = getMeta(dom, "article:modified_time");
  o.image = getMeta(dom, "og:image");

  const tbl = dom.querySelector("table.information_table");
  const csv = table2csv(tbl);
  //console.log(csv);
  for (const info of csv) {
    const name = info[0].trim();
    const val = info[1].trim();
    o[name] = val;
  }
  /*
  const place0 = csv.find(i => i[0] == "会いに行ける場所");
  o.place = place0 ? place0[1].trim() : null;
  */

  const links = tbl.querySelectorAll("a");
  for (const link of links) {
    const name0 = link.text.trim();
    const name = name0.endsWith(" →") ? name0.substring(0, name0.length - " →".length) : name0;
    const url = link.getAttribute("href");
    o[name] = url;
  }

  const content = dom.querySelector("div.contents").text.trim();
  const n = content.indexOf("。");
  o.lead = n >= 0 ? content.substring(0, n + 1) : content;

  const addr = o.住所;
  if (addr) {
    const res = await getLocationByAddress(addr);
    if (res) {
      o.lat = res.lat;
      o.lng = res.lng;
    }
  }

  console.log(o);
  items.push(o);
  if (!skipsleep) await sleep(500);
}
await Deno.writeTextFile(fn, CSV.stringify(items));
