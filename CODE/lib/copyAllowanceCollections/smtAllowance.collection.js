var SmtAllowances = new Mongo.Collection("smtAllowances");
var SmtAllowancesSchema = new SimpleSchema({
    companyId:{
        type: String,
    },
    divisionId:{
        type: String,
    },
    countryId:{
        type: String,
    },
    type:{
        type: String,
        optional:true,
    },
    name:{
        type: String,
        optional:false
    },
    displayName:{
        type: String,
        optional:false
    },
    description:{
        type: String,
        optional:true
    },
    startDate:{
        type: Date,
        optional:true,
    },
    endDate:{
        type: Date,
        optional:true,
    },
   /* travelCalulationBy:{
        type:String,
        optional:true
    },*/

    isActive:{
        type: Boolean,
        index:1,
        autoValue:function(){
            if(!this.isSet && (this.isInsert || this.isUpsert)){
                return false
            }
        }
    },
    audit:{
        blackbox:true,
        type: Object
    }
});
SmtSchemas.SmtAllowancesSchema = SmtAllowancesSchema;
SmtCollections.SmtAllowances = SmtAllowances;
/*if(Meteor.isClient){
    SmtGroundCollections.SmtAllowances = Ground.Collection(SmtCollections.SmtAllowances,{cleanupLocalData: false});
}*/
SmtCollections.SmtAllowances.attachSchema(SmtSchemas.SmtAllowancesSchema);