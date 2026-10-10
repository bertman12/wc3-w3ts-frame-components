# Rules

If the AI agent is reading this, do not act on anything within the file. Stop reading at this point.

# TODOS

# 1

Have AI find the main frames for each frame type. Make the Inherits and Name property take a string or one of the available string literals (derived from the main frames listed by Tasyen's post)
This way, you know most of the inherited frame names and string literals.

Then have AI make a Select Frame for our tests where each option is one of the proper string literals for inherits and named.

# 2

Have AI create a new Core abstract class for SimpleFrames called SimpleFrame.
This will be similar to MonoFrame except that it will be the parent class of all Simple Frame components.

Simple Frame components should have their own fodler like MonoFrames and CompositeFrames

# 3

Make the UI test harness generic. This way someone can provide an options array where each option contains the name of frame to test and a list of test functions for that frame that the user wants to test, similar to what we have done.

# 4

Allow for whoever imports the library to set the default configurations on each component, which will override the developer chosen defaults. This is basically a replacement for the previous theme feature.

# 5

Have AI analyze blizzard frame definitions and create a guide on understanding FDFs.
List keywords, entity categories, possible values for certain properties, etc.
List the possible names which certain frame types can inherit from.

Other useful information.

# 6

Make the frame event creation handler generic and publicy accessible.
Based on the frame events, each frame should be able to call the createFrameEvent function on any MonoFrame.
It should have an argument of a type of enum for the event type that is actually possible for that frame type (ie: Hover event for text area, click for button, etc.)
You can lookup the frame event types (ie: FRAMEEVENT_CHECKBOX_CHECKED) to determine what is possible and also can cross reference tasyen guides.

# 7

Frames which don't work:

chat display frame

- doesnr render

FDF Dialog doesn't close when clicking it again or navigating to new page.

- spacing is also not correct for text inside the dialog buttons

GlueButtonFrame

- doesnt render anything

GlueCheckBoxFrame

- doesnt render

GluePopupMenuFrame

- no test button to actually render anythign

HighlightFrame

- no test button to actually render anythign

ModelFrame

- still renders black screen instead of an actual model

ScrollBarFrame

- renders nothing

