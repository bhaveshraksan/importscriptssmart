var SmtCustomerProfessionalTags = new Mongo.Collection("smtCustomerProfessionalTags");

var SmtCustomerProfessionalTagsSchema = new SimpleSchema({
    type:{
        type: String,
    },
    description:{
        type: String,
    },
    isActive: {
        type: Boolean,
        autoValue:function(){
            if(!this.isSet){
                return false
            }
        }
    },
    companyId: {
      type: String
    },
    divisionId:{
        type: String
    },
    audit:{
        type: SmtSchemas.SmtAuditSchema
    }
});
SmtSchemas.SmtCustomerProfessionalTagsSchema = SmtCustomerProfessionalTagsSchema;
SmtCollections.SmtCustomerProfessionalTags = SmtCustomerProfessionalTags;
SmtCollections.SmtCustomerProfessionalTags.attachSchema(SmtSchemas.SmtCustomerProfessionalTagsSchema);
