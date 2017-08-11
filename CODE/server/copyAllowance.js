/**
 * Created by harishreddy on 8/9/17.
 */

Meteor.methods({
    copyAllowanceConditionFromOneDivisionToAnother: function (argOldDivisionId,argNewDivisionId) {

        if(!argOldDivisionId || !argNewDivisionId){
            console.log("Parameter not passed");
            console.log(argOldDivisionId,argNewDivisionId);
            return;
        }
        console.log(" Test - START");
        var newDivisionId = argNewDivisionId;
        var oldDivisionId = argOldDivisionId;


        console.log("start roles fetch");
        var rolesRawData = SmtCollections.SmtCompanyHierarchyAlias.findOne({"companyDivisionId":argNewDivisionId,isActive:true});
        if(!rolesRawData){
            console.log("no roles found please enter roles in system first");
            return;
        }
        var filterRoles = rolesRawData.companyHierarchyStructure.filter(function (d) {
            if(d.isActive == true && d.code != "LEVEL-0"){
                return d;
            }
        });
        if(!filterRoles && filterRoles.length == 0 ){
            console.log("something going wrong with roles array please check logic: " + filterRoles);
            return;
        }

        var roles = filterRoles.map(function (d){
            return d.code;
        });

        console.log("finally we got this roles",roles);
        var newDivStationTypes = [];
        newDivStationTypes = [{ oldId: 'b5jXNqhP9aDkxSDAn', newId: '64B9h7FArMysjrdSP'},
            { oldId: 'hgncKFr9nfn3Y4p2L', newId: 'cAgtpoo8exHnP4viF'},
            { oldId: 'imzz69qs6zgME2XW5', newId: 'zJcb2R3vLpmPn3pE7' },
            { oldId: 'zzLqnDvwCR37sD7at', newId: 'CMQh769nscbcm4kPD' }];


        // Copy NFWD & NWD.

        var NFWDAndNWDList = SmtCollections.SmtDayTypeAllowance.find({"divisionId": oldDivisionId,"isUserDefined" : true, "isActive": true}).fetch();
        var NFWDAndNWDIds = [];
        _.each(NFWDAndNWDList,function (nfwdRec) {
            if(nfwdRec && nfwdRec.isUserDefined){
                var newNFWDObj = {};
                newNFWDObj = _.extend({},nfwdRec);
                delete newNFWDObj._id;
                newNFWDObj.divisionId = newDivisionId;

                if(newNFWDObj.stationTypes && newNFWDObj.stationTypes.length>0){
                    _.each(newNFWDObj.stationTypes,function (nfwdStns, stnIndex) {
                        var stnFind = _.findWhere(newDivStationTypes, {"oldId" :nfwdStns});

                        if(stnFind && stnFind.newId){
                            newNFWDObj.stationTypes[stnIndex] = stnFind.newId;
                        }
                    });
                }
            }
            var newNFWD = SmtCollections.SmtDayTypeAllowance.insert(newNFWDObj);

            if(newNFWD){
                NFWDAndNWDIds.push({"oldNFWDId" : nfwdRec._id, "newNFWDId" : newNFWD});
            }
        });
        console.log("NFWD  - Start");
        console.log(NFWDAndNWDIds);
        console.log("NFWD  - End");

        var allowCondsMaster = SmtCollections.SmtAllowances.find({"divisionId": oldDivisionId,"type" : "ALLOWANCE-CONDITIONS","isActive" : true}).fetch();
        var allowMasterIds = [];
        _.each(allowCondsMaster,function (allowMastRec) {
            var mastRecObj = {};
            mastRecObj = _.extend({}, allowMastRec);
            delete mastRecObj._id;
            mastRecObj.divisionId = newDivisionId;

            var newMaster = SmtCollections.SmtAllowances.insert(mastRecObj);

            if(newMaster){
                allowMasterIds.push({"oldMasterId": allowMastRec._id, "newMasterId" : newMaster});
            }
        });

        console.log("Allowance Masters  - Start");
        console.log(allowMasterIds);
        console.log("Allowance Masters  - End");

        var allowCondsIds = [];
        _.each(allowMasterIds,function (allowMastRec) {
            if(allowMastRec.oldMasterId && allowMastRec.newMasterId){

                var allowanceConditionRecs = SmtCollections.SmtAllowanceConditions.find({"companyDivisionId": oldDivisionId,"isActive":true,"allowanceId": allowMastRec.oldMasterId}).fetch();

                _.each(allowanceConditionRecs,function (allowRec) {
                    var newAllowRec = {};
                    newAllowRec = _.extend({},allowRec);
                    delete newAllowRec._id;
                    //delete newAllowRec.roles;
                    //newAllowRec.role.splice(0,newAllowRec.roles.length);
                    newAllowRec.role = roles;
                    //newAllowRec.departmentId = '';
                    //newAllowRec.subDepartmentId = '';
                    newAllowRec.companyDivisionId = newDivisionId;
                    newAllowRec.allowanceId = allowMastRec.newMasterId;
                    // To change 'station types' in the fields 'sourceId' && 'destinationId'.
                    if(newAllowRec.allowanceConditions && newAllowRec.allowanceConditions.length>0){
                        var allowCondsFirst = newAllowRec.allowanceConditions[0];

                        if(allowCondsFirst && allowCondsFirst.conditions && allowCondsFirst.conditions.length>0){
                            var currAllConds = allowCondsFirst.conditions;
                            _.each(currAllConds,function (condRec, condIndex) {
                                var currCondObj  = {};
                                currCondObj = _.extend({},condRec);
                                if(currCondObj.sourceId){
                                    var stnFind = _.findWhere(newDivStationTypes, {"oldId" : currCondObj.sourceId});

                                    if(stnFind && stnFind.newId){
                                        currCondObj.sourceId = stnFind.newId;
                                    }
                                }
                                if(currCondObj.destinationId){
                                    var stnFind = _.findWhere(newDivStationTypes, {"oldId" : currCondObj.destinationId});

                                    if(stnFind && stnFind.newId){
                                        currCondObj.destinationId = stnFind.newId;
                                    }
                                }
                                currAllConds[condIndex] = currCondObj;
                            });
                            allowCondsFirst.conditions = currAllConds;
                        }

                        newAllowRec.allowanceConditions[0] = allowCondsFirst;
                    }

                    if(newAllowRec.allowanceTypesSettings && newAllowRec.allowanceTypesSettings.length>0){
                        _.each(newAllowRec.allowanceTypesSettings,function (typeRec, typeIndex) {
                            var typeRecObj = typeRec;
                            if(typeRecObj && typeRecObj.allowanceTypeId){
                                // First check in 'smtAllowanceTypesAlias'.
                                var aliasType = SmtCollections.SmtAllowanceTypesAlias.findOne({_id:typeRecObj.allowanceTypeId});

                                if(aliasType){
                                    if(aliasType.typeCode && aliasType.typeCode!="USER-DEFINED"){

                                        var currAlias = SmtCollections.SmtAllowanceTypesAlias.findOne({"typeCode" : aliasType.typeCode, "companyDivisionId" : newDivisionId});

                                        if(currAlias){
                                            typeRecObj.allowanceTypeId = currAlias._id;
                                        }
                                    }
                                }
                                else{
                                    var dayTypeRec = SmtCollections.SmtDayTypeAllowance.findOne({_id: typeRecObj.allowanceTypeId});

                                    if(dayTypeRec){
                                        var dayTypeFind = _.findWhere(NFWDAndNWDIds, {"oldNFWDId" : typeRecObj.allowanceTypeId});

                                        if(dayTypeFind && dayTypeFind.newNFWDId){
                                            typeRecObj.allowanceTypeId = dayTypeFind.newNFWDId;
                                        }

                                    }
                                }
                            }
                            newAllowRec.allowanceTypesSettings[typeIndex] = typeRecObj;
                        });
                    }

                    var newAllowCond = SmtCollections.SmtAllowanceConditions.insert(newAllowRec);
                    if(newAllowCond){
                        allowCondsIds.push({"oldConditionId" : allowRec._id,"newConditionId" : newAllowCond});
                    }

                });
            }

        });
        console.log("Allowance Conditions  - Start");
        console.log(allowCondsIds);
        console.log("Allowance Conditions  - End");

        var groupAllowanceIds = [];
        var groupAllowanceRecs = SmtCollections.SmtAllowancesGroup.find({"companyDivisionId": oldDivisionId,"isActive" : true}).fetch();

        _.each(groupAllowanceRecs,function (grpRec) {
            var newGrpObj = {};
            newGrpObj = _.extend({}, grpRec);
            delete newGrpObj._id;

            newGrpObj.companyDivisionId = newDivisionId;

            if(newGrpObj && newGrpObj.stationTypeSettings && newGrpObj.stationTypeSettings.length>0){
                _.each(newGrpObj.stationTypeSettings,function (stsRec, stsRecIndex) {
                    var stnTypeSett = stsRec;

                    if(stnTypeSett && stnTypeSett.stationTypeIds && stnTypeSett.stationTypeIds.length>0){
                        var currRow = stnTypeSett.stationTypeIds;

                        _.each(currRow,function (currRec, currInd) {
                            if(currRec){
                                var stnFind = _.findWhere(newDivStationTypes, {"oldId" : currRec});

                                if(stnFind && stnFind.newId){
                                    currRow[currInd]  = stnFind.newId;
                                }
                            }
                        });

                        stnTypeSett.stationTypeIds = currRow;

                    }

                    if(stnTypeSett && stnTypeSett.list && stnTypeSett.list.length>0){
                        _.each(stnTypeSett.list,function (listRec, listInd) {
                            if(listRec && listRec.allowanceTypeId){
                                var finalAllwTypeId = '';

                                // First check in 'smtAllowanceTypesAlias'.
                                var aliasType = SmtCollections.SmtAllowanceTypesAlias.findOne({_id:listRec.allowanceTypeId});

                                if(aliasType){
                                    if(aliasType.typeCode && aliasType.typeCode!="USER-DEFINED"){

                                        var currAlias = SmtCollections.SmtAllowanceTypesAlias.findOne({"typeCode" : aliasType.typeCode, "companyDivisionId" : newDivisionId});

                                        if(currAlias){
                                            finalAllwTypeId = currAlias._id;
                                        }
                                    }
                                }
                                else{
                                    var dayTypeRec = SmtCollections.SmtDayTypeAllowance.findOne({_id: listRec.allowanceTypeId});

                                    if(dayTypeRec){
                                        var dayTypeFind = _.findWhere(NFWDAndNWDIds, {"oldNFWDId" : listRec.allowanceTypeId});

                                        if(dayTypeFind && dayTypeFind.newNFWDId){
                                            finalAllwTypeId = dayTypeFind.newNFWDId;
                                        }

                                    }
                                }
                                listRec.allowanceTypeId = finalAllwTypeId;

                                stnTypeSett.list[listInd] =  listRec;
                            }
                        });
                    }

                    newGrpObj.stationTypeSettings[stsRecIndex] = stnTypeSett;
                });
            }

            var newGrpNew = SmtCollections.SmtAllowancesGroup.insert(newGrpObj);

            if(newGrpNew){
                groupAllowanceIds.push({"oldGroupId": grpRec._id, "newGroupId" : newGrpNew});
            }

        });

        console.log("Group Allowance - Start");
        console.log(groupAllowanceIds);
        console.log("Group Allowance - End");


        console.log(" Test - END");

    }
})