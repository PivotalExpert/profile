var chai = require('chai'),
  expect = chai.expect,
  targaryen = require('targaryen');

var export_data = require('./verifier-export'); //with path
  
var rules = require('./../frontend/config/security-rules.json'); //with path


chai.use(targaryen.chai);

describe('With current security rules', function () {

    before(function () {
        targaryen.setFirebaseData(export_data);
        targaryen.setFirebaseRules(rules);

    });

    describe('Unauthorized users', function () {
        it('can read classMentors/userAchievements', function () {
            expect(targaryen.users.unauthenticated)
                .can.read.path("classMentors/userAchievements");
        });
        it('can read classMentors/userProfiles', function () {
            expect(targaryen.users.unauthenticated)
                .can.read.path("classMentors/userProfiles");
        });
        it('can not read logs', function () {
            expect(targaryen.users.unauthenticated)
                .cannot.read.path("logs");
        });
        it('can read queue/tasks', function () {
            expect(targaryen.users.unauthenticated)
                .can.read.path("queue/tasks");
        });
        it('can not read auth', function () {
            expect(targaryen.users.unauthenticated)
                .cannot.read.path("auth");
        });
                
        it('can write logs', function () {
            expect(targaryen.users.unauthenticated)
                .can.write.path("logs");
        });
             
        var goodTask = {'service':'s1','id':'chris'};
        it('can write to queue/tasks', function () {
            expect(targaryen.users.unauthenticated)
                .can.write(goodTask).path("queue/tasks");
        });
        
        //Only allow queue workers to read from queue once custom tokens are in place. 
        //Add initial user account creation rules. 
        //if first login, add initial data
        //allow creation of publicId
        //don't allow create of publicId if it exists already.
    });

    describe('Authorized users', function () {
       var anyUser = { uid: 'github:1234' };
       
       it('can read logs', function () {
          expect(anyUser).can.read.path("logs"); 
        });         
    }); 
    
    describe('Specific users', function () {
       var theUser = { uid: 'github:1234' };
       
       it('cannot read auth/users', function () {
          expect(theUser).cannot.read.path("auth/users"); 
        });
       it('can read their auth/users/$auth.uid', function () {
          expect(theUser).can.read.path("auth/users/github:1234"); 
        });
        it("cannot read another users' auth/users/$auth.uid", function () {
          expect(theUser).cannot.read.path("auth/users/github:5678"); 
        });
        
        var data = {'id':'123', 'fullName':'Chris', 'displayName':'Chris', 'email':'chris@home.com', 'gravatar':'http:\\home.com', 'createdAt':12345678}
        it('can write their auth/users/$auth.uid', function () {
          expect(theUser).can.write(data).path("auth/users/github:1234"); 
        });
        it("cannot write another users' auth/users/$auth.uid", function () {
          expect(theUser).cannot.write(data).path("auth/users/github:5678"); 
        });
        
        it("cannot write another users' classMentors/userProfiles/$publicId", function () {
          expect(theUser).cannot.write(data).path("classMentors/userProfiles/chris"); 
        });
        
        var chrisUser = {uid: "github:116418"}; //chris
        it("cannot write another users' classMentors/userProfiles/$publicId", function () {
          expect(chrisUser).can.write(data).path("classMentors/userProfiles/chris"); 
        });
                 
    }); 
    
   describe('Custom auth', function () {
        // TODO: Secure workers with API key in the future. 
         
       var customAuth = {uid: 'queue-worker' };
       var data = {};
       it("can write to classMentors/userProfiles", function () {
          expect(customAuth).can.write(data).path("classMentors/userProfiles"); 
       });
        
    });      

});