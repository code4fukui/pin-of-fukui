import { GeoCodingJP } from "https://code4fukui.github.io/fukui_eatsafe/GeoCodingJP.js"

//const ad = "福井市中央1-22-7";
const ad = "〒910-0005　福井県福井市大手2-18-1";
const res = await GeoCodingJP.decode(ad);
console.log(res);
