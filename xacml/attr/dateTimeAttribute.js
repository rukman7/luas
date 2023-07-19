/*Copyright (c), Fan Zhang
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of WIT nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/
"use strict";


var DateAttribute = require('./dateAttribute');
var AttributeValue = require('./attributeValue');
var util = require("util");
var moment = require('moment');
var identifier = "http://www.w3.org/2001/XMLSchema#dateTime";
var TZ_UNSPECIFIED = -1000000;
const NANOS_PER_MILLI = 1000000;
const MILLIS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const NANOS_PER_SECOND = NANOS_PER_MILLI * MILLIS_PER_SECOND;
const MILLIS_PER_MINUTE = MILLIS_PER_SECOND * SECONDS_PER_MINUTE;
const MILLIS_PER_HOUR = MILLIS_PER_MINUTE * MINUTES_PER_HOUR;
const MILLIS_PER_DAY = MILLIS_PER_HOUR * HOURS_PER_DAY;

var date;
var timeZone;
var defaultedTimeZone;
var value;
var nanoseconds;
let simpleParser;
let zoneParser;

function DateTimeAttribute () { };
util.inherits(DateTimeAttribute, AttributeValue);

DateTimeAttribute.prototype.dateTimeAttributeInit = function () {
  this.attributeValueInit(identifierURI);
  var currDate = moment()._d;
  var currOffset = this.getDefaultTZOffset(currDate);
  this.init(currDate, 0, currOffset, currOffset);
};


DateTimeAttribute.prototype.dateTimeAttributeInit2 = function (date, nanoseconds, timeZone,
  defaultedTimeZone) {
  this.attributeValueInit(identifier);
  this.init(date, nanoseconds, timeZone, defaultedTimeZone);
};

DateTimeAttribute.prototype.identifier = identifier;

DateTimeAttribute.prototype.getInstance = function (value) {
  let dateValue;
  let nanoseconds = 0;
  let timeZone;
  let defaultedTimeZone;

  if (value.endsWith("Z")) {
    value = value.substring(0, value.length() - 1) + "+00:00";
  }
  var len = value.length;
  var hasTimeZone = ((value.charAt(len - 3) === ':') &&
    ((value.charAt(len - 6) === '-') ||
      (value.charAt(len - 6) === '+')))

  var dotIndex = value.indexOf('.');
  if (dotIndex != -1) {
    var secondsEnd = value.length();
    if (hasTimeZone) {
      secondsEnd -= 6;
    }
    var nanoString = value.substring(dotIndex + 1, secondsEnd);
    for (var i = nanoString.length - 1; i >= 0; i--) {
      var c = nanoString.charAt(i);
      if ((c < '0') || (c > '9'))
        console.log("non-ascii digit found");
    }
    while (nanoString.length < 9) {
      nanoString += "0";
    }
    if (nanoString.length > 9) {
      nanoString = nanoString.substring(0, 9);
    }
    nanoseconds = nanoString;
    value = value.substring(0, dotIndex) +
      value.substring(secondsEnd, value.length);

  }
  if (hasTimeZone) {
    len = value.length;
    var gmtValue = strictParse('YYYY-MM-DDTHH:mm:ssZ',
      value.substring(0, len - 6) + "+0000");
    value = value.substring(0, len - 3) + value.substring(len - 2, len);
    dateValue = strictParse('YYYY-MM-DDTHH:mm:ssZ', value);
    timeZone = moment(gmtValue) - moment(dateValue);
    timeZone = timeZone / 60000;
    defaultedTimeZone = timeZone;
  } else {
    dateValue = strictParse('YYYY-MM-DDTHH:mm:ssZ', value);
    timeZone = TZ_UNSPECIFIED;
    var gmtValue = strictParse('YYYY-MM-DDTHH:mm:ssZ', value + "+0000");
    defaultedTimeZone = moment(gmtValue).valueOf() - moment(dateValue).valueOf();
    defaultedTimeZone = defaultedTimeZone / 60000;
  }
  const attr = new DateTimeAttribute();
  attr.dateTimeAttributeInit2(dateValue, nanoseconds, timeZone, defaultedTimeZone)
  return attr;
};

DateTimeAttribute.prototype.getInstance2 = function (root) {
  return this.getInstance(root.childNodes()[0].text());
};

const strictParse = (parser, str) => {
  var ret = moment(str).format(parser);
  return ret;
};

DateTimeAttribute.prototype.getDefaultTZOffset = function (date) {
  var offset = moment(date).utcOffset();
  return offset;
};


DateTimeAttribute.prototype.combineNanos = function (date, nanoseconds) {
  var millis = moment(date).valueOf();
  var milliCarry = millis % MILLIS_PER_SECOND;
  if ((milliCarry == 0) && (nanoseconds > 0)
    && (nanoseconds < NANOS_PER_SECOND)) {
    return nanoseconds;
  }
  millis -= milliCarry;
  var nanoTemp = nanoseconds;
  nanoTemp += milliCarry * NANOS_PER_MILLI;
  var nanoResult = nanoTemp % NANOS_PER_SECOND;
  nanoTemp -= nanoResult;
  millis += nanoTemp / NANOS_PER_MILLI;
  date = new Date(millis);
  return nanoResult
};

DateTimeAttribute.prototype.init = function (date, nanoseconds, timeZone, defaultedTimeZone) {
  this.value = date;
  this.nanoseconds = DateTimeAttribute.prototype.combineNanos(this.value, nanoseconds);
  this.timeZone = timeZone;
  this.defaultedTimeZone = defaultedTimeZone;
};

DateTimeAttribute.prototype.getValue = function () {
  return value;
};

DateTimeAttribute.prototype.equals = function (date) {
  // compare date time here
  throw new Error()
};

DateTimeAttribute.prototype.getTimeZone = function () {
  return timeZone;
};

DateTimeAttribute.prototype.getDefaultedTimeZone = function () {
  return defaultedTimeZone;
};

module.exports = DateTimeAttribute;
