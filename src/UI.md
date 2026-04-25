# UI Project Standard

The ui will be seperated into appropriate files and categories.

Each file should contain most of the necessary data to render it's contents.

This means including all tooltip strings, textures, names locally.

We may still import globally useful UI related data.

# Regarding how the UI will be updated.

Our goal is to update the appropriate UI whenever dependent data is changed.
We can either update individual parts or the entire thing.
Rendering the entire thing means creating the frame and destroying it again, so we will avoid that.

Instead we'll update specific parts.

This means that for UI components which are dependent on dynamic data should have a function that updates itself with the incoming data.

Whenever the render function is called on a
