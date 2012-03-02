<import resource="classpath:alfresco/templates/webscripts/ca/ab/fm/formsmanagement/utils/scriptUtils/nodeValidation.js">
model.response = nodeValidation(args.nodes, args.aspect);

var validation = eval("(" + model.response  + ")");
var nodeArr = args.nodes.split("~");
var fmMoveNode = args.destination;
model.failedItems = 0;
model.status = 1;
model.success = 0;
model.msg = "";

function fileExistsClash(name, destination, i){

	//Split old and get extension
	var ext = name.substr(name.lastIndexOf('.') + 1);
	var filename = name.replace("."+ext, "");
	var newname = filename + "-" + i + "." + ext;

 	if(destination.childByNamePath(newname)){
		fileExistsClash(name, destination, i++);
	}else{
		return newname;
	}
}

if(validation.service.status == 1){
	for(x in nodeArr){
		//Check if this node was valid
		var validNode
		for(y in validation.nodes){
			if(validation.nodes[y].id == "workspace://SpacesStore/" + nodeArr[x]){
				validNode = validation.nodes[y].valid;
			}
		}

		if(validNode){
			var destination = search.findNode("workspace://SpacesStore/" + fmMoveNode);
			var node = search.findNode("workspace://SpacesStore/" + nodeArr[x]);

			if(destination && node){
				logger.log("FORM MANAGEMENT: MOVING NODE:" + nodeArr[x]);

				if(destination.childByNamePath(node.name + "")){
					node.name = fileExistsClash(node.name, destination, 1);
					node.save();
				}

				var didMove = node.move(destination);
				logger.log("FORM MANAGEMENT: MOVED SUCCESS:" + didMove);
				if(!didMove){
					model.failedItems++;
				}
			}else{
				model.failedItems++;
				model.status = 0;
				model.msg = "Could not find file or destination nodes, please check these items have not been deleted and you have the correct permissions.";
			}
		}else{
			model.failedItems++;
		}
	}
	model.success =  nodeArr.length - model.failedItems;
}else{
	model.status = 0;
}