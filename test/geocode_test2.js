import { getLocationByAddress } from "../getLocationByAddress.js";

//const ad = "福井市中央1-22-7";
const ad = "〒910-0005　福井県福井市大手2-18-1";
const res = await getLocationByAddress(ad);
console.log(res);
