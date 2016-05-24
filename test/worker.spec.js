var expect    = require("chai").expect;
var request    = require('request')
var sinon     = require('sinon');
//var worker = require("../src/worker");

var proxyquire   = require('proxyquire');
var MockFirebase = require('mockfirebase').MockFirebase;
var mock;
// load worker with firebase references mocked. 
var worker = proxyquire("../src/worker", {
  firebase: function (url) {
    return (mock = new MockFirebase(url));
  }
});
//mock.flush();
// data is logged


describe("Worker", function() {
    it("says hello", function() {
        expect(1+1).to.equal(2);
        expect(worker.say_hello("Chris")).to.equal("Hello Chris");
        expect(worker.say_hello("Tom")).to.equal("Hello Tom"); 
    });
    it("says goodbye", function() {
        expect(worker.say_goodbye("Chris")).to.equal("Goodbye Chris");
        expect(worker.say_goodbye("Tom")).to.equal("Goodbye Tom"); 
    });
    it("gets service url", function() {
        expect(worker.get_service_url("codeCombat", "chris")).to.equal("http://codecombat.com/db/user/chris/level.sessions?project=state.complete,levelID,levelName");
        expect(worker.get_service_url("codeSchool", "chris")).to.equal("https://www.codeschool.com/users/chris.json");
        expect(worker.get_service_url("freeCodeCamp","chris")).to.equal("https://www.freecodecamp.com/chris");
        expect(worker.get_service_url("BAD", "chris")).to.equal("");
    });
    it("processes service responses", function() {
        expect(worker.get_achievements_from_response("freeCodeCamp", ">[ 9 ]<")).to.equal('9');
        expect(worker.get_achievements_from_response("freeCodeCamp", ">[ 400 ]<")).to.equal('400');
        expect(worker.get_achievements_from_response("codeCombat", "[]")).to.equal(0);
        expect(worker.get_achievements_from_response("codeCombat", '[{"state":{"complete":true}}]')).to.equal(1);
        expect(worker.get_achievements_from_response("codeSchool", '{"badges":[]}')).to.equal(0);
    });
    
    it("update achievements", function() {
        var location = "classMentors/userAchievements/chris/services/codeCombat";
        //update_achievements_and_clear_queue(location, theData, data, reject, resolve);
        worker.update_achievements_and_clear_queue(location, {}, {}, function (data){}, function (data){});

    });
    
     it("fetch service responses", function() {
        //fetch_service_url(theUrl, data,service, reject, resolve)
        //mock request before running this. 
        //worker.fetch_service_url("http://home.com", {},"codeCombat", function (data){}, function (data){});  
    });
    
});

describe('Service requests', function(){
  before(function(done){
    sinon
      .stub(request, 'get')
      .yields(null, null, JSON.stringify({"foo": "bar"}));
    done();
  });

  /*
  after(function(done){
    request.get.restore();
    done();
  });
  */

  it('can get service profile', function(done){
    worker.fetch_service_url("http://TESTURL.COM", {},"codeCombat", function (data){}, function (data){});
    // callback for the get request is never being called. 
    // How do you properly include the done(): after the test has completed? 
    done();
   
  });
});