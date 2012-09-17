/* End of jQuery Plugin */
var aspectIndex = null;
var jsonObjModel = null;

function escapeFn(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function formToJson(){
	$(".fm-connect-container").html("");
	$(".fm-dynamic-dropdown").removeClass("fm-dynamic-dropdown");
	$(".dontPopulateMe").removeClass("dontPopulateMe");
	$(".fmAspectCollection").remove();
	$(".fm-profile-data").remove();

	fmErrLog = [];
	isFmValid = true;

	//Start JSON Form Object
	var jObj = {};
		jObj.title = escapeFn( $('.frm_formName').text() );
		jObj.visible = true;
		if( $('#my-frm').hasClass('prg-dummy-aspect') ) jObj.dummy = true;

		if(jObj.dummy){ jObj.namespace = $('.prg-aspectprefix-text').val();  }else{  jObj.namespace = $('.prg-aspectprefix').val(); }

		jObj.name = $('.prg-aspectname').val();
		jObj.description = escapeFn($('.prg-desc').val());
		jObj.formStyle = $('#formFormat').attr("class");
		jObj.isHidden = $('#my-frm #formFormat').hasClass("fm-aspect-hidden");

	var properties = new Array();
	var frmHTML = $('#formBuilderObj').html();

	$('.group').each(function(){

		var fieldObj = {};
		var input = $(this).find('.frm-fld:eq(0)');
		var propFullname = input.attr('name').split("_");
		var typeFullname = input.attr('title');

		fieldObj.title = escapeFn( $(this).find('label').text().replace("*", "") );
		if($(this).find('.fld-tip').length > 0)  fieldObj.tooltip = escapeFn( $(this).find('.fld-tip').html() );
		fieldObj.regex = input.attr('regex');
		fieldObj.minlength = parseInt(input.attr('minlength'));
		fieldObj.maxlength = parseInt(input.attr('maxlength'));
		fieldObj.className =  input.attr('class').replace(/frm-fld/g, "").replace(/undefined/g, "").replace(/hasDatepicker/g, "");

		fieldObj.multiple = false;
		if(input.hasClass('alf-multiple')) fieldObj.multiple = true;

		fieldObj.dummyfield = false;
		if(input.hasClass('alf-dummyfield')) fieldObj.dummyfield = true;

		fieldObj.mandatory = false;
		if(input.hasClass('required')) fieldObj.mandatory = true;
		if(input.hasClass('frm-hidden')) fieldObj.hidden = true;
		if(input.hasClass('frm-hiddenSearch')) fieldObj.hiddenSearch = true;

		if(input.hasClass('alf-index')){
			fieldObj.index = {};
			fieldObj.index.atomic = false;
			fieldObj.index.stored = false;
			fieldObj.index.tokenised = false;

			if(input.hasClass('alf-inx-atomic')) 	fieldObj.index.atomic = true;
			if(input.hasClass('alf-inx-stored')) 	fieldObj.index.stored = true;
			if(input.hasClass('alf-inx-tokenized')) fieldObj.index.tokenized = true;
		}

		fieldObj.name = propFullname[1];
		fieldObj.namespace = propFullname[0];

		fieldObj.type= typeFullname;
		fieldObj.fieldType = input.attr('type');
		fieldObj.id = input.attr('id');

		//Validate Model Requirements
		if(typeFullname == ""){
			isFmValid = false;
			fmErrLog.push("" + fieldObj.title + " is missing an Alfresco data type");
		}
		if(propFullname.length < 2 || propFullname[0] == "" || !propFullname[1] || propFullname[1] == ""){
			isFmValid = false;
			fmErrLog.push("" + fieldObj.title + " is missing an Alfresco property name");
		}


		//Get collections for checkboxes, radio and select
		if(input.hasClass('select') || input.attr('type') == "radio" || input.attr('type') == "checkbox" ){
			fieldObj.options = {};
			fieldObj.options.service = false;

			if(input.hasClass('hasPopScript')){
				fieldObj.options.service = true;
				fieldObj.options.value = [];

			}
		}

		if(input.hasClass('select')){
			fieldObj.fieldType = "select";
			fieldObj.options.value = new Array();

			$('option', input).each(function() {
				var ob = {};
				ob[$(this).val()] =  $(this).text();
				fieldObj.options.value.push(ob) ;
			});
		}
		if(input.attr('type') == "radio"){
			var par = input.parents("div:eq(0)");
			fieldObj.fieldType = "radio";
			fieldObj.options.value = new Array();

			$('.frm-fld', par).each(function() {
				var ob = {};
				ob[$(this).val()] =  $(this).val();
				fieldObj.options.value.push(ob) ;
			});
		}
		if(input.attr('type') == "checkbox"){
			var par = input.parents("div:eq(0)");
			fieldObj.fieldType = "checkbox";
			fieldObj.options.value = new Array();

			$('.frm-fld', par).each(function() {
				var ob = {};
				ob[$(this).val()] =  $(this).val();
				fieldObj.options.value.push(ob) ;
			});
		}

		//fieldObj.alfType = input.attr('type');
		//fieldObj.alfPropertyName = input.attr('id');
		properties.push(fieldObj);
	});
	jObj.properties = properties;
	return jObj;
}

/* Pulls an aspect object out of a model */
function getAspect(model, aspect){
	var index = 0;
	for (var i=0; i < model.aspects.length; i++) {
		if(model.aspects[i].name == aspect){
			index = i;
		}
	}
	aspectIndex = index;

	return model.aspects[index];
}


/* NOT FOR jQuery PLUGIN */
/* Replaces an aspect with new aspect */
function updateAspect(model, aspectObj){
	var aspect = aspectObj.name;
	var index = 0;
	for (var i=0; i < model.aspects.length; i++) {
		if(model.aspects[i].name == aspect){
			index = i;
		}
	}
	model.aspects[index] = aspectObj;
	return model;
}

function sortUL($item)
{
	var mylist = $item;
	var listitems = mylist.children('li').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { mylist.append(itm); });
}

/* NOT FOR jQuery PLUGIN */
/* Saves aspect back to model and stores XML and JSON */
function saveAspectToObj(obj, aspect){

	fmModelObj = updateAspect(obj, aspect);
	var jsonString = JSON.stringify(fmModelObj);
		jsonString = jsonString.replace(/\\'/g, "\'");

	$('.json').html(jsonString);

	var xmlString = "";

	var uidJson = $('.uid-json').val();
	var uidModel = $('.uid-model').val();

	$('.infoMessage span').html("Please wait...");
	$('.infoMessage').fadeIn(300);
	$('.infoMessage').center();

    $.ajax({
		  url: "/alfresco/wcs/form-builder/saveJsonForm",
		  type: "POST",
		  dataType:"html",
		  data: { uidModel:uidModel, jsonString:jsonString, uidJson: uidJson },
		  success: function(d){
				if(d == "0"){
					$('.infoMessage span').html("You do not have the appropriate permissions on this model to save. Contact your administrator.");
					$('.infoMessage').addClass("bad").center();
					setTimeout("$('.infoMessage').fadeOut(1000, function(){ $('.infoMessage').removeClass('bad');  });", 3000);

				}else{
					$('.infoMessage span').html("Saved Successfully");
					$('.infoMessage').addClass("good").center().fadeOut(1000, function(){
						$('.infoMessage').removeClass("good");
					});
				}
				//location.reload(true);
		  },
		  error:function (xhr, ajaxOptions, thrownError){
				$('.infoMessage span').html("There was a problem validating the model, one or more properties maybe in use.");
			    $('.infoMessage').addClass("bad").center();
				setTimeout("$('.infoMessage').fadeOut(1000, function(){ $('.infoMessage').removeClass('bad');  });", 3000);
		  }
	  });
}

$(function(){
	sortUL($('#titles ul') );
});

/* NOT FOR jQuery PLUGIN */
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", 200);
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
}
