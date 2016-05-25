var Queue = require('firebase-queue'),
    Firebase = require('firebase'),
    http = require('http'),
    request = require('request');

var get_service_url = function (service, serviceID) {
  var theUrl = "";
  //console.log("Fetching serviceID "+serviceID+" on "+service);
  if (service == "freeCodeCamp") {
    theUrl = "https://www.freecodecamp.com/" + serviceID;
    //console.log("Using freeCodeCamp url " + theUrl);
  }
  else if (service == "codeCombat") {
    //console.log("Using codeCombat url");
    theUrl = "http://codecombat.com/db/user/" + serviceID + "/level.sessions?project=state.complete,levelID,levelName";
  }
  else if (service == "codeSchool") {
    //console.log("Using codeSchool url");
    theUrl = "https://www.codeschool.com/users/" + serviceID + ".json";
  }
  return theUrl;
}

var get_achievements_from_response = function (service, body) {
  var totalAchievements = 0;
  if (service == "freeCodeCamp") {
    var start = body.indexOf(">[ ");
    var stop = body.indexOf(" ]<");
    totalAchievements = body.substring(start + 3, stop);
  }
  else if (service == "codeCombat") {

    var jsonObject = JSON.parse(body);
    //Currently includes stat.complete.false levels
    //console.log("Code Combat levels = " + jsonObject.length);
    var theCount = 0;
    for (var i = 0; i < jsonObject.length; i++) {
      if (jsonObject[i].state.complete == true) {
        theCount += 1;
      }

    }
    //console.log("Completed Code Combat levels = " + theCount);
    totalAchievements = theCount;
  }

  else if (service == "codeSchool") {
    var jsonObject = JSON.parse(body);
    var badges = jsonObject['badges'];
    //console.log("Code School Badges earned " + badges.length);
    totalAchievements = badges.length;

  }

  //console.log("Fetched totalAchievements " + totalAchievements+ " on "+service); // Show the HTML for homepage.
  return totalAchievements;

}
var ref = new Firebase('https://verifier.firebaseio.com');
var queueRef = new Firebase('https://verifier.firebaseio.com/queue');
/*
// Uncomment to include authenticated access. 
ref.authWithCustomToken('<YOUR_TOKEN_HERE>', function(err, authData){
    if (err) {
      console.log("Login failed with error: ", error);
    } else {
      console.log("Authenticated successfully with payload: ", authData);
    }
});
*/

var update_profile_and_clear_task = function (err, data, reject, resolve) {
  if (err) {
    console.log("Error updating " + err);
    reject(err);
  } else {
    console.log("Successfully updated. Resolving task. " + JSON.stringify(data));
    resolve(data);
    data["updated"] = Firebase.ServerValue.TIMESTAMP;
    ref.child('logs/profileUpdates').push(data); //, function (err) {if (err){ } else {}});    
  }
}

var update_achievements_and_clear_queue = function (location, theData, data, reject, resolve) {
  // update the profile
  ref.child(location).set(theData, function (err) {
    update_profile_and_clear_task(err, data, reject, resolve);
  });
}

var fetch_service_url = function (theUrl, data, service, reject, resolve, error, response, body, callback) {
  //console.log("requested url " + theUrl + " since the service is " + service);
  if (!error && response.statusCode == 200) {

    var totalAchievements = get_achievements_from_response(service, body);
    data.count = totalAchievements;
    var location = "classMentors/userAchievements/" + data.id + "/services/" + service;
    var theData = { "totalAchievements": data.count, "id": data.id };

    callback(location, theData, data, reject, resolve);
  }
  else {
    console.log("There was an error fetching " + theUrl + " status code " + response.statusCode + " error " + error);
  }
}

var get_profile = function (service_response_body, task_data, reject, resolve) {
  var jsonObject = JSON.parse(service_response_body);
  var service = task_data.service;
  var services = jsonObject['services']
  //console.log(services);
  // If the user does not have the service it will be skipped. 
  if (services.hasOwnProperty(service)) {
    var serviceID = services[service]['details']['id'];

    var theUrl = get_service_url(service, serviceID);
    // Reject bad requests
    if (theUrl == "") {
      reject("Non-supported service " + service);
    }
    //Fetch the service url
    request(theUrl, function (error, response, body) {
      fetch_service_url(theUrl, task_data, service, reject, resolve, error, response, body, update_achievements_and_clear_queue);
    });

  }
}

// Called by Queue when new tasks are present. 
var process_task = function (data, progress, resolve, reject) {
  //console.log("service " + data.service + " for user " + data.id);
  var service = data.service;
  var user = data.id;

  //Fetch the userProfile from ClassMentors
  var userProfileUrl = "https://verifier.firebaseio.com/classMentors/userProfiles/" + user + ".json";
  request(userProfileUrl, function (error, response, body) {
    //TODO: handle profiel fetch error. 
    //TODO: check that response is valid. 
    //TODO: If valid, process profile. 
    get_profile(body, data, reject, resolve);

  });
}

// Do not run the server when loading as a module. 
if (require.main === module) {
  var queue = new Queue(queueRef, process_task);

  // Export modules if we aren't running the worker so that we can test functions. 
} else {

  module.exports = {
    "get_service_url": get_service_url,
    "get_achievements_from_response": get_achievements_from_response,
    "update_achievements_and_clear_queue": update_achievements_and_clear_queue,
    "fetch_service_url": fetch_service_url,
    "process_task": process_task,
    "get_profile": get_profile,
    "update_profile_and_clear_task": update_profile_and_clear_task
  }
}

