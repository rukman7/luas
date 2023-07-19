const PDP = require('./xacml/luas');
let njsPDP = null;
const PolicyFilter = require('./xacml/policyFilter');

module.exports = {
  loadPolicy: async (policyFiles, enableFilter = true) => {
    if (!Array.isArray(policyFiles)) {
      throw new Error("Policy file should be in an array")
    }

    if (enableFilter) PolicyFilter.getInstance(true);
    njsPDP = await PDP.prototype.getPDPInstance(policyFiles);
  },

  getDecision: async (request) => {
    if (!njsPDP) {
      throw new Error("Policy file has been loaded")
    }
    const decision = await njsPDP.evaluates(request)
    return decision
  }
}
