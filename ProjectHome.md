# Last Updated: 2012-11-29 #

Author Mike Priest

  * FM Alfresco Version 1.3.4.1
  * FM Share Extension 1.2.5

[Release Notes](ReleaseNotes.md)

# Installation #

# Install the form-management AMP.
# Under Data Dictionary/Models create two spaces:
  * Constraints
  * JsonModels

URL to the admin: http://localhost/alfresco/wcs/form-builder/home

# Share extension project #

The share project extension contains:

  1. Side by side FM edit metadata screen
  1. New Search setup page in the FM Console (Replaces Alfreso's advanced search with the FM search)
  1. FM Demo Dashlet
[Click here to learn more about the Share project](ShareExtensionProject.md)

# Features #
  1. Changes to the one form persist across all form references (search, document library)
  1. Show/hide aspects without restarting the server
  1. Multi-valued fields automatically allow for multiple input (tag like interface)
  1. WYSIWYG content types
  1. Advanced Search replacement
    1. Search filtering
    1. Search field options
  1. UI for Content Model building
  1. Works in both Alfresco and Share webscripts
  1. Allows for external applications to be used as services for list lookups
  1. Relational data profiles built in (Select one field, gives you a collection of aspects more)
  1. Full control of the usability of forms (Labeling, tips, validation, verification, jQuery UI goodness such as calendars, masks, sliders etc...)
  1. Built-in client side validation using jquery
  1. Removes constraints from Alfresco
  1. API to search for aspect properties, profiles and more (JSON Content model)
  1. Built-in Dropdown manager
  1. Designer control (quick form styling left, right, top align labels and WELL formed HTML output and class names for optimal customization
  1. Rapid form deployment
  1. Search API using URL addressable variables (?dmo\_search=parameter value)
  1. NEW: Search auto replaces date fields e.g. (FROM DATE - TO - TO DATE)
  1. NEW: Contextual visibility
    1. On/off search toggle allows us to show/hide fields when the form is in the search context
    1. Other contextual triggers allow us to provide functionality much like the search; Search context also removes all required information and replaces the date field to allow for date ranges
  1. VERY Flexible!


# Share Form Extension - Alfresco 4 #

This is the most common question I get. So I have made a quick extension to show your FM Form in the Share edit metadata screen using the NEW drawOptions to keep it simple.

Make sure you have updated to at least 1.2.7. Also NOTE: If you haven't installed the demo dashlet you require the save webscript which is also in the Share Extension.zip file.

NEW: In the form builder under alfresco properties for Aspect there is a hidden attribute for this new feature. It allows you to show and hide aspects built from the drawOptions

For more information go here [GettingFormsWorkingInShare](GettingFormsWorkingInShare.md)
and don't forget to download the Alf4\_Share Form Extension\_1\_0\_0.zip from the downloads section!

# What is Form Management? #

Form Management is the introduction of a new manageable layer between Alfresco's content model and the end user. To get metadata on a document we require some user input. The FM Module allows us to create these forms and expose them as a service so that we can use the forms over and over again with little effort.

FM allows us to take control of the Usability, Design, Validation and verification used in today's modern forms. By splitting these layers up we can now take advantage of the following:

  1. UI representation of form data can be completely custom (e.g. Using a slider, calendar, etc...)
  1. Save time and effort creating forms and models (manage it in one place, manage the form = managing the model)
  1. Move work over to the business area. Administrative staff can easily manage the forms themselves
  1. Usability is in your complete control (Drag and drop order of fields, add help tips, create input masks so that data entry requires minimal skill and human error is minimized)
  1. Use the same form on a different domain, outside Alfresco and manage it all in one place

# So what have we accomplished? #

  * Moved Constraints out of the model into a manageable service (Allows more than one aspect to use the same list, allows external lists to be used from other applications AND allows edit and removal of current constraints as this is no longer stored in the content model)
  * JSON Representation of a content model allows us to query it and grab information via webscripts without dealing with XML parsing
  * Allows for dependent information such as document type -> aspect collection (profiles)
  * Allows for much better usability and validation
  * Allows for completely new development on data respresentation e.g. (A slider can be used for integer or list values; check out the slider example in the form builder)
  * UI for managing forms and form validation
  * Both front end and back end node validation based upon given aspects or collections i.e. We can easily check if a node validates against a particular profile or aspect(s) even if it does not have it.
  * Allows for quick aspect management i.e. A node can have many aspects or profiles but in your application you may only want to deal with certain aspects at certain points. Using the FM Module you can show one, two or as many aspects are you like and deal with those aspects in an orderly fashion if you want! (Complete freedom over metadata and collections of data
  * Share site silos. The dropdown by share site feature allows you to show lists based upon share site. This allows each share site to have its own document types and profiles.


# Screen Shots #
![http://alfresco-form-model-management.googlecode.com/files/Form-Builder.png](http://alfresco-form-model-management.googlecode.com/files/Form-Builder.png)
![http://alfresco-form-model-management.googlecode.com/files/Previewer.png](http://alfresco-form-model-management.googlecode.com/files/Previewer.png)
![http://alfresco-form-model-management.googlecode.com/files/Model-Builder.png](http://alfresco-form-model-management.googlecode.com/files/Model-Builder.png)

# Development Requirements #

  1. jQuery
  1. Alfresco REST services
  1. Freemarker

To get your form up and running on existing applications you only need as little as 3 lines of init code:

```
$('').form({
'aspects': aspectObject
});
```

# Alfresco Version(s) #
Community 3.2
Community 3.2r
Community 3.3.x
Community 3.4.x
Enterprise 3.2
Enterprise 3.2r
Enterprise 3.3.x
Enterprise 3.4.x
Enterprise 4.0.x