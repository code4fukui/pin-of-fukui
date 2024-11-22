import { GeoCodingJP } from "https://code4fukui.github.io/fukui_eatsafe/GeoCodingJP.js"
import { CSV } from "https://js.sabae.cc/CSV.js";

const fncache = "temp/geocodingjp_cache.csv";
const list = await CSV.fetchJSON(fncache, []);

// max delay 10sec
export const getLocationByAddress = async (addr) => {
  const res = list.find(i => i.addr == addr);
  if (res) return res;
  const res2 = await GeoCodingJP.decode(addr);
  res2.addr = addr;
  list.push(res2);
  await Deno.writeTextFile(fncache, CSV.stringify(list));
  return res2;
};
