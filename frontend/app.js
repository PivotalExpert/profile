var app = angular.module("sampleApp", ["firebase"]);

app.controller("SampleCtrl", function ($scope, $firebaseArray,$firebaseObject, $firebaseAuth) {
  var ref = new Firebase("https://verifier.firebaseio.com");
  
  // create a synchronized array
  // click on `index.html` above to see it used in the DOM!
  $scope.logs = $firebaseArray(ref.child('logs/profileUpdates'));
  
  $scope.usersRef = ref.child('users');
  $scope.updateTasks = $firebaseArray(ref.child('queue/tasks'));
  
  var query = ref.child('logs/profileUpdates').orderByChild("updated").limitToLast(10);
  $scope.filteredLogs = $firebaseArray(query);


  
  // create an instance of the authentication service
  var auth = $firebaseAuth(ref);
  // login with github
  var usersRef = ref.child('auth').child('users');


  $scope.logout = function () {
    console.log("Logging user out.")
    ref.unauth();
    $scope.user = null;
  };

  $scope.fetchClassMentorsProfile = function (publicId) {
    console.log("Fetching publicId "+publicId);
    $scope.profile = $firebaseObject(ref.child('classMentors/userProfiles/'+publicId));

  }

  $scope.fetchAuthData = function (authId) {
    console.log("Fetching authId "+authId);
    $scope.user = $firebaseObject(ref.child('auth/users/'+authId));
    // Once auth data loads, load the user's public profile. 
    $scope.user.$loaded().then(function() {
      if($scope.user.publicId){
        $scope.fetchClassMentorsProfile($scope.user.publicId);
      } else {
        console.log("User has no publicId.");
      }
    });

  }
  
  //Check to see if user is already logged in an fetch auth data if so
  var authData = ref.getAuth();
  if (authData) {
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
    $scope.fetchAuthData(authData.uid);
  } else {
    console.log("User is logged out");
  }

  $scope.addNewUserProfile = function () {
    console.log("Adding new user profile.");
    //Do as a transaction. 
    //update auth/users/<authId>
    
    var isAvailable = $firebaseObject(ref.child('auth').child('usedPublicIds').child($scope.newProfileId));
    isAvailable.$loaded().then(function () {

      if (isAvailable.$value) {
        console.log(isAvailable.$value + "was already taken");
      } else {
        //if id has not been claimed. 

        usersRef.child($scope.user.$id).update({ 'publicId': $scope.newProfileId });

        //add reverse lookup entry.
        ref.child('auth').child('publicIds').child($scope.newProfileId).set($scope.user.$id);

        //create new userProfile public to everyone. 
        ref.child('classMentors').child('userProfiles')
          .child($scope.newProfileId)
          .child('user')
          .update({
            'diplayName': $scope.newProfileId,
            'pic': $scope.user.pic
          }, function(){
            console.log("done creating profile");
            $scope.fetchClassMentorsProfile($scope.newProfileId);
          });

        // mark as taken
        ref.child('auth').child('usedPublicIds').child($scope.newProfileId).set(true);
      }
    });
  }
  
  $scope.addFreeCodeCamp = function(){
    console.log("Adding Free Code Camp.");
     ref.child('classMentors/userProfiles').child($scope.profile.$id)
        .child('services/freeCodeCamp/details/id').set($scope.freeCodeCampUsername);
    //Put a link to profile
  }
  
  $scope.addCodeCombat = function(){
    console.log("Adding Code Combat.");
    //update Firebase
    ref.child('classMentors/userProfiles').child($scope.profile.$id)
        .child('services/codeCombat/details/id').set($scope.codeCombatUsername);
    //Put a link to profile. 
  }
  $scope.login = function () {
    console.log("Logging user in.")
    auth.$authWithOAuthPopup("github").then(function (user) {
      console.log("Logged in as:", user.uid);
      //Read current users profile. 
      //if not already a user - then add a new user record with created time. 
      //if no publicID, ask the user to add one. 
      //Put publicId in auth/users/authid record and auth/publicIds/publidID:authid
      //Ask user to add their freeCodeCamp and CodeCombat ids. 
      //Add error reporting to let users know when they have provided a bad id. 
      
      //Always update user with latest from Github. 
      usersRef.child(user.uid).update({
        username: user.github.username,
        pic: user.github.profileImageURL,
        email: user.github.email,
        displayName: user.github.displayName
      });
      
      // Fetch auth back from users to get get latest information. 
      $scope.fetchAuthData(user.uid);
     
    }).catch(function (error) {
      console.log("Authentication failed:", error);
    });
  };
  

  
  $scope.addProfileUpdateTask = function () {
    $scope.updateTasks.$add({
      id: $scope.id,
      service: $scope.service
    });
  };
  
  $scope.updateAllProfiles = function () {
    // Fetch all userProfiles as an array. 
    // Check for each service on each profile and enqueue if found. 
  };
  
  $scope.updateAllServices = function () {
    console.log("Enqueueing "+ $scope.profile.$id);
    if($scope.profile.services.codeCombat.details.id){
      $scope.updateTasks.$add({ id: $scope.profile.$id, service: "codeCombat"});
    }
    if($scope.profile.services.freeCodeCamp.details.id){
      $scope.updateTasks.$add({ id: $scope.profile.$id, service: "freeCodeCamp"});
    }
    //$scope.updateTasks.$add({ id: $scope.profile.$id, service: "codeSchool"});
  };
  
  
  $scope.getTheTime = function (timestamp) {
    return new Date(timestamp).toString();
  }

  $scope.timePassed = function (timestamp) {
    var delta = new Date() - new Date(timestamp);
    return delta / 60000;
  }


});