var mongo = require('then-mongo');


var mongoUrl='mongodb://analytics:pr0dreadOnly@54.254.206.34:2029/veritaz_prod';
var db = mongo(mongoUrl,['smtCompanyLocations','smtCompaniesCustomer']);


db.smtCompaniesCustomer.find({divisionId:"",customerType:"",
"jobDetails.address.address.latitude":{$exists:false}).then(function(customers) {
           customers.forEach(function) 
        })  
