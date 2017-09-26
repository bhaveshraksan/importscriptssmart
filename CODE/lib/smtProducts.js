var SmtProducts =  new Mongo.Collection("smtProducts");

var SmtProductIntermediatesSchema = new SimpleSchema({
   
    drugName:{
        type:String,
        optional:true
    },
    intermediates:{
        type:String,
        optional:true
    },
    caseNo:{
        type:String,
        optional:true
    },
    synonym:{
        type:String,
        optional:true
    },
    intermediateDescription:{
        type:String,
        optional:true
    }
    
});

SmtSchemas.SmtProductIntermediatesSchema = SmtProductIntermediatesSchema;


var SmtProductBulkDrugsSchema = new SimpleSchema({

    name:{
        type:String,
        optional:true
    },
    meterialCost:{
        type:String,
        optional:true
    },
    productionCost:{
        type:String,
        optional:true
    },
    utilities:{
        type:[String],
        optional:true
    },
    bulkDescription:{
        type:String,
        optional:true
    }

});

SmtSchemas.SmtProductBulkDrugsSchema = SmtProductBulkDrugsSchema;


var SmtProductGranulesSchema = new SimpleSchema({
    particleSize:{
        type:String,
        optional:true
    },
    powderType:{
        type:String,
        optional:true
    },
    granulesUsage:{
        type:String,
        optional:true
    },
    timesToUsage:{
        type:String,
        optional:true
    },
    method:{
        type:String,
        optional:true
    },
    granulesDescription:{
        type:String,
        optional:true
    }
});

SmtSchemas.SmtProductGranulesSchema = SmtProductGranulesSchema;


var SmtProductMoleculesSchema = new SimpleSchema({
    moleculeType:{
        type:String,
        optional:true
    },
    formulaType:{
        type:String,
        optional:true
    },
    formulaName:{
        type:String,
        optional:true
    },
    formulaData:{
        type: [Object],
        optional: true
    },
    "formulaData.$.group":{
        type: String,
        optional: true
    },
    "formulaData.$.compounds":{
        type: String,
        optional: true
    },
    moleculeDescription:{
        type: String,
        optional: true
    }
    
});

SmtSchemas.SmtProductMoleculesSchema = SmtProductMoleculesSchema;


var SmtProductRAndDSchema = new SimpleSchema({

    rAndDDrugInformation:{
        type:[Object],
        optional:true
    },
    "rAndDDrugInformation.$.id":{
        type:String,
        optional:true
    },
    "rAndDDrugInformation.$.drugName":{
        type:String,
        optional:true
    },
    "rAndDDrugInformation.$.area":{
        type:String,
        optional:true
    },
    "rAndDDrugInformation.$.stageOfDevelopment":{
        type:String,
        optional:true
    },
    ratings:{
        type:Object,
        optional:true
    },
    "ratings.physicalAssessments":{
        type: String,
        optional: true
    },
    "ratings.interpretingLaboratory":{
        type: String,
        optional: true
    },
    "rating.scientificKnowledge":{
        type: String,
        optional: true
    },
    "rating.focusOfExpertise":{
        type: String,
        optional: true
    },
    description:{
        type: String,
        optional: true
    },
});

SmtSchemas.SmtProductRAndDSchema = SmtProductRAndDSchema;

var SmtProductsSchema = new SimpleSchema({
    productName:{
        type: String,
        //unique: true
    },
    productCategory:{
      type: String
    },
    companyId:{
      type: String    
    },
    divisionId:{
      type: String
    },
    productImage:{
      type: String,
      optional: true
    },
    displayName:{
        type: String,
        optional: true
    },
    dcpo:{
        type: String,
        optional: true
    },
    knownName: {
        type: String,
        optional: true
    },
    skuNumber:{
        type: String,
        optional: true
    },
    specification:{
        type: String,
        optional: true
    },
    subCategory:{
        type: [String],
        optional: true
    },
    icdCode:{
        type: String,
        optional: true
    },
    type:{
        type: String,
        optional: true
    },
    activeIngredients: {
        type: [SmtSchemas.SmtActiveIngredientsSchema],
        optional: true
    },
    productStateId:{
        type: String,
        optional: true
    },
    productFormatId:{
        type: String,
        optional: true
    },
    productPackagingId:{
        type: String,
        optional: true
    },
    productUnitId:{
        type: String,
        optional: true
    },
   /* inActiveIngredients:{
        type: [SmtSchemas.SmtInActiveIngredientsSchema],
        optional: true
    },*/
    physicalStability:{
        type: SmtSchemas.SmtPhysicalStabilitySchema,
        optional: true
    },
    chemicalStability:{
        type: [SmtSchemas.SmtChemicalStabilitySchema],
        optional: true
    },
    propertiesOfTablets:{
      type: SmtSchemas.SmtPropertiesOfTabletsSchema,
        optional: true
    },
    manufacturedLocation:{
        type: String,
        optional: true
    },
    strength: {
        type: String,
        optional: true
    },
    reviews: {
        type: String,
        optional: true
    },
    manufacturing:{
        type: String,
        optional: true
    },
    associatedWith:{
        type: [String],
        optional: true
    },
    description:{
        type: String,
        optional: true
    },
    marketing:{
      type:[SmtSchemas.SmtProductMarketingSchema],
        optional: true
    },
    drugsClassification:{
        type:[SmtSchemas.SmtProductDrugClassificationSchema],
        optional: true
    },
    intermediatesData:{
        type: SmtSchemas.SmtProductIntermediatesSchema,
        optional:true
    },
    bulkDrugsData:{
        type: SmtSchemas.SmtProductBulkDrugsSchema,
        optional:true
    },
    granulesData:{
        type: SmtSchemas.SmtProductGranulesSchema,
        optional:true
    },
    moleculesData:{
        type: SmtSchemas.SmtProductMoleculesSchema,
        optional:true
    },
    rAndDData:{
        type: SmtSchemas.SmtProductRAndDSchema,
        optional:true
    },
    applicationsAndEffects:{
        type: SmtSchemas.SmtProductApplicationsAndEffectsSchema,
        optional: true
    },

    library: {
        type: [SmtSchemas.SmtProductLibrarySchema],
        optional: true
    },

    variants:{
        type: [SmtSchemas.SmtProductVariantsSchema],
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
    marketingInfo:{
        type: [Object],
        optional: true
    },
    "marketingInfo.$.id":{
        type: String,
        optional: true,
    },
    "marketingInfo.$.text": {
        type: String,
        optional: true,
    },

    inventory:{
        type: [SmtSchemas.SmtProductInventorySchema],
        optional: true
    },
    isActive:{
        type: Boolean,
        autoValue: function () {
            if(!this.isSet){
                return true;
            }
        }
    },
    audit:{
        type: SmtSchemas.SmtAuditSchema
    }
});
SmtSchemas.SmtProductsSchema = SmtProductsSchema;
SmtCollections.SmtProducts = SmtProducts;
SmtCollections.SmtProducts.attachSchema(SmtSchemas.SmtProductsSchema);