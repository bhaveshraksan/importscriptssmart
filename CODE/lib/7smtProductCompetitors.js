/*
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

SmtSchemas.SmtProductCompetitorsSchema = SmtProductCompetitorsSchema;*/
