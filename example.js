"use strict";
const {
  promisify
} = require('util');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const Luas = require('./xacml/luas');
const PolicyFilter = require('./xacml/policyFilter');

const policyDir =   './comformance/3/policies/';
const requestDir = './comformance/3/requests/';

const policyFile = ['./comformance/3/policies/IIIA003Policy.xacml3.xml'];
const requestFile = './comformance/3/requests/IIIA003Request.xacml3.xml';

(async () => {
  PolicyFilter.getInstance(true);
  const luas = await Luas.prototype.getPDPInstance(policyFile);

  //Single Request
  let t = process.hrtime();
  const decision = await luas.evaluate(requestFile);
  // const decision2 = await pdp.evaluate(requestFile2);
  t = process.hrtime(t);
  console.info(t[1] / 1000000)
  console.log(decision)
  // console.log(decision2)
  // Multiple Requests
  // const files = await readdir(requestDir);
  // let time = 0;
  // for (let i = 0; i < 1; i++) {
  //   for (let j = 0; j < files.length; j++) {
  //     const file = files[j];
  //     let t = process.hrtime();
  //     const decision = await luas.evaluate(`${requestDir}/${file}`);
  //     t = process.hrtime(t);
  //     time += (t[1] / 1000000);
  //     // console.info(t[1] / 1000000)
  //     // console.info('Execution time (hr): %ds %dms', t[0], t[1] / 1000000)
  //     console.log(file, decision)
  //     // console.info('Execution time (hr): %ds %dms', t[0], t[1] / 1000000)
  //   }
  // }

  // console.info(time)
})();


//comformance testing
// (async () => {
//   PolicyFilter.getInstance(true);
//   const policyFiles = await readdir(policyDir);
//   const reqFiles = await readdir(requestDir);
//   for(let i = 0; i <policyFiles.length; i++) {
//     const luas = await Luas.prototype.getPDPInstance([`${policyDir}/${policyFiles[i]}`])
//     const decision = await luas.evaluate(`${requestDir}/${reqFiles[i]}`);
//     console.log(`*******${i}*******`)
//     console.log(decision)
//   }
// })();