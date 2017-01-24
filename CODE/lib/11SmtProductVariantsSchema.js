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
    "customers.$.categoryTypeId": {
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

var SmtProductDiscountsSchema = new SimpleSchema({
    discountId:{
        type: String,
        autoValue: function () {
            if(!this.isSet){
                return Random.id()
            }
        }
    },
    countryId:{
        type: String,
        optional: true,
    },
    categoryId:{
        type: String,
        optional: true,
    },
    discountName:{
        type: String,
        optional: true,
    },
    discountValue: {
        type: String,
        optional: true,
    },
    purchase:{
        type: String,
        optional: true,
    },
    free:{
        type: String,
        optional: true,
    },
    bonus:{
        type: String,
        optional: true,
    },
    startDate: {
        type: Date,
        optional: true,
    },
    endDate:{
        type: Date,
        optional: true,
    },
    description:{
        type: String,
        optional: true,
    },
    isModifiedBySO: {
        type: Boolean,
        optional: true,
    },
    isAvailableOnWeekEnd: {
        type: Boolean,
        optional: true,
    },
    isAvailableOnSameProduct:{
        type: Boolean,
        optional: true,
    },
    isAvailableOnAnotherProduct:{
        type: Boolean,
        optional: true,
    },
    lastUpdatedAt: {
        type: String,
        optional: true
    }
});

SmtSchemas.SmtProductDiscountsSchema = SmtProductDiscountsSchema;
var SmtProductCompetitorsSchema = new SimpleSchema({

    competitorId:{
        type: String,
        autoValue: function () {
            if(!this.isSet){
                return Random.id()
            }
        }

    },
    competitorName:{
        type: String,
        optional: true
    },
    competitorBrand:{
        type: String,
        optional: true
    },
    webLinks:{
        type: String,
        optional: true
    },
    stockRate: {
        type:String,
        optional: true
    },
    description:{
        type: String,
        optional: true
    },
    datedBy: {
        type: Date,
        optional: true
    },
    isActive: {
        type: Boolean,
        autoValue: function () {
            if(!this.isSet){
                return false;
            }
        }
    }
});

SmtSchemas.SmtProductCompetitorsSchema = SmtProductCompetitorsSchema;
SmtProductVariantsSchema = new SimpleSchema({
    variantId:{
        type: String,
        autoValue: function () {
            if(!this.isSet){
                return Random.id()
            }
        }
    },
    variantImage:{
      type: String,
      optional: true
    },
    skuCode:{
        type: String,
        optional: true
    },
    variantDisplayName:{
      type: String,
      optional: true
    },
    packing:{
        type: String,
        optional: true
    },
    units:{
        type: String,
        optional: true
    },

    variantName:{
        type: String,
        optional: true
    },
    variantDescription:{
        type: String,
        optional: true
    },
    isSample:{
        type: Boolean,
        optional:true
    },
    isActive:{
        type: Boolean,
        optional: true
    },
    competitors:{
        type:[SmtSchemas.SmtProductCompetitorsSchema],
        optional: true
    },
    costing:{
        type: [SmtSchemas.SmtProductCostingSchema],
        optional: true
    },
    discounts: {
        type: [SmtSchemas.SmtProductDiscountsSchema],
        optional: true
    },
    notes:{
        type: [Object],
        optional: true
    },
    "notes.$.id":{
        type: String,
        optional: true,
    },
    "notes.$.text": {
        type: String,
        optional: true,
    },
})

SmtSchemas.SmtProductVariantsSchema = SmtProductVariantsSchema;
