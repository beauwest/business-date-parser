# Change Log

## Release 1.0.9
- Fix "12:00 AM" time parsing.

## Release 1.0.8
- Always return the original input if it's falsy and not a timestamp value of 0.
- Parse as a date part, in the date & time parsing, if there is only one part and it's likely a date because it contains a "-" or a "/".

## Release 1.0.7
- Fixed a month parsing bug when parsing dates on the 31st day of the current month, and entering a month that did not have 31 days.

## Release 1.0.6
- Added a `rules` option to all parse functions that allows users to specify their own parsing rules.
- Improved the documentation.

## Release 1.0.5
- Switch from Travis CI to Github Actions.

## Release 1.0.4
- Fix a bug where hour 12 would incorrectly be adjusted for AM/PM

## Release 1.0.3
- Added support for numeric timestamps as input
- Automatically adjust short years based on current decade

## Release 1.0.2
Added options to `parseDateAndTime()`
- `preferTime`: Parses as time when no date part is found
- `defaultDate`: Set a date to default to when time is preferred

## Release 1.0.1
Added support for more date formats
- 12/
- 4/26/

## Release 1.0.0
First release with initial functionality!