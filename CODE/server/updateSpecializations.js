/**
 * Created by harishreddy on 8/10/17.
 */
var filePath="/home/harishreddy/ownCloud/";
var csv = Npm.require("csvtojson");
var arrayOfchanges = [];

Meteor.methods({
    "updateQualSpecializations": function (divisionId) {
        csv().fromFile(filePath).on('json', Meteor.bindEnvironment(function (result) {
            var oldQName = result["OLD QUALIFICATION"].replace('::',",");
            var newQname = result["NEW QUALIFICATION"].replace('::',",");
            var oldSpecial = result["OLD SPECIALIZATION"].replace('::',",");
            var newSpecial = result["NEW SPECIALIZATION"].replace('::',",");

            var oldQualid = SmtCollections.SmtCustomerQualification.findOne({divisionId:divisionId,type:oldQName})._id;
            var newQualid = SmtCollections.SmtCustomerQualification.findOne({divisionId:divisionId,type:newQname})._id;

            var oldSpecialid = SmtCollections.SmtCustomerSpecialization.findOne({divisionId:divisionId,type:oldSpecial,qualificationId:oldQualid})._id;
            var newSpecialid = SmtCollections.SmtCustomerSpecialization.findOne({divisionId:divisionId,type:newSpecial,qualificationId:newQualid})._id;

            SmtCollections.SmtCompaniesCustomer.update({"personalDetails.qualification":oldQualid,"personalDetails.specialisation":oldSpecialid},
                {"personalDetails.qualification":newQualid,"personalDetails.specialisation":newSpecialid},{multi:true})
        }));
    }
});