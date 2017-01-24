var SmtProductApplicationsAndEffectsSchema = new SimpleSchema({
    usesOfDrugs:{
        type: String,
        optional: true,
    },
    sideEffects:{
        type:String,
        optional: true,
    },
    dosageInfo:{
        type: String,
        optional: true,
    },
    precautions:{
        type: String,
        optional: true,
    },
    brandInfo:{
        type: String,
        optional: true,
    },
    contraIndications: {
        type: String,
        optional: true,
    },
    diseases:{
        type: String,
        optional: true,
    },
    overdose:{
        type: String,
        optional: true,
    },
    storageConditions:{
        type: String,
        optional: true,
    },
    sample: {
        type: String,
        optional: true,
    }
});
SmtSchemas.SmtProductApplicationsAndEffectsSchema = SmtProductApplicationsAndEffectsSchema;