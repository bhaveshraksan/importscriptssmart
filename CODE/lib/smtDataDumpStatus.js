/**
 * Created by harishreddy on 7/3/17.
 */
var smtDataDumpStatus =  new Mongo.Collection("smtDataDumpStatus");

var smtDataDumpStatusSchema = new SimpleSchema({

    company:{
        type:String,
        optional:false
    },
    division:{
        type:String,
        optional:false
    },
    customerType:{
        type:String,
        optional:false
    },
    slid:{
      type:String,
      optional:false
    },
    status:{
        type:String,
        optional:false
    },
    sourceFile:{
        type:String,
        optional:false
    },
    errors:{
        type:String,
        optional:true
    },
    timestamp:{
        type:Date,
        optional:false
    }

});

SmtSchemas.smtDataDumpStatusSchema = smtDataDumpStatusSchema;
SmtCollections.smtDataDumpStatus = smtDataDumpStatus;
SmtCollections.smtDataDumpStatus.attachSchema(SmtSchemas.smtDataDumpStatusSchema);