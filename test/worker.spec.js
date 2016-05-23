var expect    = require("chai").expect;
var worker = require("../src/worker");

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
});