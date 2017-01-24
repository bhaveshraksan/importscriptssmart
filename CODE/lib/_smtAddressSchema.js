var SmtAddressSchema = new SimpleSchema({
    address:{
        type: Object,
        optional: true
    },
    "address.addressLine1":{
        type: String,
        optional: true
    },
    "address.addressLine2":{
        type: String,
        optional: true
    },
    "address.addressLine3":{
        type: String,
        optional: true
    },
    "address.locality":{
        type: String,
        optional: true
    },
    "address.zipCode":{
        type: String,
        optional: true
    },
    "address.city":{
        type: String,
        optional: true
    },
    "address.state":{
        type: String,
        optional: true
    },
    "address.country":{
        type: String,
        optional: true
    },
    "address.latitude":{
      type : String,
      optional:true
    },
    "address.longitude":{
        type: String,
        optional:true
    }
});

var SmtLocationSchema = new SimpleSchema({
    "latitude": {
        type: String,
        optional: false
    },
    "longitude": {
        type: String,
        optional: false
    }
});

SmtSchemas.SmtLocationSchema = SmtLocationSchema;
SmtSchemas.SmtAddressSchema = SmtAddressSchema;