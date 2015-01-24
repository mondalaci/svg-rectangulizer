# svg-rectangulizer

`svg-rectangulizer` is a command line utility for converting SVG paths to rectangles.

The algorithm is very simple as only the bounding boxes of paths is computed based on the starting and ending points of
the path segments and the relevant rectangles are inserted in place of the paths.

You can use it like this:

```
svg-rectangulizer source-image.svg > destination-image.svg
```
