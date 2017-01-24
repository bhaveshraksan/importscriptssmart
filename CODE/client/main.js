Template.hello.helpers({
    companies:function () {
        return SmtCollections.SmtCompanies.find().fetch();
    },
    customerTypes:function () {
        return SmtCollections.SmtCompanyCustomersAlias.find({companyId:Session.get("company")}).fetch();
    },
    divisionIds:function () {

        return SmtCollections.SmtCompaniesDivision.find({companyId:Session.get("company")}).fetch();
    }
});


Template.hello.events({
    "change [name='companyId']":function (e) {
      e.preventDefault();
        var companyId=$('[name="companyId"]').val();
        Session.set("company",companyId);
    },
    "change [name='divisionId']":function (e) {
        e.preventDefault();
        var divisionId=$('[name="divisionId"]').val();
        Session.set("division",divisionId);
    },
  "change [name= 'uploadDoctorCsv']": function (e,t)
  {
      e.preventDefault();
      var file = (e.currentTarget).files[0];

      var reader = new FileReader();
      reader.onload = function(fileLoadEvent)
      {
          var context = {};
          context.companyId = Session.get("company");
          context.divisionId = Session.get("division")

          context.customerTypeId = $("[name='customerTypeId']").val()

          Meteor.call('processData', reader.result, context);
      };
      reader.readAsBinaryString(file);

      // Papa.parse(file, {
      //     header: false,
      //     complete: function(results) {
      //         console.log(results);
      //         Meteor.call("processData",results,function (err,res) {
      //             console.log(err,res);
      //         })
      //     }
      // });

      // var uploader = new Slingshot.Upload("uploadCampaignFile");
      // var file = (e.currentTarget).files[0];
      // uploader.send(file, function (error, downloadUrl) {
      //     if (error) {
      //         console.error('Error uploading', error);
      //     }else {
      //         console.log(downloadUrl);
      //     }
      // });
  },

  "click #parseData": function (e,t) {
      e.preventDefault();
      // var downloadUrl="/home/venkatasrinag/Desktop/Doctor Sample-Doctors.csv";
      // Papa.parse(downloadUrl, {
      //     download: true,
      //     header: false,
      //     complete: function(results) {
      //       console.log(results);
      //         Meteor.call("processData",results,function (err,res) {
      //             console.log(err,res);
      //         })
      //     }
      // });
  }

});