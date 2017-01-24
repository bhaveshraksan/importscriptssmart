var SmtCustomerRating = new Mongo.Collection("smtCustomerRating");

var SmtCustomerRatingSchema = new SimpleSchema({
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
    companyId:{
        type: String
    },
    divisionId:{
        type:String,
    },
    audit:{
        type: SmtSchemas.SmtAuditSchema
    }
});
SmtSchemas.SmtCustomerRatingSchema = SmtCustomerRatingSchema;
SmtCollections.SmtCustomerRating = SmtCustomerRating;
SmtCollections.SmtCustomerRating.attachSchema(SmtSchemas.SmtCustomerRatingSchema);
