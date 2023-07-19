const ASSEMBLY_LINES = [...Array(20)].map((n, index) => {
  const al = `factory/assembly-line-${index + 1}`;
  const obj = {};
  return (obj[al] = [...Array(10)].map((n, index) => {
    return `${al}/z${index + 1}`;
  }));
});

const ipGen = (exclude) => {
  const ip = Math.floor(Math.random() * 255);
  if (ip === exclude) ipGen(exclude);
  return ip;
};

const getSecuredIPs = (assembly, z) => {
  return `192.168.2${assembly}.${Math.floor(Math.random() * 99) + z}`;
};
const getAttackerIPs = () => {
  return `8${Math.floor(Math.random() * 5)}.153.121.${Math.floor(Math.random() * 10)}`;
};

const subjects = [
  "temperature_sensor",
  "humidity_sensor",
  "motion_sensor",
  "passive_infrared_sensor",
  "pneumatic_actuator",
  "hydraulic_actuator",
  "thermal_actuator",
  "proximity_sensor",
  "electric_actuator",
  "light_sensor",
  "controller",
];

const device_model = {
  temperature_sensor: "XS550",
  humidity_sensor: "TLW190",
  motion_sensor: "RTS10",
  passive_infrared_sensor: "AMN34111",
  pneumatic_actuator: "CP96SED",
  hydraulic_actuator: "ADNGF989",
  thermal_actuator: "AXT2",
  proximity_sensor: "MA40S4",
  electric_actuator: "CPE-10",
  light_sensor: "RE200B",
  controller: "CTR101",
};

const getNormalActions = (sensorType) => {
  return {
    sensor: {
      PUB: {
        "/reading": "send-reading",
        "/battery-level": "send-battery-level",
        "/sys-info": "get-sys-info",
      },
      SUB: {
        "/configuration": "get-configuration",
        "/action": "get-action",
      },
    },
    actuator: {
      SUB: {
        "/configuration": "get-configuration",
        "/action": "get-action",
        "/reading": "get-reading",
      },
      PUB: {
        "/sys-info": "send-sys-info",
        "/operation-status": "in-operate",
      },
    },
    controller: {
      SUB: {
        "/reading": "get-reading",
        "/battery-level": "send-battery-level",
        "/sys-info": "get-sys-info",
        "/operation-status": "get-operation-status",
      },
      PUB: {
        "/configuration": "configure",
        "/action": {
          sensor: ["switch-on", "switch-off", "pause"],
          actuator: ["switch-on", "switch-off", "operate", "maintain", "pause"],
        },
      },
    },
  }[sensorType];
};

const getAttackActions = (sensorType) => {
  return {
    sensor: {
      PUB: {
        "/reading": "send-reading",
        "/battery-level": "send-battery-level",
        "/sys-info": "get-sys-info",
      },
      SUB: {
        "/configuration": "get-configuration",
        "/action": "get-action",
      },
    },
    actuator: {
      SUB: {
        "/configuration": "get-configuration",
        "/action": "get-action",
        "/reading": "get-reading",
      },
      PUB: {
        "/sys-info": "send-sys-info",
        "/operation-status": "in-operate",
      },
    },
    controller: {
      PUB: {
        "/configuration": "miss-configure",
        "/action": {
          sensor: ["terminate", "disconnect"],
          actuator: ["terminate", "disconnect"],
        },
      },
    },
  }[sensorType];
};

const mqtt_topics = {
  sensor: {
    PUB: ["/reading", "/battery-level", "/sys-info"],
    SUB: ["/configuration", "/action"],
  },
  actuator: {
    PUB: ["/sys-info", "/operation-status"],
    SUB: ["/configuration", "/action", "/reading"],
  },
};

const getUUID = () => {
  return "xx-4xxx-yxxx-xx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getAttackUUID = () => {
  return "xy-7xxx-xxxx-xx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getAttackDeviceModel = () => {
  return "xyxy".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
};

function randomDate() {
  var date = new Date();
  const currMonth =  date.getMonth()
  date.setMonth(currMonth-1)
  date.setDate(+1 + Math.random() * 30)
  var hour = Math.random() * 8 + 11;
  var minute = Math.random() * 1 + 45;
  date.setHours(hour);
  date.setMinutes(minute)
  return date.toISOString();
}

function randomAttackDate() {
  var date = new Date();
  const currMonth =  date.getMonth()
  date.setMonth(currMonth-1)
  date.setDate(+3 + Math.random() * 15)
  var hour = Math.random() * 12 + 21;
  var minute = Math.random() * 0 + 50;
  date.setHours(hour);
  date.setMinutes(minute)
  return date.toISOString();
}


const features = [
  "mqtt_broker_id",
  "mqtt_cmd",
  "mqtt_topic",
  "device_id",
  "device_ip_address",
  "device_type",
  "device_msg",
  "device_model",
  "access_timestamp",
  "environment_location",
  "status",
];

const brokerIDs = [];
let allLogs = [];

ASSEMBLY_LINES.forEach((al, aIndex) => {
  const brokerIdAL = [];
  al.forEach((z, zIndex) => {
    const brokerID = getUUID();
    brokerIdAL.push(brokerID);
    const controllerID = getUUID();
    for (let i = 0; i < 20; i++) {
      subjects.forEach((s) => {
        if (s.includes("sensor")) {
          mqtt_topics.sensor.PUB.forEach((topic, post) => {
            allLogs.push([
              brokerID,
              "PUB",
              `${s}${topic}`,
              getUUID(),
              getSecuredIPs(aIndex, zIndex),
              s,
              getNormalActions("sensor").PUB[topic],
              device_model[s],
              randomDate(),
              z,
              "normal",
            ]);
            allLogs.push([
              brokerID,
              "SUB",
              `${s}${topic}`,
              controllerID,
              getSecuredIPs(aIndex, zIndex),
              "controller",
              getNormalActions("controller").SUB[topic],
              device_model["controller"],
              randomDate(),
              z,
              "normal",
            ]);
          });
          mqtt_topics.sensor.SUB.forEach((topic) => {
            allLogs.push([
              brokerID,
              "SUB",
              `${s}${topic}`,
              getUUID(),
              getSecuredIPs(aIndex, zIndex),
              s,
              getNormalActions("sensor").SUB[topic],
              device_model[s],
              randomDate(),
              z,
              "normal",
            ]);

            if (topic === "/action") {
              getNormalActions("controller").PUB[topic].sensor.forEach((a, post) => {
                allLogs.push([
                  brokerID,
                  "PUB",
                  `${s}${topic}`,
                  getUUID(),
                  getSecuredIPs(aIndex, zIndex),
                  "controller",
                  a,
                  i%2=== 0? device_model["controller"] : `${device_model["controller"]}${post}`,
                  randomDate(),
                  z,
                  "normal",
                ]);
              });
            } else if (getNormalActions("controller").PUB[topic]) {
              allLogs.push([
                brokerID,
                "PUB",
                `${s}${topic}`,
                controllerID,
                getSecuredIPs(aIndex, zIndex),
                "controller",
                getNormalActions("controller").PUB[topic],
                device_model["controller"],
                randomDate(),
                z,
                "normal",
              ]);
            }
          });
        } else if (s.includes("actuator")) {
          mqtt_topics.actuator.PUB.forEach((topic, post) => {
            allLogs.push([
              brokerID,
              "PUB",
              `${s}${topic}`,
              getUUID(),
              getSecuredIPs(aIndex, zIndex),
              s,
              getNormalActions("actuator").PUB[topic],
              device_model[s],
              randomDate(),
              z,
              "normal",
            ]);
            allLogs.push([
              brokerID,
              "SUB",
              `${s}${topic}`,
              controllerID,
              getSecuredIPs(aIndex, zIndex),
              "controller",
              getNormalActions("controller").SUB[topic],
              post%2=== 0? device_model["controller"] : `${device_model["controller"]}${post}`,
              randomDate(),
              z,
              "normal",
            ]);
          });
          mqtt_topics.actuator.SUB.forEach((topic) => {
            allLogs.push([
              brokerID,
              "SUB",
              `${s}${topic}`,
              getUUID(),
              getSecuredIPs(aIndex, zIndex),
              s,
              getNormalActions("actuator").SUB[topic],
              device_model[s],
              randomDate(),
              z,
              "normal",
            ]);

            if (topic === "/action") {
              getNormalActions("controller").PUB[topic].actuator.forEach(
                (a) => {
                  allLogs.push([
                    brokerID,
                    "PUB",
                    `${s}${topic}`,
                    controllerID,
                    getSecuredIPs(aIndex, zIndex),
                    "controller",
                    a,
                    device_model["controller"],
                    randomDate(),
                    z,
                    "normal",
                  ]);
                }
              );
            } else if (getNormalActions("controller").PUB[topic]) {
              allLogs.push([
                brokerID,
                "PUB",
                `${s}${topic}`,
                controllerID,
                getSecuredIPs(aIndex, zIndex),
                "controller",
                getNormalActions("controller").PUB[topic],
                device_model["controller"],
                randomDate(),
                z,
                "normal",
              ]);
            }
          });
        }
      });
    }
  });
  brokerIDs.push(brokerIdAL);
});
// allLogs = []
const act = subjects.filter((sub) => sub.includes("actuator"))
let i = 0

ASSEMBLY_LINES.forEach((al, aIndex) => {
  const brokerIdAL = brokerIDs[aIndex];
  al.forEach((z, zIndex) => {
    const brokerID = brokerIdAL[zIndex];
    subjects.forEach((s) => {
      if (s.includes("sensor")) {
        //Pretend a legit sensor form a different production zone
        mqtt_topics.sensor.PUB.forEach((topic) => {
        
          if (i > 3) {
            i = 0
          }

          allLogs.push([
            brokerID,
            "PUB",
            `${s}${topic}`,
            getUUID(),
            getSecuredIPs(aIndex, zIndex),
            act[i],
            getNormalActions("sensor").PUB[topic],
            device_model[act[i]],
            randomDate(),
            z,
            "intrusion",
          ]);
          i++
        });
        mqtt_topics.sensor.SUB.forEach((topic) => {
          //control publish topics that they do not access to
          allLogs.push([
            brokerID,
            "PUB",
            `${s}${topic}`,
            getAttackUUID(),
            getSecuredIPs(aIndex, zIndex),
            "controller",
            topic !== "/action"? getAttackActions("controller").PUB[topic] : getAttackActions("controller").PUB[topic]['sensor'][Math.round(Math.random())],
            device_model["controller"],
            randomAttackDate(),
            z,
            "intrusion",
          ]);
          if (topic === "/action") {
             //actuator pretends to be controller to send operational commands
            getNormalActions("controller").PUB[topic].sensor.forEach(
              (action) => {
                subjects
                  .filter((sub) => sub.includes("actuator"))
                  .forEach((actuator, post) => {
                    allLogs.push([
                      brokerID,
                      "PUB",
                      `${s}${topic}`,
                      getAttackUUID(),
                      getAttackerIPs(),
                      actuator,
                      action,
                      device_model[actuator],
                      randomAttackDate(),
                      z,
                      "intrusion",
                    ]);

            
                    // const d = new Date();
                    // d.setHours(9);
                    // allLogs.push([
                    //   brokerID,
                    //   "PUB",
                    //   `${s}${topic}`,
                    //   getUUID(),
                    //   getAttackerIPs(),
                    //   "controller",
                    //   action,
                    //   device_model["controller"],
                    //   d.toISOString(),
                    //   z,
                    //   "normal",
                    // ]);
                  });


              }
            );
          }
        });
      }
      // else if (s.includes("actuator")) {
      //   mqtt_topics.actuator.PUB.forEach((topic) => {

      //     allLogs.push([
      //       brokerID,
      //       "SUB",
      //       `${s}${topic}`,
      //       getAttackUUID(),
      //       getAttackerIPs(),
      //       "actuator",
      //       getNormalActions("controller").SUB[topic],
      //       getAttackDeviceModel(),
      //       new Date().toISOString(),
      //       z,
      //       "intrusion",
      //     ]);
      //   });
      //   mqtt_topics.actuator.SUB.forEach((topic) => {
      //     allLogs.push([
      //       brokerID,
      //       "SUB",
      //       `${s}${topic}`,
      //       getAttackUUID(),
      //       getAttackerIPs(),
      //       s,
      //       getNormalActions("actuator").SUB[topic],
      //       getAttackDeviceModel(),
      //       new Date().toISOString(),
      //       z,
      //       "intrusion",
      //     ]);

      //     if (topic === "/action") {
      //       getNormalActions("controller").PUB[topic].actuator.forEach((a) => {
      //         allLogs.push([
      //           brokerID,
      //           "PUB",
      //           `${s}${topic}`,
      //           getAttackUUID(),
      //           getAttackerIPs(),
      //           "actuator",
      //           a,
      //           getAttackDeviceModel(),
      //           new Date().toISOString(),
      //           z,
      //           "intrusion",
      //         ]);
      //       });
      //     } else if (getNormalActions("controller").PUB[topic]) {
      //       allLogs.push([
      //         brokerID,
      //         "PUB",
      //         `${s}${topic}`,
      //         getAttackUUID(),
      //         getAttackerIPs(),
      //         "actuator",
      //         getNormalActions("controller").PUB[topic],
      //         getAttackDeviceModel(),
      //         new Date().toISOString(),
      //         z,
      //         "intrusion",
      //       ]);
      //     }
      //   });
      // }
    });
  });
});

const shuffle = (a) => {
  // for (let i = a.length - 1; i > 0; i--) {
  //   const j = Math.floor(Math.random() * (i + 1));
  //   [a[i], a[j]] = [a[j], a[i]];
  // }
  return a;
};

const fs = require("fs");
let csvStr = `${features.join(",")}`;

for (log of shuffle(allLogs)) {
  csvStr += `
${log.join(",")}`;
}

fs.writeFile("./data.csv", csvStr, "utf-8", (err) => {
  if (err) console.log(err);
  else console.log("Data saved");
});

// console.log(csvStr);
