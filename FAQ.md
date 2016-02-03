# FAQ #

### Question ###
Getting error on model-manager.get.js
cannot find children of "null"

**or**

I am using an Alfresco language pack, Data Dictionary > Models are named different.

### Answer ###
Ensure you are on at least 1.1.9

The error you are receiving is because it cannot find Data Dictionary>Models. If you are using an Alfresco language pack and these folders are named differently in your alfresco instance please follow the following steps to get things up and running.

Locate:
\webapps\alfresco\WEB-INF\classes\alfresco\templates\webscripts\ca\ab\fm\formsmanagement\utils\locale\alfresco-locale.js

The file will look something like this:
var fmPath = {}
fmPath.models = "Data Dictionary/Models/";
fmPath.constraints = "Data Dictionary/Models/Constraints/";
fmPath.jsonModels = "Data Dictionary/Models/JsonModels/";

Change the paths to match your local space names. Refresh webscripts and you should be good to go.