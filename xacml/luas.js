/*Copyright (c), Fan Zhang
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of WIT nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/
"use strict";
const fs = require("fs");
const FilePolicyModule = require('./finderImpl/filePolicyModule');
const PolicyFinder = require('./finder/policyFinder');
const SelectorModule = require('./finderImpl/selectorModule');
const CurrentEnvModule = require('./finderImpl/currentEnvModule');
const AttributeFinder = require('./finder/attributeFinder');
const RequestCtxFactory = require('./ctx/requestCtxFactory');
const PDP = require('./pdp');
const PDPConfig = require('./config');
const Result = require('./ctx/result');

function Luas(policyFiles) {
  const attributeModules = [];
  const filePolicyModuleIns = new FilePolicyModule();

  policyFiles.forEach(policyFile => {
    filePolicyModuleIns.addPolicy(policyFile);
  });


  const policyFinderIns = new PolicyFinder();
  policyFinderIns.setModules([filePolicyModuleIns]);

  const envAttributeModule = new CurrentEnvModule();
  const selectorAttributeModule = new SelectorModule();

  const attributeFinder = new AttributeFinder();

  attributeModules.push(envAttributeModule);
  attributeModules.push(selectorAttributeModule);
  attributeFinder.setModules(attributeModules);

  const pdpConfig = new PDPConfig(attributeFinder, policyFinderIns, null, false);
  this.pdp = new PDP(pdpConfig);
}

Luas.prototype.getPDPInstance = async function (policyFiles) {
  try {
    const luas = new Luas(policyFiles)
    await luas.pdp.init();
    return luas;
  } catch (err) {
    console.trace(err);
  }
};

Luas.prototype.evaluate = async function (requestFile) {
  try {
    const contents = await readFileToStream(requestFile);
    const decision = this.evaluateCallBack(contents);
    return decision;
  } catch (err) {
    console.trace(err);
  }
};

Luas.prototype.evaluates = function (request) {
  try {
    const decision = this.evaluateCallBack(request);
    return decision;
  } catch (err) {
    console.trace(err);
  }
};

Luas.prototype.evaluateCallBack = function (requestFile) {
  const request = RequestCtxFactory.prototype.getFactory().getRequestCtxWithRequest(requestFile);
  const responseCtx = this.pdp.evaluate(request).getResults()[0];
  return {
    obligations: JSON.stringify(responseCtx.obligations),
    attributes: JSON.stringify(responseCtx.attributes),
    decision: parseRes(responseCtx.getDecision()),
    message: responseCtx.status.message
  };
}


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

const parseRes = response => {
  let decision = null;
  switch (response) {
    case Result.prototype.DECISION_PERMIT:
      decision = "Permit";
      break;
    case Result.prototype.DECISION_DENY:
      decision = "Deny";
      break;
    case Result.prototype.DECISION_INDETERMINATE:
      decision = "Indenterminate";
      break;
    case Result.prototype.DECISION_NOT_APPLICABLE:
      decision = "NotApplicable";
      break;
    case Result.prototype.DECISION_INDETERMINATE_DENY:
      decision = "Indenterminate";
      break;
    case Result.prototype.DECISION_INDETERMINATE_PERMIT:
      decision = "Indenterminate";
      break;
    case Result.prototype.DECISION_INDETERMINATE_DENY_OR_PERMIT:
      decision = "Indenterminate";
      break;
  }
  return decision;
};

module.exports = Luas;
