<import resource="classpath:alfresco/templates/webscripts/ca/ab/fm/formsmanagement/utils/scriptUtils/jsonUtils.js">

function extractAspects(jObj, uid){
	var aspectString = "";

	if(jObj.aspects){
		if(jObj.aspects.length > 0){
			for(x in jObj.aspects){
				jObj.aspects[x].rootUid = uid;
			}
			var tmpS = JSON.stringify( jObj.aspects );
				tmpS = tmpS.substring(1);
			aspectString = tmpS.slice(0, -1) + ",";
		}
	}
	return aspectString;
}

function getAspectList(){
	var jsonString = "";
	var jsonList = companyhome.childByNamePath('Data Dictionary/Models/JsonModels/').children;
	model.aspectObj = [];

	var len = jsonList.length;
	for(var i=0; i<len; i++) {
		var fileObj = eval("(" + jsonList[i].content + ")" );
		var aString = extractAspects(fileObj, jsonList[i].id);
		jsonString += aString;

	}
	return  "[" + jsonString.slice(0, -1) + "]";
}
