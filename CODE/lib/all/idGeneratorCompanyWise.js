this.uniqueIdGenService = function (contexts) {

    var uniqueIdGenServiceClass = function (contexts) {
        this.contexts = contexts;
        //SerialNo = new Mongo.Collection("serialNumbers");
      /*  var condition = this.contexts;

        //condition.name = "slId";
        var data = this.contexts;
        var smartId = SerialNo.findOne( {$and:[{_id:"slId_"+data.companyId+"_"+data.divisionId},condition]});
        if(!smartId){
            //_.extend(this.contexts,{seq:0});

            data._id  = "slId_"+data.companyId+"_"+data.divisionId;
            data.seq = 0;
            SerialNo.insert(data);
        }
        var companyWiseTransactionFileId=SerialNo.findOne( {$and:[{_id:"inventoryTransactionFileId_"+data.companyId+"_"+data.divisionId},condition]});
        if(!companyWiseTransactionFileId){
            //_.extend(this.contexts,{seq:0});
            //var data = this.contexts;
            data._id  = "inventoryTransactionFileId_"+data.companyId+"_"+data.divisionId;
            data.seq = 0;
            SerialNo.insert(data);
        }
        var companyWiseInventoryFileId=SerialNo.findOne({$and:[{_id:"inventoryFileId_"+data.companyId+"_"+data.divisionId},condition]});
        if(!companyWiseInventoryFileId){
            //_.extend(this.contexts,{seq:0});
            //var data = this.contexts;
            data._id  = "inventoryFileId_"+data.companyId+"_"+data.divisionId;
            data.seq = 0;
            SerialNo.insert(data);
        }*/
    };

    uniqueIdGenServiceClass.prototype.getNextSequence = function (name) {
        var condition = this.contexts;
        condition._id = name+"_"+condition.companyId+"_"+condition.divisionId;
        SerialNo.update(condition, { $inc: { seq: 1 } },{ upsert: true });
        var ret = SerialNo.findOne(condition);
        return ret.seq;
    }   ;

    uniqueIdGenServiceClass.prototype.getUniqueId = function (name,id) {
        return "SMT-"+id+"-" + FormatUtil.leadingZeros(this.getNextSequence(name), 6);
    };
    uniqueIdGenServiceClass.prototype.getExistingSequence = function (name) {
        var condition = this.contexts;
        condition._id = name+"_"+condition.companyId+"_"+condition.divisionId;
        var ret = SerialNo.findOne(condition);
        return ret.seq;
    };
    /*uniqueIdGenServiceClass.prototype.getUniqueinventoryFileId = function (name) {
        if(name=="Gift"){
            return "SMT-INVENTORY-GIFTS-" + FormatUtil.leadingZeros(this.getNextSequence("inventoryTransactionFileId"), 6);
        }else if(name=="sample"){
            return "SMT-INVENTORY-SAMPLE-" + FormatUtil.leadingZeros(this.getNextSequence("inventoryTransactionFileId"), 6);
        }else if(name=="scientific"){
            return "SMT-INVENTORY-SCIENTIFIC-" + FormatUtil.leadingZeros(this.getNextSequence("inventoryTransactionFileId"), 6);
        }
    }
    uniqueIdGenServiceClass.prototype.getUniqueinventoryTransactionFileId = function (name) {
        if(name=="Gift"){
            return "SMT-INVENTORY-TRANSACTION-GIFTS-" + FormatUtil.leadingZeros(this.getNextSequence("inventoryFileId"), 6);
        }else if(name=="sample"){
            return "SMT-INVENTORY-TRANSACTION-SAMPLE-" + FormatUtil.leadingZeros(this.getNextSequence("inventoryFileId"), 6);
        }else if(name=="scientific"){
            return "SMT-INVENTORY-TRANSACTION-SCIENTIFIC-" + FormatUtil.leadingZeros(this.getNextSequence("inventoryFileId"), 6);
        }
    }*/

    return uniqueIdGenServiceClass
}();

/*Meteor.methods({
    "generateMslId": function (companyId,divisionId) {
        var doctorData = {};
        doctorData.mslId =new uniqueIdGenService({"companyId":companyId,"divisionId":divisionId}).getUniqueId("mslId")
    }
}*/
