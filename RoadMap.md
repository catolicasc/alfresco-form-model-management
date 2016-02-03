#Where are we going with the FM Module

# Introduction #

As this is a new project, I haven't jumped to far ahead of tackling the initial issue I saw with forms in Alfresco. However, I will be updating this from time to time. It may even just be a whiteboard jotting ideas down for later releases.


# Road Map #
  1. **NEW**: Quick change of form field types; This will allow us to quickly change fields from text to dropdown so that we can quickly tweak previously built models.
  1. Multilingual support (ETA March-Apirl 2012)
  1. Bundle custom search page and advanced search form)
  1. Bundle or Customize share to use FM Forms by default



### Multilingual Support ###

The multilingual piece will use the browser locale to determine the language used on the form when rendering it to the user. In the form builder we will have a dropdown of all language locale and will be found in the aspect properties. When you change the dropdown it will replace all your labels, tips, headers with for example (#FR Hello World), all you will need to do to set the translations is change the dropdown and re-enter your labels. Once the form is saved it will associate the language pack with your labels and thus using your input as a multilingual library.