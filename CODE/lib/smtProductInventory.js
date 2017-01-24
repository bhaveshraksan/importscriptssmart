var SmtProductInventories = new Mongo.Collection("smtProductInventories");

var SmtProductInventorySchema = new SimpleSchema({
    productId:{
        type: String,
    },
    productVariantId:{
        type:String,
        label:"Scientific Type"
    },
    isActive: {
        type: Boolean,
        defaultValue:true
    },
    companyId: {
        type:String,
        optional:false
    },
    companyDivisionId: {
        type:String,
        optional:true
    },
    inventoryFileId: {
        type: String,
        optional: true
    },
    audit:{
        type: SmtSchemas.SmtAuditSchema
    },
    inventory:{
        type:Number,
        label:"Number of type"
    },
   
});

SmtSchemas.SmtProductInventoriesSchema = SmtProductInventorySchema;
SmtCollections.SmtProductInventories = SmtProductInventories;

SmtCollections.SmtProductInventories.attachSchema(SmtSchemas.SmtProductInventoriesSchema);