# svg-rectangulizer

`svg-rectangulizer` is a command line utility for converting SVG paths to rectangles.

The algorithm is very simple as only the bounding boxes of paths are computed based on the starting and ending points of
the path segments then the relevant rectangles are inserted in place of the paths.

You can use it like this:

```
svg-rectangulizer source-image.svg > destination-image.svg
```
