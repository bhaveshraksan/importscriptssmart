/*
var SmtProductCustomerTypesSchema = new SimpleSchema({

    type:{
        type: String,
        optional: true,
    },
    defaultCost:{
        type: String,
        optional: true,
    },
    minCost:{
        type: String,
        optional: true,
    },
    maxCost:{
        type: String,
        optional: true,
    },
    customers:{
        type: [Object],
        optional: true,
    },
    "customers.$.customerTypeId": {
        type: String,
        optional: true,
    },
    "customers.$.customerId": {
        type: String,
        optional: true,
    },
    "customers.$.cost": {
        type: String,
        optional: true,
    },
    "customers.$.totalCost": {
        type: String,
        optional: true,
    }

});
SmtSchemas.SmtProductCustomerTypesSchema = SmtProductCustomerTypesSchema;

var SmtProductCostingSchema = new SimpleSchema({
    id:{
        type: String,
    },
    countryId:{
      type: String,
        optional: true,
    },
    stateId:{
        type: String,
        optional: true,
    },
    startDate: {
        type: Date,
        optional: true,
    },
    endDate: {
        type: Date,
        optional: true,
    },
    description: {
        type: String,
        optional: true,
    },
    customerTypes:{
        type:[SmtSchemas.SmtProductCustomerTypesSchema],
    },
    taxes: {
        type: [Object],
        optional: true,
    },
    "taxes.$.taxId": {
        type: String,
        optional: true,
    },
    "taxes.$.amount":{
        type: String,
        optional: true,
    },
    updatedAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            if(this.isUpdate){
                return new Date();
            }
        }
    }
});



SmtSchemas.SmtProductCostingSchema = SmtProductCostingSchema;
*/
