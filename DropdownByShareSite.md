# Introduction #

Using dynamic dropdown lists based upon share site.

## Details ##

This may seem simple and not a major request however, when using in the correct context this can give us lots of flexibility.

Lets save for example each share site has its own set of document types and with that, a different collection of aspects (metadata profile)

## How do i do it ##

Its simple. When you click on a dropdown list in the form builder you will see it has the menu item of "options" located on the left of the form builder. When you expand this option you will see "or Populate from a script". Simply paste "/dropdown/byShareSite" into that textbox.

When the form builder finds that in its service when rendering the form it will look for < your site id >-site. If you create a dropdown list such as mysiteid-site it will pick up that list and use it, if that list has a profile attached to it. It will render each profile based upon the users selection.

nice, right!