//IIIA001Policy.xacml3.xml   IIIA001Request.xacml3.xml  IIIA001Response.xacml3.xml

const Luas = require('../xacml/luas');
(async () => {
 //await PDP.loadPolicy(['./IIIA001Policy.xacml3.xml']) 
const luas = await Luas.prototype.getPDPInstance(['./IIIA001Policy.xacml3.xml']);
// const decision = await PDP.getDecision('./IIIA001Request.xacml3.xml') 
const decision = await luas.evaluate('./IIIA001Request.xacml3.xml');
console.log(decision) })();
