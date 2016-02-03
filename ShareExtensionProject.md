**Please ensure you update the FM Module to version 1.2.9 as this has a new menu item; Advanced search setup.**

# Share Extension Project #

This project will consist of a number of Share enhancements. To start off i have moved the FM Demo dashlet, form extension pieces and the advanced search all into one AMP. There also checked into SVN.

I have uploaded a share amp fm-share\_1\_2\_0.amp to the download sectoin. This amp contains files that will REPLACE the alfresco search with one that uses the Form Management forms.

[Here is the AMP](http://code.google.com/p/alfresco-form-model-management/downloads/detail?name=fm-share_1_2_0.amp&can=2&q=#makechanges)

## Installation ##
Please diable Alfresco SOLR and use Lucene ONLY if you are using the Share 1.2.1 or less. From 1.2.2 it is using fts-alfresco search via the Search API

  1. Locate \tomcat\shared\classes\alfresco-global.properties
  1. Comment out solr and change the index subsystem to lucene like below
```
### Solr indexing ###
##index.subsystem.name=solr
#dir.keystore=${dir.root}/keystore
#solr.port.ssl=8443

index.subsystem.name=lucene
index.recovery.mode=FULL
```

Once you have reindexed. You can change FULL to VALIDATE. This will stop it from indexing everything each time.

Install the AMP

## Search Setup ##

Click the search menu item in the FM Console. It allows your to create a profile of aspects for your search.

## Nice to know ##

  1. No server restarts for advanced search changes
  1. If there are any fields you want to hide there is a toggle in the form builder to hide FIELDS in search.

## Coming soon ##
  1. Filter search results
  1. Search sorting
  1. Favorite searches