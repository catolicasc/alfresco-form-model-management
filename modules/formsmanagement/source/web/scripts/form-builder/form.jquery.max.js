/*  Alfresco Form Creator
    Copyright (c) 2011 Mike Priest
	Licensed under the MIT license
	Version: 1.0.3 (28/11/2011 16:01:37)

	Plugin: jQuery.form

	Dependant Plugins:
	selectToUISlider (Used for custom Dropdown menu to jQuery slider)

	TODO: Make fm-connect-container instancable for multi dynamic dropdowns
	TODO: Smoothen out UI on load values, remove the "pop" injection look
	TODO: Add loading indicator for usability when populating dynamic dropdowns
	TODO: CROSS BROWSER COMPATABILITY - BOOOOo
	TODO: Move to latest jQuery so were not dependant on jquery.live plugin (Used for the IE onchange bug for elements added to the DOM after page load)
	TODO: Add SpacesStore settings

  	TESTED: Firefox
			Chrome
			Internet Explorer 8

	NEW PARAMETER: useShareProxy<BOOLEAN> : If set to true (default), all of the AJAX calls used will use the share proxy to call alfresco webscripts
	NEW PARAMETER: Allow customProperties<Object>: Allows us to override title and description properties of the display form. Works good for search titles, ive used it for a replication of the Document Details
	NEW: Dynamic dropdowns are auto detected and profiles connected to profiles are auto generated based upon users choice. i.e. If your aspect has a dynamic dropdown all the functionality for parcing and deploying the correct form is done automatically.
	NEW: Cached JSON Node Properties for load values
	NEW: Caching added for profile (storing JSON profile relative to dynamic dropdown) Moving towards instancable dynamic profiles
    NEW: Store and retrieval of Node Properties using FM API
    NEW: Callbacks added to load, save and profile completed states
    NEW: Added Connect parameter so we can choose where to inject the profile forms on dynamic dropdown change
    NEW: Allow ARRAY of nodes to save (Giving a ~ separated list will save all node properties to the given nodes)
    NEW: Optional save parameter moveId<Alfresco Space UID> allows us to move a document to a location after it has been saved
	NEW: Readonly option
	NEW: Option of using own dropdown changing event by making "handler" element available before load and setting your profile at init. This will create the trigger to look for your profile setup and create the form based upon the choice. (If you choose not to just load the aspect with a dynamic dropdown)
	NEW: Cached Profile API Call to JS, therefore less calls are being made to the backend when re-selecting dependant values.
	NEW: Added Aspect title to fm-profile-aspect wrapper ID - Quick JS points to show/hide certains aspects when needed
    NEW: Added Form Data to $.data() so that plugin is instancable
	NOTE: PLUGIN WILL USE SHARE PROXY METHOD UNLESS YOU STATE OTHERWISE BY SETTING "useShareProxy" : false

*/
(function ($) {
    var globalKey = ""; var cacheProfileAspect= {};
	var isConnect = false; var isDebug = false;
	var defaultSettings = {
        'isBulk': true,
        'nodeId': null,
        'aspects': [],
        'profile': null,
        'handler': '.handler',
        'isSearch': false,
        'postUrl': '/share/proxy/alfresco/form-management/formdata/save',
        'onComplete': null,
        'useShareProxy': true,
        'onSaveComplete': null,
        'customProperites': null,
        'connect': "",
        'readonly': false,
        'ownDropSource': false
    };
    var methods = {
        init: function (options) {
            return this.each(function () {

				var $this = $(this);
                data = $this.data('form');
				$this.data('origAspectCollection', "");

				if($this.hasClass("fm-init-load")){
					//Form already has init so just extend options
					if (options) {
						$this.data('settings', $.extend( $this.data('settings'), options ) );
					}
					$this.data('settings', mergedSettings);

				} else {
					// If the plugin hasn't been initialized yet
					$this.addClass("fm-init-load");

					//Add defaultSettings to local variable so where not changing the global setting
					var mergedSettings = $.extend(true, {}, defaultSettings);
					if (options) {
						//Merge Plugin Options with Local Default settings
						$.extend( mergedSettings, options);
					}
					$this.data('settings', mergedSettings);

					var settings = $this.data('settings');
					if( $(settings.handler).length > 0 ){
						//If we are using our own dropdown source for changing profiles
						$(this).addClass("fm-connect-container");
						settings.ownDropSource = true;

						if(!settings.readonly){
							$(settings.handler).livequery("change", function () {

								$(this).addClass("dontPopulateMe");
								var fmAspectNode = $this.find('.fmAspectCollection:eq(0)');
								fmAspectNode.val("");
								if ($(this).val() != "") {
									var getProfileData = eval("(" + settings.profile + ")");
									methods.dynamicProfileCreate($this,  $(this).val(), getProfileData);

								} else {
									$this.find(".fm-connect-container:eq(0)").html("");
								}

								fmAspectNode.val(fmAspectNode.val() + $this.data('origAspectCollection'));
							});
						}
					}

					if (settings.aspects.length > 0) {
						//Load aspects if we are deailing with aspect only
						var formS = "";
						for (a in settings.aspects) {
							formS += methods.buildAspect($this, settings.aspects[a], false);
						}
						$this.html(formS);
						$this.data('origAspectCollection', $this.find('.fmAspectCollection:eq(0)').val() + "");
						methods.onInnerComplete();
					}
					if (settings.onComplete) settings.onComplete($this);
					if ($('.frmSaveButton').length > 0) {
						$(".f_b_root").sortable({
							items: '.group'
						}).disableSelection();
					}
				}
			});
        },
        dynamicProfileCreate: function ($this, val, profile) {

				if(val != ""){
                	if (isDebug) console.log("Creating Profile for key: " + val + " & Profile:" + profile);
                	isConnect = true;
                	methods.buildProfile($this, val, profile);
                }else{
					$this.find('.fm-connect-container:eq(0)').html("");
                }
        },
        buildProfile: function ($this, key, profile) {

			if (isDebug) { console.log("Check CONNECT: " + isConnect) }
			var settings = $this.data('settings');

            var connect = false;
            var profileHeader = "";
            if (settings.connect != "" || isConnect) connect = true;

            if(settings.ownDropSource) connect = false;
            //Populate Profile
            var formString = "";
            if (!connect) formString += '<form name="" class="fm-profile-root" id="my-frm" method="POST">';
            if (!connect) formString += '	<div class="top profileStyle" id="formFormat">';
            if (!connect) formString += '	<div class="f_b_root"><div class="fm-connect-container"></div></div>';
            if (!connect) formString += '</div><input type="hidden" value="" class="prg-frm-redirect" name="prg-frm-redirect" /> <input type="hidden" value="" id="modelName" /><input type="hidden" name="frm-aspect-collection" class="fmAspectCollection" value="0" /></form>';
            if (!connect) $this.html(formString);
            if (!connect) $('.fmAspectCollection').val("");
            for (x in profile) {
                if (profile[x].key == key) {
                    //Profile found for value selected WE HAVE GOT AN ARRAY OF ASPECTS TO FIND
                    if(settings.customProperites){
                    	profile[x].profile.title = settings.customProperites.title;
                    	profile[x].profile.description = settings.customProperites.description;
                    }

                    if (!connect) profileHeader = '		<h1 style="margin:0;" class="frm_formName">' + profile[x].profile.title + '</h1> <span class="frm_desc">' + profile[x].profile.description + '</span>';
                    $('.profileStyle').prepend(profileHeader);
                    //GO GET THE FORM DATA FOR EACH ASPECT
                    var url = "/share/proxy/alfresco/model/aspects/profiletoproperty";
                    if(!settings.useShareProxy) url= "/alfresco/wcs/model/aspects/profiletoproperty";

					globalKey = key;

					if( cacheProfileAspect["" + key]) {
						 //CACHED PROPERTY VALUES
						var r = cacheProfileAspect["" + key];
						var formS = "";
						for (a in r) {
							if (r[a].formStyle) $('.profileStyle').attr("class", r[a].formStyle);
							formS += methods.buildAspect($this, r[a], true);
						}
						var errForm = '<div class="errHandleBox" style="display:none"><p>There are some errors with your form:</p><ul><li></li></ul></div>';
						if (!connect) if (!connect) $this.find('.f_b_root').html(errForm + "" + formS);
						if (connect) $this.find(".fm-connect-container:eq(0)").html(formS);
						methods.onInnerComplete();

					}else{

						$.ajax({
						  url: url,
						  dataType: 'json',
						  data: { profile: JSON.stringify(profile[x].profile) },
						  async: false,
						  success:  function (r) {
								cacheProfileAspect["" + globalKey] = r;
								var formS = "";
								for (a in r) {
									if (r[a].formStyle) $('.profileStyle').attr("class", r[a].formStyle);
									formS += methods.buildAspect($this, r[a], true);
								}
								var errForm = '<div class="errHandleBox" style="display:none"><p>There are some errors with your form:</p><ul><li></li></ul></div>';
								if (!connect) if (!connect) $this.find('.f_b_root').html(errForm + "" + formS);
								if (connect) $this.find(".fm-connect-container:eq(0)").html(formS);
								methods.onInnerComplete();
							}
						});
					}
                }
            }
        },
        buildAspect: function ($this, aspect, isProfile) {

            var settings = $this.data('settings');

			var aspectCollection = "";
            var formStyle = "top";
            if (aspect.formStyle) formStyle = aspect.formStyle;
            var formString = "";
            if (!isProfile) formString += '<form name="" class="" id="my-frm" method="POST">';
            if (!isProfile) formString += '	<div class="' + formStyle + '" id="formFormat">';
            if (!isProfile) formString += '	<div class="f_b_root"><div class="errHandleBox" style="display:none"><p>There are some errors with your form:</p><ul><li></li></ul></div>';
            if (isProfile) formString += '	<div id="fm-aspect-'+aspect.title.replace(/ /g, "-").toLowerCase()+'" class="fm-profile-aspect">';

            if(settings.customProperites && !isProfile){
	        	aspect.title = settings.customProperites.title;
	        	aspect.description = settings.customProperites.description;
	        }

            formString += '		<h1 style="margin:0;" class="frm_formName">' + aspect.title + '</h1>';
            formString += '		<span class="frm_desc">' + aspect.description + '</span>';
            //Loop fields
            if(aspect.properties){
			for (var i = 0; i < aspect.properties.length; i++) {
                var prop = aspect.properties[i];

				if($('.fm-main-window').length > 0) prop.hidden = false;
				if(prop.hidden) prop.fieldType = "hidden";

				prop = methods.validateProperties(prop);

				var prefix = aspect.namespace;
				if (prop.namespace) prefix = prop.namespace;
				if (settings.isSearch) prop.title = prop.title.replace("*", "");
				prop.validPrefix = prefix;

				var groupClass = ""; var innerDivClass = "";
				var labelText = prop.title + "";
				if(prop.mandatory){ if(prop.mandatory == "true" ){ labelText += "*"; } }

				if(prop.className.indexOf("val_slider") >= 0){
					groupClass += "slidervalCss"; innerDivClass=' class="slider-wrapper"';
					if(!prop.id) prop.id = "slider-" + prop.title.replace(" ", "-");
				}
				if(!prop.hidden) formString += '<div class="group '+groupClass+'"><label>' + labelText + '</label><div'+innerDivClass+'>';

				var tPropType = prop.type.split("_")[1];
				if(tPropType == "boolean"){
					prop.fieldType = "radio";
					prop.options = {};
					prop.options.value = [ {"true": "Yes"},{"false": "No"} ];
				}

				if (prop.fieldType == "select" || prop.fieldType == "radio" || prop.fieldType == "checkbox") {

					if(isDebug) console.log("Found select radio checkbox for " + prop.title);

					if(settings.readonly){ prop.fieldType = "readonly"; }

					if (prop.options.service) {

						var downloadUriArr = prop.id.split("/");
						var url = prop.id;
						if(prop.id.indexOf("dropdown/byShareSite") != -1){
							if(settings.useShareProxy){ url = "/share/proxy/alfresco/dropdown/byShareSite?siteid=" + $('.fm-site-id').val(); }
							else{  url = "/alfresco/wcs/dropdown/byShareSite?siteid=" + $('.fm-site-id').val(); }
						}

						$.ajax({
						  url: url,
						  dataType: 'json',
						  data: {},
						  async: false,
						  success: function(r){

								if(r == "0" || r == ""){
									formString += methods.selectTemplate(prop);
								}else{
									var options = [{
										"": "- Select -"
									}];
									var isProfile = false;
									var profileArr = [];
									var profileData = "";
									for (x in r) {
										var row = {};
										row[r[x].key] = r[x].label;
										if (r[x].profile.title) {
											isProfile = true;
										}
										options.push(row);
									}
									//Store Profile Data
									profileData = '';
									if (isProfile) {

										profileData = '<div class="fm-profile-data" style="display:none!important;">' + JSON.stringify(r) + '</div>';
										if (isDebug) console.log("Found Profile on build: " + JSON.stringify(r));

										prop.className += " fm-dynamic-dropdown";

										//Event Trigger for DYNAMIC DROPDOWN
										if(!settings.readonly){
											$('.fm-dynamic-dropdown').livequery("change", function () {
												$(this).addClass("dontPopulateMe");
												$this.find('.fmAspectCollection:eq(0)').val("");
												if ($(this).val() != "") {
													var getProfileData = eval("(" + $(this).parents("div:eq(0)").find(".fm-profile-data").html() + ")");
													methods.dynamicProfileCreate($(this).parents("#my-frm:eq(0)").parent(),  $(this).val(), getProfileData);

												} else {
													$this.find(".fm-connect-container:eq(0)").html("");
												}
												$this.find('.fmAspectCollection:eq(0)').val($this.find('.fmAspectCollection:eq(0)').val() + $this.data('origAspectCollection'));
											});
										}
									}
									prop.options.value = options;

									if(!settings.readonly){ formString += (methods.selectTemplate(prop) + profileData); }
										else{ formString += (methods.readonlyTemplate(prop) + profileData);  prop.fieldType = "done"; }
								}
							},
							error:function (xhr, ajaxOptions, thrownError){
								alert("There was an issue contacting one of the services that populates the dropdown for '" + prop.title + "', please contact your administrator.");
							}
						});

					}else if (prop.fieldType == "select") {
						formString += methods.selectTemplate(prop);
					}
					if (prop.fieldType == "radio") {
						formString += methods.radioCheckTemplate(prop, "radio");
					}
					if (prop.fieldType == "checkbox") {
						formString += methods.radioCheckTemplate(prop, "checkbox");
					}
					if(prop.fieldType == "readonly"){
						formString += methods.readonlyTemplate(prop, false);
					}

				}else if(prop.fieldType == "hidden"){
					formString += methods.hiddenTemplate(prop);
				} else{
					if(settings.readonly){
						formString += methods.readonlyTemplate(prop);
					}else{
						if(prop.className.indexOf("textarea") >= 0){
							formString += '<textarea ' + methods.addGlobalProperties(prop, true) + '></textarea>';
						}else{
							formString += '<input ' + methods.addGlobalProperties(prop, true) + '  value="" />';
						}
					}
				}
				//checkfor tooltip before closing
				if(prop.tooltip){
					formString += '		<span class="fld-tip">'+prop.tooltip+'</span>';
				}
				if(!prop.hidden) formString += '		</div></div>';

				//Create TMP Verified field if needed
				if(prop.className.indexOf("verification") >= 0 && $('.fm-main-window').length <= 0 && settings.isSearch == false){
					var propTmp = prop;
					propTmp.className = propTmp.className.replace("frm-fld", "");
					propTmp.className = propTmp.className.replace("verification", "verification-check");

					formString += '<div class="group-tmp '+groupClass+'"><label>Verify ' + labelText + '</label>';
					formString += '		<div'+innerDivClass+'>';
					formString += '			<input ' + methods.addGlobalProperties(propTmp, true) + '  value="" />';
					formString += '		</div>';
					propTmp = null;
				}
            }
			}
            if (isProfile) formString += '	</div>';
            if (isProfile) $this.find('.fmAspectCollection:eq(0)').val($this.find('.fmAspectCollection:eq(0)').val() + aspect.namespace + "_" + aspect.name + "~");
            if (!isProfile) aspectCollection += aspect.namespace + "_" + aspect.name + "~";

			if (!isProfile) formString += '</div><div class="fm-connect-container"></div></div><input type="hidden" name="frm-aspect-collection" class="fmAspectCollection" value="' + aspectCollection + '" /></form>';
            if ($(".fm-filename")) {
				if(aspect.name.indexOf(":") >= 0){
					aspect.name = aspect.name.split(":")[1];
				}
                $(".prg-aspectname").val(aspect.name);
                $(".prg-aspectprefix").val(aspect.namespace);
                $(".fm-filename, .aspect-name-tip").html(aspect.namespace + ":" + aspect.name);
            }

            return formString;
        },
        onInnerComplete: function () {
            methods.storelocaldata();
			setMasks();
			if( $('.fm-main-window').length > 0){

			}else{
				$( ".val_slider" ).each(function() {
					if($(this).find('option').size() > 0){
						$(this).selectToUISlider();
					}
				});
			}
        },
		readonlyTemplate: function (prop){
			prop.className += " fm-readonly";
			prop.className = prop.className.replace("date", "");

			var tmp = '<input type="text"' + methods.addGlobalProperties(prop, false) + ' readonly="readonly" />';

			return tmp;
		},
		hiddenTemplate: function (prop){
			var tmp = '<input type="hidden" id="' + prop.id + '" title="' + prop.type + '" name="' + prop.validPrefix + "_" + prop.name + '" name="frm-fld ' + prop.validPrefix + "_" + prop.name + '"  value="0" />';
			return tmp;
		},
        selectTemplate: function (prop) {
            var tmp = '<select ' + methods.addGlobalProperties(prop, false) + '>';
            var options = prop.options.value;
            for (x in options) {
                $.each(options[x], function (key, value) {
                    if(value == "- Select -" || value == "-Select-"){
						key = "";
					}
					tmp += '<option value="' + key + '">' + value + '</option>';
                });
            }
            tmp += '</select>';
            return tmp;
        },
        radioCheckTemplate: function (prop, type) {
            var tmp = '';
            var options = prop.options.value;
            for (x in options) {
                $.each(options[x], function (key, value) {
                    tmp += '<input type="' + type + '" ' + methods.addGlobalProperties(prop, false) + ' value="' + value + '"><span class="fld-lbl">' + value + '</span> ';
                });
            }
            return tmp;
        },
		validateProperties: function (prop){

			prop.type = prop.type.replace(":", "_");
			var propType = prop.type.split("_")[1];

            if (!prop.className){
				prop.className = "";
				if(propType == "int" || propType == "long" || propType == "float" || propType == "double" ){
					prop.className = "numOnly";
				}
				if(propType == "date" || propType == "datetime"){
					prop.className = "date";
				}
			}
			if (!prop.id ) prop.id  = "";
			if (!prop.type ) prop.type = "d_text";
			if (!prop.fieldType ) prop.fieldType = "text";
			if(prop.mandatory){
				if(prop.mandatory == "true" || prop.mandatory == true){
					if(prop.className.indexOf("required") < 0){
					prop.className += " required";
					}
				}
			}
			return prop;
		},
        addGlobalProperties: function (prop, addType) {
            var propString, type = "", min = "", max = "", regEx = "";

            if (addType) {
                type = 'type="' + prop.fieldType + '"';
            }
            if ( parseInt( prop.minlength ) > 0) {
                min = 'minlength="' + prop.minlength + '"';
            }
            if ( parseInt( prop.maxlength ) > 0) {
                max = 'maxlength="' + prop.maxlength + '"';
            }
			if (prop.regex) {
                regEx = 'regex="' + prop.regex + '"';
            }

            propString = regEx + ' ' + min + ' ' + max + 'id="' + prop.id + '" title="' + prop.type + '" ' + type + ' class="frm-fld ' + prop.className + '" name="' + prop.validPrefix + "_" + prop.name + '"';
            return propString;
        },
        loadPropertiesToFields: function(nodeObj, $passedForm){
			var settings = $(this).data('settings');
			var $this = $(this);

			if($passedForm){
				settings = $passedForm.data('settings');
				$this = $passedForm;
			}
			var loadAutoCreateFormVal = false;
			$('.frm-fld').each(function () {

				if(settings.readonly) {
					//TODO: ADD READONLY FLAG ON INDIVIDUAL ITEMS
					//$(this).readonly(true);
				}
                if ($(this).hasClass("dontPopulateMe")) {} else {
                    var qName = $(this).attr("name").replace("_", ":") + "";

                    var nodeVal = "";
                    if (nodeObj.node.properties[qName]) {
                        nodeVal = nodeObj.node.properties[qName];
                    }
					if(qName.indexOf("Date") >= 0 || $(this).attr("title").indexOf("date") >= 0 ){
						if(nodeVal != ""){
							var iD = new Date( nodeVal );
							var month = (iD.getMonth() + 1) + "";
							var day = iD.getDate() + "";
							if(parseInt(month) < 9) month = "0" + month;
							if(parseInt(day) < 9) day = "0" + day;
							nodeVal = iD.getFullYear() + "-" + (month) + "-" + day;
						}
					}

                    if ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio") {
                        if ($(this).val() == nodeVal) {
                            $(this).attr("checked", true);
                        }
                    } else {
                        $(this).val(nodeVal);

                        if ($(this).hasClass("fm-dynamic-dropdown")) {
                            //Get profile data
                            var getProfileData = eval("(" + $(this).parents("div:eq(0)").find(".fm-profile-data").html() + ")");
							methods.dynamicProfileCreate($this, nodeVal, getProfileData);
							loadAutoCreateFormVal = true;

                            $(this).addClass("dontPopulateMe");
                        }
                    }
                }
            });
            if(loadAutoCreateFormVal){
            	methods.loadPropertiesToFields(nodeObj, $this);
            }
			//if(settings.readonly) $(".frm-fld").readonly(true);
        },
        loadNode: function (uid, readonly) {
			var $this = $(this);
            var settings = $this.data('settings');
			if(readonly) settings.readonly = readonly;

			if (uid != "") {
	            var uidArr = uid.split("/");
	            var cacheUidNode = $("#fm_store_" + uidArr[uidArr.length-1] );
	            //var cacheUidNode = $(".fm-property-store");

				if( cacheUidNode.length > 0 ) {
					 //CACHED PROPERTY VALUES
					 var objNode = eval( "(" +  cacheUidNode.html() + ")" );
					 methods.loadPropertiesToFields(objNode, $this);
				}else{

	                var getUrl = "/share/proxy/alfresco/form-management/node/get-properties";
	                if(!settings.useShareProxy) url= "/alfresco/wcs/form-management/node/get-properties";

	                if (uid.length > 1) {
	                    $.getJSON(getUrl, {
	                        uid: uid
	                    }, function (nodeObj) {
							var storageId = nodeObj.node.properties["sys:node-uuid"];
							$('body').prepend('<div id="fm_store_'+storageId+'" class="fm-property-store" style="display:none!important">'+ JSON.stringify( nodeObj ) +'</div>');
							methods.loadPropertiesToFields(nodeObj, $this);
	                    });
	                }

	            }
            }
        },
		storelocaldata: function(){
			$('.frm-fld').each(function(){
				if( $(this).attr("title") != ""){
					$(this).data("type", $(this).attr("title") );
					$(this).attr("title", "");
				}
			});
		},
		getFldData: function(node, value){
			var fld = {};

			fld.qname = node.attr("name")  + "";
			fld.value = value;
			fld.type = node.data("type");

			return fld;
		},
        save: function (postSettings, callback) {
			$this = $(this);
			var settings = $(this).data('settings');

            var aspectsArr = $this.find('.fmAspectCollection').val().split("~");
            aspectsArr = $.grep(aspectsArr, function (n) {
                return (n);
            });

			var json = [];
            $this.find('.frm-fld').each(function () {
				var fld = {};

				if ($(this).attr("type") == "radio") {
					if ($(this).is(':checked')) {
						fld = methods.getFldData($(this), $(this).val().replace('"', '||') );
					}
				} else if($(this).attr("type") == "checkbox" ){

					if( !$(this).hasClass("fm-dealt-with-store")){

						var t = new Array();

						$this.find("input[name='"+ $(this).attr("name") +"']").each(function(){
							$(this).addClass("fm-dealt-with-store");

							if ($(this).is(':checked')) {
								t.push( $(this).val().replace('"', '||') );
							}
						});
						fld = methods.getFldData($(this), t );
					}
				}else{
					fld = methods.getFldData($(this), $(this).val().replace('"', '||') );
				}
				if(fld.qname) json.push(fld);
            });

			$(".fm-dealt-with-store").removeClass("fm-dealt-with-store");

			postSettings.storeObj = JSON.stringify(json);
			postSettings.aspects  = JSON.stringify(aspectsArr);

			$.post(settings.postUrl, postSettings, function (e) {
                if (settings.onSaveComplete) settings.onSaveComplete($this);
                if (callback) callback(e);

            }, "json");
        },

        destroy: function () {
            return this.each(function () {
                var $this = $(this),
                    data = $this.data('form');
                // Namespacing FTW
                $(window).unbind('.form');
                data.form.remove();
				$this.removeData('settings');
                $this.removeData('form');
            })
        }
    };
    $.fn.form = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            if(isDebug) console.log('Method ' + method + ' does not exist on jQuery.form');
        }
    };

})(jQuery);