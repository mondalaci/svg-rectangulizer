#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('util');
var xml2js = require('xml2js');
var traverse = require('traverse');

var programName = path.basename(process.argv[1]);
var args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: ' + programName + ' filename-to-convert.svg');
    process.exit(1);
}

var filenameToConvert = args[0];

var parser = new xml2js.Parser();
fs.readFile(filenameToConvert, function(err, svg) {
    parser.parseString(svg, function (err, jsDom) {
        var modifiedJsDom = traverse(jsDom).map(function(item) {
            if (this.key === 'd') {
                this.parent.update(pathSegmentsToRect(item));
            }
        });
        var modifiedJsDom2 = traverse(modifiedJsDom).map(function(item) {
            if (item.path) {
                item.rect = item.path;
                delete item.path;
                this.update(item);
            }
        });
        var modifiedXml = new xml2js.Builder().buildObject(modifiedJsDom2);
        console.log(modifiedXml);
    });
});

function pathSegmentsToRect(pathSegments) {
    var xMin=Infinity, xMax=-Infinity;
    var yMin=Infinity, yMax=-Infinity;
    var xCurrent=0, yCurrent=0;

    pathStringToPathSegments(pathSegments).forEach(function(pathSegment) {
        var pathCommand = pathSegment[0];
        var x, y;

        switch (pathCommand.toLowerCase()) {
            case 'm':
                x = pathSegment[1];
                y = pathSegment[2];
                break;
            case 'h':
                x = pathSegment[1];
                break;
            case 'v':
                y = pathSegment[1];
                break;
            case 'c':
                x = pathSegment[5];
                y = pathSegment[6];
                break;
        }

        var isAbsolute = pathCommand.toUpperCase() === pathCommand;
        if (x !== undefined) {
            xCurrent = isAbsolute ? x : x+xCurrent;
        }
        if (y !== undefined) {
            yCurrent = isAbsolute ? y : y+yCurrent;
        }

        xMin = Math.min(xMin, xCurrent);
        yMin = Math.min(yMin, yCurrent);
        xMax = Math.max(xMax, xCurrent);
        yMax = Math.max(yMax, yCurrent);
    });

    return {x:xMin, y:yMin, width:xMax-xMin, height:yMax-yMin};
}

function pathStringToPathSegments(pathString) {
    return pathString.split(/(?=[a-zA-Z])/g).map(function(pathSegmentString) {  // Split path string by path commands.
        return pathSegmentString
            .replace(/([a-zA-Z])/g, '$1 ')  // Put space after path commands.
            .replace(/-/g, ' -')            // Put space before minus characters.
            .replace(/[\s]+/g, ' ')         // Compress whitespaces.
            .replace(/^\s+|\s+$/g, '')      // Trim.
            .split(' ').map(function(pathValue) {
                return isNaN(parseFloat(pathValue)) ? pathValue : +pathValue;  // Convert numeric strings to numbers.
            });
    });
}
