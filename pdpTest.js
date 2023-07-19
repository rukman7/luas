const { promisify } = require('util');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const SimplePDP = require("./xacml/pdpImpl");
const dbUtil = require('./utils/database');
const arrayUtil = require('./utils/arrayUtil');

// const policyFilePath = process.argv[2];
// const requestDir = process.argv[3];
// const rep = process.argv[4];

const policyFiles = ['./sample_data/iiot/policies/collection.service.xml'];


const njsPDP = new SimplePDP(policyFiles);


(async () => {
  // try {
  //   const files = await readdir(requestDir);
  //   if (files.indexOf('.DS_Store') > -1) {
  //     files.splice(files.indexOf('.DS_Store'), 1);
  //   }
  //   let t = process.hrtime();
  //   await njsPDP.config();
  //   t = process.hrtime(t);
  //   njsPDP.otherTime = t;
  //   njsPDP.rep = +rep;
  //   njsPDP.memoryUsage = process.memoryUsage().rss;

  //   const fileLength = files.length;
  //   let indexArr = Array.from(new Array(fileLength),(val,index)=>index);
  //   if (njsPDP.rep !== 0) {
  //     indexArr = arrayUtil.prototype.shuffle(indexArr);
  //   }
  //   for (let j = 0; j < fileLength; j++) {
  //     const file = files[indexArr[j]];
  //     await njsPDP.evaluate(
  //       `${requestDir}/${file}`
  //     );
  //   }
  //   recordData(njsPDP);
  // } catch (e) {
  //   console.log('e', e);
  // }

  try {
    await njsPDP.config();
    let decision = await njsPDP.evaluate(
      `./sample_data/iiot/requests/Request-06.xml`
    );
    console.log(decision);
  } catch (error) {
    console.error(error)
  }

})();

// const recordData = (njsPDP) => {
//   const db = dbUtil.prototype.getDb();
//   db.parseTableRecord(policyFilePath, requestDir);
//   db.recordOtherTime(njsPDP.otherTime, njsPDP.memoryUsage);
//   db.recordResponse(njsPDP.decision);
//   db.recordServiceTime(njsPDP.respRecord);
//   db.close();
// }
