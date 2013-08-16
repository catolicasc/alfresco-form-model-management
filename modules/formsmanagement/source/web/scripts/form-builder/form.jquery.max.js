/*  Alfresco Form Creator
    Copyright (c) 2011 Mike Priest
	Licensed under the MIT license
	Version: 1.0.3 (28/11/2011 16:01:37)

	Plugin: jQuery.form

	Dependant Plugins:
	selectToUISlider (Used for custom Dropdown menu to jQuery slider)

*/
(function ($) {
    var globalKey = ""; var cacheProfileAspect= {};
	var isConnect = false; var isDebug = false;
	var defaultSettings = {

        'aspects': [],
        'profile': null,
        'drawOptions': {
        	'nodeRef': '',
        	'drawNodeAspects': false
        },
        'handler': '.handler',
        'isSearch': false,
        'postUrl': '/share/proxy/alfresco/form-management/formdata/save',
        'useShareProxy': true,
        'nestAspects': false,
        'customProperites': null,
        'connect': "",
        'readonly': false,
        'ownDropSource': false,
		'onComplete': null,
        'onSaveComplete': null,
		'onDynamicLoad': null,
		'demoMode': false,
		'cacheNodeProperties': true,
		'siteid': ''
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
									methods.dynamicProfileCreate($(this).parents('.group:eq(0)'),  $(this).val(), getProfileData);

								} else {
									$this.find(".fm-connect-container:eq(0)").html("");
								}

								fmAspectNode.val(fmAspectNode.val() + $this.data('origAspectCollection'));
								if(settings.onDynamicLoad) settings.onDynamicLoad( $(settings.handler) );
							});
						}
					}

					if (settings.aspects.length > 0) {
						//Load aspects if we are deailing with aspect only
						var formS = "";
						for (a in settings.aspects) {
							formS += methods.buildAspect($this, settings.aspects[a], settings.nestAspects);
						}
						$this.html(formS);
						$this.data('origAspectCollection', $this.find('.fmAspectCollection:eq(0)').val() + "");
						methods.onInnerComplete();

					} else if(settings.drawOptions.drawNodeAspects){

						var nodeRef = settings.drawOptions.nodeRef;
						//Must have a node
						if(nodeRef != ""){
							var json = methods.callNodeProperties(nodeRef, $this);
							if(json.node.properties['ua:sitecontext'] && json.node.properties['ua:sitecontext'].length > 1) settings.siteid = json.node.properties['ua:sitecontext'] + "-site";

							//Massage data
							for(i in json.node.aspects){
								json.node.aspects[i] = json.node.aspects[i].replace(":", "_");
							}

							var concatAspects = json.node.aspects.join("~");
							var aspectpropurl = "/share/proxy/alfresco/model/aspects/aspecttoproperty";
							if(!settings.useShareProxy) aspectpropurl= "/alfresco/wcs/model/aspects/profiletoproperty";

							//Go get the profile needed
							$.ajax({
								  url: aspectpropurl,
								  dataType: 'json',
								  data: { aspects: concatAspects },
								  async: false,
								  success:  function (r) {
										settings.aspects = r;
								  }
							});

							//Build form on aspects
							var formS = "";
							for (a in settings.aspects) {
								formS += methods.buildAspect($this, settings.aspects[a], false);
							}

							$this.html(formS);
							$this.data('origAspectCollection', $this.find('.fmAspectCollection:eq(0)').val() + "");
							methods.onInnerComplete();

						}else{
							alert("If you are using drawNodeAspects property it requires a nodeRef to load from!");
						}
					}

					if (settings.onComplete) settings.onComplete($this);
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
			var settings = $this.parents("#my-frm:eq(0)").parent().data('settings'); 
			  
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
							formS += methods.buildAspect($this.parents("#my-frm:eq(0)").parent(), r[a], true);
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
									formS += methods.buildAspect($this.parents("#my-frm:eq(0)").parent(), r[a], true);
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
			if(settings.customFormStyle) { formStyle= settings.customFormStyle }

            var formString = "";
			var dummyAspect = "";
			if(aspect.dummy) dummyAspect = "prg-dummy-aspect";

            if(isProfile){
            	//if profile remove built aspects that the profile will re-build
            	$('.frm-aspect-'+ aspect.namespace + "-" + aspect.name ).remove();
			}

			if(settings.demoMode && aspect.dummy){ $('.prg-aspectprefix').hide(); $('.prg-aspectprefix-text').show(); }

            if (!isProfile) formString += '<form name="" class="frm-aspect-'+ aspect.namespace + "-" + aspect.name +' '+ dummyAspect +'" id="my-frm" method="POST">';
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

				if(prop.hiddenSearch && settings.isSearch) prop.hidden = true;
				if($('.fm-main-window').length > 0) prop.hidden = false;
				if(prop.hidden) prop.fieldType = "hidden";

				prop = methods.validateProperties(prop);

				var labelText = prop.title + "";
				var prefix = aspect.namespace;
				if (prop.namespace) prefix = prop.namespace;
				if (!settings.isSearch){
					if(prop.mandatory || prop.className.indexOf("required") >= 0) labelText += '<span class="fld-required-lbl">*</span>';
				}
				prop.validPrefix = prefix;

				var groupClass = ""; var innerDivClass = "";

				if(prop.className.indexOf("val_slider") >= 0){
					groupClass += "slidervalCss"; innerDivClass=' class="slider-wrapper"';
					if(!prop.id) prop.id = "slider-" + prop.title.replace(" ", "-");
				}

				if(prop.className.indexOf("mceEditor") >= 0){
					groupClass += "has-mce-editor"; innerDivClass=' class="mce-editor-wrapper"';
				}

				var dummyClass= '';
				if(prop.className.indexOf("alf-dummyfield") >= 0) dummyClass += 'alf-dummy-group';

				if(!prop.hidden) formString += '<div class="group '+groupClass+' '+dummyClass+'"><label>' + labelText + '</label><div'+innerDivClass+'>';

				var tPropType = prop.type.split("_")[1];
				if(tPropType == "boolean"){
					prop.fieldType = "checkbox";
					prop.options = {};
					prop.options.value = [ {"true": ""} ];
				}

				if (prop.fieldType == "select" || prop.fieldType == "radio" || prop.fieldType == "checkbox") {

					if(isDebug) console.log("Found select radio checkbox for " + prop.title);

					if(settings.readonly){ prop.fieldType = "readonly"; }

					if (prop.options.service) {

						var downloadUriArr = prop.id.split("/");
						var url = prop.id;

						if(settings.demoMode){
							//Replace share service with alfresco
							url = url.replace("/share/proxy/alfresco", "/alfresco/wcs");
						}
						if(prop.id.indexOf("dropdown/byShareSite") != -1){
							var siteid = $('.fm-site-id').val();
							if(settings.siteid.length > 1) siteid = settings.siteid;
							if(settings.useShareProxy){ url = "/share/proxy/alfresco/dropdown/byShareSite?siteid=" + siteid; }
							else{  url = "/alfresco/wcs/dropdown/byShareSite?siteid=" + siteid; }
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
										if(r[x].profile){
											if (r[x].profile.title) {
												isProfile = true;
											}
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
													methods.dynamicProfileCreate($(this).parents('.group:eq(0)'), $(this).val(), getProfileData);

												} else {
													$this.find(".fm-connect-container:eq(0)").html("");
												}
												$this.find('.fmAspectCollection:eq(0)').val($this.find('.fmAspectCollection:eq(0)').val() + $this.data('origAspectCollection'));

												if(settings.onDynamicLoad) settings.onDynamicLoad( $('.fm-dynamic-dropdown') );
											});
										}
									}
									prop.options.value = options;

									if(settings.readonly){
										formString += (methods.readonlyTemplate(prop) + profileData);  prop.fieldType = "done";
									}else{

										if(prop.fieldType == "select"){
										  	formString += (methods.selectTemplate(prop) + profileData);
										}else if( prop.fieldType == "radio" ){
											formString += (methods.radioCheckTemplate(prop, "radio") + profileData);
										}else if( prop.fieldType == "checkbox" ){
											formString += (methods.radioCheckTemplate(prop, "checkbox") + profileData);
										}
									}
								}
							},
							error:function (xhr, ajaxOptions, thrownError){
								alert(prop.fieldType + "There was an issue contacting one of the services that populates the dropdown for '" + prop.title + "', please contact your administrator.");

								if(prop.fieldType == "select"){
								  	formString += (methods.selectTemplate(prop));
								}else if( prop.fieldType == "radio" ){
									formString += (methods.radioCheckTemplate(prop, "radio"));
								}else if( prop.fieldType == "checkbox" ){
									formString += (methods.radioCheckTemplate(prop, "checkbox"));
								}
							}
						});

					}else if (prop.fieldType == "select") {
						formString += methods.selectTemplate(prop);
					}else if (prop.fieldType == "radio") {
						formString += methods.radioCheckTemplate(prop, "radio");
					}else if (prop.fieldType == "checkbox") {
						formString += methods.radioCheckTemplate(prop, "checkbox");
					}
					if(prop.fieldType == "readonly"){
						formString += methods.readonlyTemplate(prop, false);
					}

				}else if(prop.fieldType == "hidden"){
					formString += methods.hiddenTemplate(prop);
				}else{
					if(settings.readonly){
						formString += methods.readonlyTemplate(prop);
					}else{
						if(prop.className.indexOf("textarea") >= 0){
							formString += '<textarea ' + methods.addGlobalProperties(prop, true) + '></textarea>';
						}else{
							formString += '<input ' + methods.addGlobalProperties(prop, true) + '  value="" />';

							if(settings.isSearch && prop.className.indexOf("date") >= 0){
								 prop.name = prop.name + "_toDate";
								 prop.id = prop.name + "_toDateId";
								 formString += '<span style="color:#aaa; font-size:11px;"> to </span><input ' + methods.addGlobalProperties(prop, true) + '  value="" />';
							}
						}
					}
				}
				//checkfor tooltip before closing
				if(prop.tooltip){
					formString += '		<span class="fld-tip">'+prop.tooltip+'</span>';
				}
				if(!prop.hidden) formString += '		</div><div class="fm-connect-container"></div></div>';
				//End group div here

				//Create TMP Verified field if needed
				if(prop.className.indexOf("verification") >= 0 && $('.fm-main-window').length <= 0 && settings.isSearch == false){
					var propTmp = prop;
					propTmp.className = propTmp.className.replace("frm-fld", "");
					propTmp.className = propTmp.className.replace("verification", "verification-check");

					formString += '<div class="group-tmp '+groupClass+'"><label>Verify ' + labelText + '</label>';
					formString += '		<div'+innerDivClass+'>';
					formString += '			<input ' + methods.addGlobalProperties(propTmp, true) + '  value="" />';
					formString += '		</div></div>';
					propTmp = null;
				}
            }
			}
            if (isProfile) formString += '	</div>';
            if (isProfile) $this.find('.fmAspectCollection:eq(0)').val($this.find('.fmAspectCollection:eq(0)').val() + aspect.namespace + "_" + aspect.name + "~");
            if (!isProfile) aspectCollection += aspect.namespace + "_" + aspect.name + "~";

			if (!isProfile) formString += '</div><div class="fm-connect-container"></div></div><input type="hidden" name="frm-aspect-collection" class="fmAspectCollection" value="' + aspectCollection + '" /></form>';
            if (settings.demoMode) {
				if(aspect.name.indexOf(":") >= 0){
					aspect.name = aspect.name.split(":")[1];
				}
                $(".prg-aspectname").val(aspect.name);
                $(".prg-aspectprefix, .prg-aspectprefix-text").val(aspect.namespace);
                $(".fm-filename, .aspect-name-tip").html(aspect.namespace + ":" + aspect.name);
            }

            return formString;
        },
        onInnerComplete: function () {

			setMasks();
			if( $('.mceEditor').length > 0 ){
				setTinyMce();
			}
			if( $('.fm-main-window').length > 0){
				
			}else{
				$( ".val_slider" ).each(function() {
					if($(this).find('option').size() > 0){
						$(this).selectToUISlider();
					}
				});
				methods.storelocaldata();
			}
			
			$('.tagsinput').remove();
			$('input[type=text].alf-multiple').tagsInput({width:'auto'});
        },
		readonlyTemplate: function (prop){
			prop.className += " fm-readonly";
			prop.className = prop.className.replace("date", "");

			var globalProps = methods.addGlobalProperties(prop, false);
			var tmp = '<input type="text"' + globalProps + ' readonly="readonly" />';

			if(prop.className.indexOf("mceEditor") != -1 ){
				tmp = '<div id="' + prop.id + '"' + ' class="readonly-html-out frm-fld ' + prop.className + '" name="' + prop.validPrefix + "_" + prop.name + '"></div>';
			}

			return tmp;
		},
		hiddenTemplate: function (prop){
			var tmp = '<input type="hidden" id="' + prop.id + '" title="' + prop.type + '" name="' + prop.validPrefix + "_" + prop.name + '" class="frm-fld ' + prop.validPrefix + "_" + prop.name + '"  value="0" />';
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
					if(key != "" || options.length == 1) tmp += '<input type="' + type + '" ' + methods.addGlobalProperties(prop, false) + ' value="' + key + '"><span class="fld-lbl">' + value + '</span> ';
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
            var propString, type = "", min = "", max = "", regEx = "", readonly = "";

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
			if( prop.readonly ){
				readonly = 'readonly="' + prop.readonly + '"';
			}
			 
            propString = regEx + ' ' + min + ' ' + max + 'id="' + prop.id + '" title="' + prop.type + '" ' + type + ' class="frm-fld ' + prop.className + '" name="' + prop.validPrefix + "_" + prop.name + '" ' + readonly;
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

                    if(typeof nodeObj.node.properties[qName] == "object"){
						nodeVal = nodeObj.node.properties[qName];
                    }else if( nodeObj.node.properties[qName] ) {
                        nodeVal = nodeObj.node.properties[qName];
                    } 
                    if( nodeVal == null ) nodeVal == "";
                    
                    
                    if( $(this).hasClass('alf-multiple') && (nodeVal instanceof Array)){
				    	
	                    	$(this).val( nodeVal.join(',') );
	                    	$('.tagsinput').remove(); 
	                    	$('input[type=text].alf-multiple').tagsInput({width:'auto' });
                    	
				    }else if( $(this).hasClass('mceEditor') ){

						if(settings.readonly){
							$(".readonly-html-out").html(nodeVal);
						}else{
							$(this).val(nodeVal);
						}
					}else{
					    var hasDateType = false;

					    if( $(this).data("type") ){
					    	if( $(this).data("type").indexOf("date") != -1 ) hasDateType = true;
					    }
					    
						if( hasDateType || $(this).hasClass("date") ){
							 
							if(settings.isSearch)
							{
								if(nodeVal.indexOf("-TO-") > 0){
									var splitVal = nodeVal.split("-TO-");

									$("input[name='"+ $(this).attr('name') + "_toDate']").val( splitVal[1]);
									nodeVal = splitVal[0];
								}

								//Already loaded prior
								if( $(this).attr('name').indexOf('_toDate') > 0 ) nodeVal = $(this).val();

							}else{
								if(nodeVal != "" && nodeVal != null){
									var iD = new Date( nodeVal );
									var month = (iD.getMonth() + 1) + "";
									var day = iD.getDate() + "";
									if(parseInt(month) <= 9) month = "0" + month;
									if(parseInt(day) <= 9) day = "0" + day;
									nodeVal = iD.getFullYear() + "-" + (month) + "-" + day;
								}
							}
						}


	                    if ($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio") {

							$(this).attr("checked", false);
							if( $(this).data("type") == "d_boolean" )
							{
								if( nodeVal === true || nodeVal == "true" ) $(this).attr("checked", true);
							}
							else
							{
								if(typeof nodeObj.node.properties[qName] == "object"){
									for(i in nodeVal){
										if ($(this).val() == nodeVal[i]) $(this).attr("checked", true);
									}
								}else{
									if ($(this).val() == nodeVal) $(this).attr("checked", true);
								}
							}
	                    } else {
	                        decoded = $("<div/>").html(nodeVal).text();

	                        $(this).val(decoded);

	                        if ($(this).hasClass("fm-dynamic-dropdown")) {
	                            //Get profile data
	                            var getProfileData = eval("(" + $(this).parents("div:eq(0)").find(".fm-profile-data").html() + ")");
								methods.dynamicProfileCreate($(this).parents('.group:eq(0)'), nodeVal, getProfileData);
								loadAutoCreateFormVal = true;

	                            $(this).addClass("dontPopulateMe");
	                        }
	                    }
	            	}
                }
            });
            if(loadAutoCreateFormVal){
            	methods.loadPropertiesToFields(nodeObj, $this);
            }
			//if(settings.readonly) $(".frm-fld").readonly(true);
        },
        callNodeProperties : function(uid, $this){

			var settings = $this.data('settings');

        	var json = null;
        	var getUrl = "/share/proxy/alfresco/form-management/node/get-properties";
            if(!settings.useShareProxy) url= "/alfresco/wcs/form-management/node/get-properties";

            if (uid.length > 1) {
				$.ajax({
					url: getUrl,
					dataType: 'json',
					async: false,
					data: { uid: uid },
					success: function(nodeObj) {
						json = nodeObj;
						var storageId = nodeObj.node.properties["sys:node-uuid"];
						$('body').prepend('<div id="fm_store_'+storageId+'" class="fm-property-store" style="display:none!important">'+ JSON.stringify( nodeObj ) +'</div>');
					}
				});
            }

            return json;
        },
        loadNode: function (uid, readonly, callback) {
			var $this = $(this);
            var settings = $this.data('settings');
			if(readonly) settings.readonly = readonly;

			if (uid != "") {
	            var uidArr = uid.split("/");
	            var nodeObj = null;
	            var cacheUidNode = $("#fm_store_" + uidArr[uidArr.length-1] );
	            //var cacheUidNode = $(".fm-property-store");

				if( cacheUidNode.length > 0 && settings.cacheNodeProperties) {
					 //CACHED PROPERTY VALUES
					 nodeObj = eval( "(" +  cacheUidNode.html() + ")" );
					 methods.loadPropertiesToFields(nodeObj, $this);
				}else{
	                 nodeObj = methods.callNodeProperties(uid, $this);
	                 methods.loadPropertiesToFields(nodeObj, $this);
	            }
				
				if(settings.readonly){
					if(nodeObj.associations.length > 0){
						
						if( $('.fm-associations').length == 0) $(this).append('<div class="fm-associations"><h2>Associations</h2></div>');
						
						for(a in nodeObj.associations){
							$('.fm-associations').append( methods.fileAssosicatedTemplate ( nodeObj.associations[a] ) );
						}
					}
				}
            }
			if(callback) callback( $this );
        },
        
        fileAssosicatedTemplate : function (node){
        	
        	var icoImg = '/share/res/components/images/filetypes/'+node.fileType+'-file-32.png';
        	if(node.icon.indexOf('default') > 0) icoImg = '/alfresco' + node.icon;
        	
        	var tmp = '<div class="assoc-item"><div class="doc-search-icon" id="'+node.nodeRef+'"><a href="#"><img src="'+icoImg + '">		</a>	</div><div><h3> ';
        		tmp += '<a href="document-details?nodeRef='+node.nodeRef+'"class="theme-color-1 ua-res-doc-title">'+node.name+'</a>';
        		tmp += '</h3>';
        	    if(node.siteid) tmp += '<span>Site: <a href="/share/page/site/'+node.siteid+'/dashboard">'+ node.siteid+'</a>, ';
        	    tmp += 'size: '+node.size +'</span></div></div></div><p class="clear"></p></div>';
        	
        	    return tmp;
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
			fld.type = node.data("type");
			fld.value = (value);
			  
			if(value == "") fld.value = null;
			if(node.hasClass('alf-multiple'))  fld.value = value.split(',');
			
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
				
				if( ! $(this).hasClass("readonly")) {
					 
					if ($(this).hasClass("mceEditor") ) {
	
						var mceId = $(this).attr("id");
							htmlval= tinyMCE.get(mceId).getContent();
						$(this).val(htmlval );
					}
	
					if ($(this).attr("type") == "radio") {
						if ($(this).is(':checked')) {
							fld = methods.getFldData($(this), $(this).val() );
						}
					} else if($(this).attr("type") == "checkbox" ){
	
						if( !$(this).hasClass("fm-dealt-with-store")){
	
							if( $(this).val() != "true" && $(this).val() != "false" ){
								var t = new Array();
	
								$this.find("input[name='"+ $(this).attr("name") +"']").each(function(){
									$(this).addClass("fm-dealt-with-store");
	
									if ($(this).is(':checked')) {
										t.push( $(this).val() );
									}
								});
							}else{
	
								var t = false;
								if ($(this).is(':checked')) {
									var t = true;
								}
							}
							fld = methods.getFldData($(this), t );
						}
					}else{ 
						var t = $(this).val(); 
						if(t != null) fld = methods.getFldData($(this), t ); 
					}
					if(fld.qname) json.push(fld);  
				}
            });

			$(".fm-dealt-with-store").removeClass("fm-dealt-with-store");

			postSettings.storeObj = JSON.stringify(json);
			postSettings.aspects  = JSON.stringify(aspectsArr);

			$.ajax({
                type: "POST",
                url: settings.postUrl,
                dataType:"json",
                data: postSettings,
                success:function(e){
                    if (settings.onSaveComplete) settings.onSaveComplete($this);
					if (callback) callback(e);
                },
                error:function (xhr, ajaxOptions, thrownError){
                    var e = {}
						e.failed = 1;
						e.error = 500;
					if (settings.onSaveComplete) settings.onSaveComplete(e);
					if (callback) callback(e);
                }
            }); 
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