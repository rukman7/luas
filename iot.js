"use strict";
const {
  promisify
} = require('util');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const Luas = require('./xacml/luas');
const PolicyFilter = require('./xacml/policyFilter');

const policyDir =   './sample_data/policies/iot.xml';
const requestDir = './sample_data/requests/';


const readFileToStream = (fileName) => {
  return new Promise((resolve, reject) => {
    const file = fs.createReadStream(fileName, 'utf8');
    let data = "";
    file.on('data', function (chunk) {
      data += chunk;
    })
    file.on("end", () => {
      resolve(data);
      file.destroy()
    });
    file.on("error", reject);
  });
};

(async () => {
  PolicyFilter.getInstance(true);
  const luas = await Luas.prototype.getPDPInstance([policyDir]);

  // Multiple Requests
  const files = await readdir(requestDir);
  let time = 0;
  for (let i = 0; i < 500; i++) {
    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      let t = process.hrtime();
      const fileData = await readFileToStream(`${requestDir}/${file}`)
      const decision = await luas.evaluates(fileData);
      t = process.hrtime(t);
      time += (t[1] / 1000000);
      // console.info(t[1] / 1000000)
      // console.info('Execution time (hr): %ds %dms', t[0], t[1] / 1000000)
      console.log(file, decision)
      // console.info('Execution time (hr): %ds %dms', t[0], t[1] / 1000000)
    }
  }

  console.info(time)
})();
