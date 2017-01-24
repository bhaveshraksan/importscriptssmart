var SmtProductInventorySchema = new SimpleSchema({
    id: {
      type: String,
      autoValue: function () {
          if(!this.isSet){
              return Random.id();
          }
      }
    },
    inventoryId:{
        type: String,
        optional: true,
    },
    customerType:{
        type: String,
        optional: true,
    },
    countryId:{
        type: String,
        optional: true,
    },
    divisionId:{
        type: String,
        optional: true,
    },
    zoneId: {
        type: String,
        optional: true,
    },
    regionId:{
        type: String,
        optional: true,
    },
    customerName:{
        type: String,
        optional: true,
    },
    openings:{
        type: Number,
        optional: true,
    },
    FGU: {
        type: Number,
        optional: true,
    },
    reserved:{
        type: Number,
        optional: true,
    },
    inHand:{
        type: Number,
        optional: true,
    }
});
SmtSchemas.SmtProductInventorySchema = SmtProductInventorySchema;