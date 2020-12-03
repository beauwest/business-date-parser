# Business Date Parser ![Build Status](https://travis-ci.org/beauwest/business-date-parser.svg?branch=master)
An opinionated, zero-dependency, fast user input parser for date & times. This module is designed to process & parse user input into a Javascript date object.

## Supported Date Formats
- `c`: Current Date
- `y`: Yesterday
- `t`: Tomorrow
- `f`: First day of the month
- `l`: Last day of the month
- `+20`: 20 days from now
- `-20`: 20 days ago
- `15`: The 15th day of the current month
- `4/15`: The 15th day of April of the current year
- `4/15/2020`: April 15th, 2020
- `5-3-18`: May 3rd, 2018
- `2025-03-01`: March 1st, 2025

## Supported Time Formats
- `c`: Current Time
- `+20`: 20 minutes from now
- `-20`: 20 minutes ago
- `2`: 2:00 PM
- `02`: 2:00 AM
- `2a`: 2:00 AM
- `2:45`: 2:45 PM
- `2:45a`: 2:45 AM
- `530`: 5:30 PM
- `8:22:34.028`: 8:22:34.028 AM

Anything that does not match the rule-based parsing will fall back to Javascript's built-in [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).

## Getting Started
```javascript
import {parseDate, parseTime, parseDateAndTime} from 'business-date-parser';

const threeDaysFromNow = parseDate('+3');

const snackTime = parseTime('2:30p');

const snackTimeThreeDaysFromNow = parseTime('+3 2:30p');
```