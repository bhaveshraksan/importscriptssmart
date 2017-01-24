var SmtPhysicalStabilitySchema = new SimpleSchema({
    duration:{
        type: String,
        optional: true,
    },
    expiryDate:{
        type: String,
        optional: true,
    },
    temperatureCondition:{
        type: String,
        optional: true,
    },
    productProperties:{
        type: [Object],
        optional: true,
    },
    "productProperties.$.id": {
        type: String,
       
    },
    "productProperties.$.name": {
        type: String,
        optional: true,
    },
    "productProperties.$.quantity":{
        type: String,
        optional: true,
    }


});
var SmtChemicalStabilitySchema = new SimpleSchema({
    id:{
        type: String,
        autoValue: function () {
            if(!this.isSet){
                return Random.id()
            }
        }
    },
    name:{
        type: String,
        optional: true
    },
    strength:{
        type: String,
        optional: true
    },
    durations:{
        type: [String],
        optional: true
    }

});

var SmtPropertiesOfTabletsSchema = new SimpleSchema({
    weight:{
        type: String,
        optional: true
    },
    diameter:{
        type: String,
        optional: true
    },
    form:{
        type: String,
        optional: true
    },
    hardness:{
        type: String,
        optional: true
    },
    disIntegration:{
        type: String,
        optional: true
    },
    friability:{
        type: String,
        optional: true
    }
});

SmtSchemas.SmtChemicalStabilitySchema = SmtChemicalStabilitySchema;
SmtSchemas.SmtPhysicalStabilitySchema = SmtPhysicalStabilitySchema;
SmtSchemas.SmtPropertiesOfTabletsSchema = SmtPropertiesOfTabletsSchema;