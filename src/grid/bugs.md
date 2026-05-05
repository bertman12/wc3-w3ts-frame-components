While rendering each grid item the first time, if you return undefined for your item frames and then continue onto the next frame, the total item frames length would be off by the number of times you returned undefined in the render function. this breaks the updateItem function

Perhaps we could create the array at a fixed size before iterating, and then just set the indexes appropriately.
