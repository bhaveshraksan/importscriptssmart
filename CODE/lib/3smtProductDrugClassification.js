var SmtProductDrugClassificationSchema = new SimpleSchema({
    id:{
        type: String,
        autoValue: function () {
            if(!this.isSet){
                return Random.id();
            }
        }
    },
    drugName:{
        type: String,
        optional: true,
    },
    isActive: {
        type: Boolean,
        optional: true,
        autoValue: function () {
            if(!this.isSet){
                return false;
            }
        }
    }
});
SmtSchemas.SmtProductDrugClassificationSchema = SmtProductDrugClassificationSchema;