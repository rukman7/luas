Luas
========================================

This is a Node.JS version PDP which accepts XACML request and generates XACML response


# Installation
```
npm install
```

# Using

- `Standard Usage`:
You can take a look at pdpImpl.js which is in xacml folder.

You can add your own attribute by inheriting from AttributeValue

- `Response Format`:
Response format is in JSON and the payload includes two objects.
raw: provides more details about the response
decision: this is a string to indicate if the request is Permit/Deny/Indenterminate/NotApplicable


## Example
const PDP = require('luas');

(async () => {
    await PDP.loadPolicy(['./policy.xml'])
    const decision = await PDP.getDecision('./request.xml')
    console.log(decision)
})();
```