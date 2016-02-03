# Introduction #

This page refers to the fmdemo AMP. In this AMP you can find a new dashlet (once deployed) called FM Demo.


# Details #

FM Demo dashlet allows you to see how we use the jQuery plugin and FM services. This dashlet will allows you to test:

  * Load form(s) and profiles using share
  * Load form values from node properties
  * Save form values to a node

Methods Used:

**Initialization**
` $('.my-form-wrapper').form(); `

**Load Node**
` $('.my-form-wrapper').form('loadNode', 'node UID'); `

**Save Node**
` $('.my-form-wrapper').form('save', postObject); `