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

