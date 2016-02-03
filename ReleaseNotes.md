# Details #

**Next release**
  * Read-only added to validation list

**Nov 29 2012 - Share extension WCS 1.2.5**
  * Fixes for 4.2 Community

**Sept 12 2012 - FM Module WCS 1.3.4.1**
  * Bug found by anhthan748. Creating aspects on new models was causing issues with validation.

**Aug 30 2012 - FM Module WCS 1.3.4**
  * Added validation when deleting aspects from the model manager, JSON was being corrupted as it was deleting the aspect from JSON and not the model when aspects were in use

**Aug 30 2012 - FM Module WCS 1.3.3**
  * Fixed issue with option service for checkboxes and radio buttons
  * NOTE: Please use multiple option in alfresco field properties when using multi checkboxes as it stores values in an array form

**Aug 19th 2012 - FM Module WCS 1.3.1**
  * Added HTML (TinyMCE) editor field in predefined fields

**July 18th 2012 - FM Module WCS 1.3.0**
  * Minor search fix (URL encoding between Share and Alfresco)
  * Added simple vs detail toggle in search

**July 13th 2012 - FM Module WCS 1.2.9**
  * Added advanced search replacement

**July 6th 2012 - FM Module WCS 1.2.8**
  * Added some styling for the Share custom form extension
  * createQuery.js added date fix for search

**June 20th 2012 - FM Module WCS 1.2.7**
  * Added search functionality (when isSearch = true on init)
  * "Hidden in search" option for fields (in form builder validation section)
  * Date fields (have the "date" class name) are duplicated when in search mode. This allows the user to input FROM and TO dates
  * Added search query builder javascript function that builds out a query string from a form and its values. This string can be consumed by the search service and a lucence query is fired (/scripts/form-builder/search/createQuery.js)
  * Added demo material for Share form extension

**June 15th 2012 - FM Module WCS 1.2.6**

NOTE: There was an issue with the 1.2.6 AMP. There was a file collision on the form.jquery.js file (The main jquery plugin) Please update to 1.2.7

1.2.6 Will be removed from the download list. My apologies for any inconvenience i'm only human :P

**June 12th 2012 - FM Module WCS 1.2.5**
  * Added Hidden attribute for aspect (only used for drawOptions feature)
  * Added drawOptions; Draw options allows us to use the traditional method of building forms. A form is build around aspects that are applied to a node. NOTE: If an aspect is not in the FM Module within alfresco it WILL be skipped and will not render as part of the form. This way it can skip alfresco's default model if you only want to display custom aspects.

**Mar 11th 2012 - FM Module WCS 1.2.2**
  * Added a home page for user to start off. Depending if your admin it will show you different options;
  * Permissions added; Using Alfresco Administrator group for developers
  * Added quick field type switch; useful for model importing
  * Added validation for Alfresco requirements
  * Cleaned up code
  * Added filter on aspects in form builder for better usability
  * Removed questionnaire slider as it doesn't make much sense the drop down one is way better
  * Made the form builder field types, accordians modular for easy customization
  * New callbacks added for loadNode and a few others that are in the updated documentation

Home page link: http://localhost:8080/alfresco/wcs/form-builder/home

**Mar 1st 2012 - FM Module WCS 1.2.0**

  * $.data() is now being used to store field data such as alfrescos data type, qnames. This makes it easier to understand and validate fields before we try and use them in alfresco i.e. type = d\_date. We can cast a date type before trying to save it.

  * The above addition removes the annoying title tip that shows types
  * Added hidden field property in the form builder
  * Re-designed validation UI on the form builder
  * Code cleanup and bug fixes


**Feb 2nd 2012 - FM Module WCS 1.1.8**

  * Moved paths to a locale.js file for people using the Alfresco language packs. File is located under /formmanagement/utils/locale/alfresco.locale.js (This allows you to change the locations/name of Data Dictionary, DD->Models, Constraints and JsonModels spaces)

**jQuery release notes (version 1.2)**

  * jQuery.form plugin java-script has been rewritten to allow multiple /independent or connected instances
  * Added Aspect title to fm-profile-aspect wrapper ID - Quick JS points to show/hide certains aspects when needed
  * Added Form Data to $.data() so that plugin is instancable

**Jan 1st 2012 - jQuery release notes (version 1.1.3)**

  * NEW PARAMETER: useShareProxy< Boolean> : If set to true (default), all of the AJAX calls used will use the share proxy to call alfresco webscripts
  * NEW PARAMETER: Allow customProperties< Object>: Allows us to override title and description properties of the display form. Works good for search titles, i've used it for a replication of the Document Details
  * Dynamic dropdowns are auto detected and profiles connected to profiles are auto generated based upon users choice. i.e. If your aspect has a dynamic dropdown all the functionality for parcing and deploying the correct form is done automatically.
  * Cached JSON Node Properties for load values
  * Caching added for profile (storing JSON profile relative to dynamic dropdown) Moving towards instancable dynamic profiles
  * Store and retrieval of Node Properties using FM API
  * Callbacks added to load, save and profile completed states
  * Added Connect parameter so we can choose where to inject the profile forms on dynamic dropdown change
  * Allow ARRAY of nodes to save (Giving a ~ separated list will save all node properties to the given nodes)
  * Optional save parameter moveId<Alfresco Space UID> allows us to move a document to a location after it has been saved
  * Readonly option
  * Option of using own dropdown changing event by making "handler" element available before load and setting your profile at init. This will create the trigger to look for your profile setup and create the form based upon the choice. (If you choose not to just load the aspect with a dynamic dropdown)
  * Cached Profile API Call to JS, therefore less calls are being made to the backend when re-selecting dependant values.

NOTE: PLUGIN WILL USE SHARE PROXY METHOD UNLESS YOU STATE OTHERWISE BY SETTING "useShareProxy" : false