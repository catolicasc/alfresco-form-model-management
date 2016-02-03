# Introduction #

One of the most common questions people have asked is how they can get the FM forms to show up in Alfresco Share.

# FM Share Extension Project #
The Form Management Share Extension project was made available mid July 2012. The FM module has been moving pretty fast and in this project you can replace the Alfresco Share default search and the edit properties form in the document library.

NOTE: fm-share\_x\_x\_x.amp can be found in the downloads section

**NOTE: The default configuration for the edit properties screen is the traditional method see below for more info**

# Edit properties form #
## Traditional Method (document focused) ##

By default the Share edit properties form will look for any aspects already added to a document. If it finds any aspects that have corresponding forms built in the form management console, it will then build the form based on that metadata i.e. You need to add the custom aspects to that document first (if you want to do this then you need to make the aspects available to the share UI using share-custom-config.xml [blog page](http://blogs.alfresco.com/wp/wabson/2010/02/25/adding-custom-aspect-support-in-alfresco-share/) ). The FM builder will then create a form grouping all the custom aspects you applied.

_In order to see this setup you can look at the file:
<install path>\tomcat\shared\classes\alfresco\web-extension\site-webscripts\org\alfresco\components\form\form.get.head.ftl (line 71)_

At this line number you can see that there are two groups of FM init methods. The first one commented "Traditional method" is what we just talked about. More details on the 'drawOptions' parameter is listed below.

## Strict Method (form focused) ##

Form focused development means you do not care what metadata is applied to a node(s). You are dealing with a particular set of metadata and you are forcing the user to enter either a collection of aspects or profiles derived from relational data.

_In order to see this setup you can look at the file:
<install path>\tomcat\shared\classes\alfresco\web-extension\site-webscripts\org\alfresco\components\form\form.get.head.ftl (line 88)_

This is by default commented out but can be used to force specific metadata. As you can see the ?aspects= parameter in the GET request allows you to choose one or many aspects to deliver to the end user (separate with ~). By using this methodology you can take advantage of profiles; You just need to figure out what you want to use as a trigger to deliver different profiles e.g. A document type field shows different profiles (collection of aspects) based upon the users selection. This could even go one step further and having different dropdown constraints (list items) display based upon share site.

Form focused also means dynamic. One setup could show different profiles/document types based upon share site.

  * Pre-defined metadata set; means you control what metadata documents must have. Instead of adding aspect upon aspect you use profiles to determine what users should enter.

  * Document Type relation; Using an aspect to display a document type dropdown list. When the user selects an option it builds out (displays) profiles assigned to its value

  * Share site specific content. This allows different sites to have different metadata profiles; You can use the same document type property and use the /byShareSite option for displaying different lists of document types to the end user. This way you can search on the same property globally across your repository yet limit users choice based on site/dept

  * Allow alfresco to manage its own; Typically this would show side by side Alfresco's default model information (using alfresco forms) and FM Custom metadata (using FM model and using its benefits).

# Advanced search replacement #

You will notice that the contextual search in the top right hand corner of alfresco will be using a new search.

To configure what form is shown in here take a look at the advanced search menu item in the FM Console; Simply add the aspect you want to search (global definition)

In order to have more context, you can make this site specific by using the "byShareSite" service option attached to a drop down list of ...say a document type list. These document types can then generate collections of aspects based upon the users choice (metadata profiles).

In the future (when i manage to free more time) profiles will be its own entity. The FM Console will let you create relationships between sites and profiles directly without having to use a dropdown as a context selector.

There are many different business cases on using the FM manager that Alfresco cannot nicely deal with.

Let's look at how we want are users to interact with the form and documents.

# Authors Note #

REMEMBER: The FM module was built as a framework to build forms and deploy them using jQuery. It allows for everything that was in the webinar but targeted more specifically at custom development in Alfresco. Making life easier for development costs and time.


## 'drawOptions' Methodology ##

This is the traditional method of using forms. A form is drawn based upon the aspects that are applied to it.

Normally with the FM Module we have been using variables like:
  * 'aspect': [.md](.md), and
  * 'profile': {}

There a new variable called 'drawOptions' and it looks like this:

'drawOptions': {
> 'nodeRef': '<String NodeRef | Default "" >',
> 'drawByNodeAspects': <Boolean | Default false>
}

If drawByNodeAspects is set to true and you have a valid nodeRef the FM Module will draw a form based upon aspects the NODE has applied to it.

If the FM Module cannot locate forms for those aspects (BUILT FROM FM MODULE) then it will just skip them. This way you can replicate or leave Alfresco's default aspects/properties e.g. cm:name

REMEMBER: IF you want to use cm:name or other pre-defined properties you can use DUMMY Fields! (A dummy field allows you to add fields in your form builder WITHOUT it moving into the model)


### DEMO DASHLET EXAMPLE ###
To see how this works download the FM Demo Dashlet

Instead of using 'drawOptions' we are using 'aspects': [.md](.md) and 'profile': {}

You decide on how you want to use the FM Module. It should be flexible enough for most use cases and if there is something specific you need it to do. Open a bug and I might put it into the next build.