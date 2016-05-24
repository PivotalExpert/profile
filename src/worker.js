var Queue = require('firebase-queue'),
    Firebase = require('firebase'),
    http = require('http'),
    request = require('request');

var say_hello = function (phrase) {
    return "Hello "+phrase;
};
var say_goodbye = function (phrase) {
    return "Goodbye "+phrase;
};

var get_service_url = function(service, serviceID){
    var theUrl = "";
    console.log("Fetching serviceID "+serviceID+" on "+service);
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

var get_achievements_from_response = function(service, body){
            var totalAchievements = 0;
            if (service == "freeCodeCamp") {
              var start = body.indexOf(">[ ");
              var stop = body.indexOf(" ]<");
              totalAchievements = body.substring(start + 3, stop);
            }
            else if (service == "codeCombat") {

              var jsonObject = JSON.parse(body);
              //Currently includes stat.complete.false levels
              console.log("Code Combat levels = " + jsonObject.length);
              var theCount = 0;
              for (var i = 0; i < jsonObject.length; i++) {
                if (jsonObject[i].state.complete == true) {
                  theCount += 1;
                }

              }
              console.log("Completed Code Combat levels = " + theCount);
              totalAchievements = theCount;
            }

            else if (service == "codeSchool") {
              var jsonObject = JSON.parse(body);
              var badges = jsonObject['badges'];
              console.log("Code School Badges earned " + badges.length);
              totalAchievements = badges.length;

            }

            console.log("Fetched totalAchievements " + totalAchievements); // Show the HTML for homepage.
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

var update_achievements_and_clear_queue = function (location, theData, data, reject, resolve) {
  // update the profile
  ref.child(location).set(theData, function (err) {
    if (err) {
      reject(err);
    } else {
      resolve(data);
      ref.child('profileUpdateLog').push(data); //, function (err) {if (err){ } else {}});    
    }
  });
}

var fetch_service_url = function (theUrl, data,service, reject, resolve) {
  request(theUrl, function (error, response, body) {
    console.log("requested url " + theUrl + " since the service is " + service);
    if (!error && response.statusCode == 200) {

      var totalAchievements = get_achievements_from_response(service, body);

      data.count = totalAchievements;
      var tempAuth = data.id;
      var location = "classMentors/userAchievements/" + tempAuth + "/services/" + service;
      var theData = { "totalAchievements": data.count, "id": data.id };

      update_achievements_and_clear_queue(location, theData, data, reject, resolve);
    }
    else{
      console.log("There was an error fetching "+theUrl+" status code "+response.statusCode+ " error "+error);
    }
  });
}        

// Do not run the server when loading as a module. 
if (require.main === module) {

  var queue = new Queue(queueRef, function (data, progress, resolve, reject) {
    console.log("service " + data.service + " for user " + data.id);
    var service = data.service;
    var user = data.id;

    //Fetch the userProfile from ClassMentors
    var userProfileUrl = "https://verifier.firebaseio.com/classMentors/userProfiles/" + user + ".json";
    request(userProfileUrl, function (error, response, body) {
      var jsonObject = JSON.parse(body);
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
        fetch_service_url(theUrl, data, service, reject, resolve);
      }
    });
  });

  // Export modules if we aren't running the worker so that we can test functions. 
} else {

  module.exports = {
    "say_hello": say_hello,
    "say_goodbye": say_goodbye,
    "get_service_url": get_service_url,
    "get_achievements_from_response": get_achievements_from_response,
    "update_achievements_and_clear_queue": update_achievements_and_clear_queue,
    "fetch_service_url":fetch_service_url
  }

}

