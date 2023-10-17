import {parseDate, parseTime, parseDateAndTime} from '../index.js';

import {createRequire} from 'module'

const require = createRequire(import.meta.url);
const test = require('ava');

function expectDate(t, input, year, month, day, hours = 0, minutes = 0, seconds = 0) {
  if (input.replace) {
    input = input.replace('date: ', '');
  }
  const result = parseDate(input);
  t.is(result.getFullYear(), year);
  t.is(result.getMonth() + 1, month);
  t.is(result.getDate(), day);
  t.is(result.getHours(), hours);
  t.is(result.getMinutes(), minutes);
  t.is(result.getSeconds(), seconds);
}

function expectTime(t, input, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
  if (input.replace) {
    input = input.replace('time: ', '');
  }
  const result = parseTime(input);
  t.is(result.getHours(), hours);
  t.is(result.getMinutes(), minutes);
  t.is(result.getSeconds(), seconds);
  t.true(result.getMilliseconds() >= milliseconds || milliseconds === 0);
}

function expectDateAndTime(t, input, year, month, day, hours = 0, minutes = 0, seconds = 0, milliseconds = 0, options) {
  if (input.replace) {
    input = input.replace('datetime: ', '');
  }
  const result = parseDateAndTime(input, options);
  t.is(result.getFullYear(), year);
  t.is(result.getMonth() + 1, month);
  t.is(result.getDate(), day);
  t.is(result.getHours(), hours);
  t.is(result.getMinutes(), minutes);
  t.is(result.getSeconds(), seconds);
  if (milliseconds !== false) {
    t.is(result.getMilliseconds(), milliseconds);
  }
}

function expectDateAndTimeISO(t, input, isoString, options) {
  if (input.replace) {
    input = input.replace('datetime: ', '');
  }
  const result = parseDateAndTime(input, options);
  t.is(result.toISOString(), isoString);
}

test('Blank Date', t => {
  const blankValue = parseDate('');
  t.falsy(blankValue);
  const nullValue = parseDate(null);
  t.falsy(nullValue);
});

test('Blank Time', t => {
  const blankValue = parseTime('');
  t.falsy(blankValue);
  const nullValue = parseTime(null);
  t.falsy(nullValue);
});

test('Blank Date And Time', t => {
  const blankValue = parseDateAndTime('');
  t.falsy(blankValue);
  const nullValue = parseDateAndTime(null);
  t.falsy(nullValue);
});

test('Date Object', t => {
  const now = new Date();
  expectDate(t, now, now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
});

test('Date Timestamp', t => {
  const date = new Date('1995-12-17T00:00:00');
  expectDate(t, date.getTime(), 1995, 12, 17);
});

test('Date Custom Rule', t => {
  const result = parseDate('unix epoch', {
    rules: [{
      regex: /^unix epoch$/i, parse: () => {
        return new Date(0);
      }
    }]
  });
  t.is(result.getTime(), 0);
});

test('date: c', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
});

test('date: t', t => {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  expectDate(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate());
});

test('date: y', t => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  expectDate(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate());
});

test('date: f', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth() + 1, 1);
});

test('date: l', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth() + 1, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
});

test('date: 11', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth() + 1, 11);
});

test('date: 11/', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 11, 1);
});

test('date: 55', t => {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  expectDate(t, t.title, now.getFullYear(), now.getMonth() + 1, last.getDate());
});

test('date: 4/26', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 4, 26);
});

test('date: 11/1', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 11, 1);
});

test('date: 4/26/', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 4, 26);
});

test('date: 4-26', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 4, 26);
});

test('date: 9/31', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 9, 30);
});

test('date: 9/55', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 9, 30);
});

test('date: 3/31', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 3, 31);
});

test('date: 3/32', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 3, 31);
});

test('date: 3/32/1999', t => {
  expectDate(t, t.title, 1999, 3, 31);
});

test('date: 1999-03-32', t => {
  expectDate(t, t.title, 1999, 3, 31);
});

test('date: 2024-02-31', t => {
  expectDate(t, t.title, 2024, 2, 29);
});

test('date: 4/26/1988', t => {
  expectDate(t, t.title, 1988, 4, 26);
});

test('date: 4/26/88', t => {
  expectDate(t, t.title, 1988, 4, 26);
});

test('date: 11/5/2020', t => {
  expectDate(t, t.title, 2020, 11, 5);
});

test('date: 5-3-18', t => {
  expectDate(t, t.title, 2018, 5, 3);
});

test('date: 4-26-1988', t => {
  expectDate(t, t.title, 1988, 4, 26);
});

test('date: 1988-04-26', t => {
  expectDate(t, t.title, 1988, 4, 26);
});

test('date: 2025-03-01', t => {
  expectDate(t, t.title, 2025, 3, 1);
});

test('date: 20210607', t => { // YYYYMMDD
  expectDate(t, t.title, 2021, 6, 7);
});

test('date: 12111988', t => { // MMDDYYYY
  expectDate(t, t.title, 1988, 12, 11);
});

test('date: 13111988', t => { // DDMMYYYY
  expectDate(t, t.title, 1988, 11, 13);
});

test('date: 20012008', t => { // DDMMYYYY
  expectDate(t, t.title, 2008, 1, 20);
});

test('date: 12012008', t => { // MMDDYYYY
  expectDate(t, t.title, 2008, 12, 1);
});

test('date: 19910102', t => { // YYYYMMDD
  expectDate(t, t.title, 1991, 1, 2);
});

test('date: 20240231', t => {
  expectDate(t, t.title, 2024, 2, 29);
});

test('date: -20', t => {
  const now = new Date();
  now.setDate(now.getDate() - 20);
  expectDate(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate());
});

test('date: +20', t => {
  const now = new Date();
  now.setDate(now.getDate() + 20);
  expectDate(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate());
});

test('date: bad value', t => {
  const result = parseDate('bad value');
  t.falsy(result);
});

test('time: c', t => {
  const now = new Date();
  expectTime(t, t.title, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
});

test('time: -20', t => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 20);
  expectTime(t, t.title, now.getHours(), now.getMinutes());
});

test('time: +20', t => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 20);
  expectTime(t, t.title, now.getHours(), now.getMinutes());
});

test('time: 2', t => {
  expectTime(t, t.title, 14);
});

test('time: 02', t => {
  expectTime(t, t.title, 2);
});

test('time: 15', t => {
  expectTime(t, t.title, 15);
});

test('time: 2a', t => {
  expectTime(t, t.title, 2);
});

test('time: 2 am', t => {
  expectTime(t, t.title, 2);
});

test('time: 2:45p', t => {
  expectTime(t, t.title, 14, 45);
});

test('time: 2:45 pm', t => {
  expectTime(t, t.title, 14, 45);
});

test('time: 12:00 AM', t => {
  expectTime(t, t.title, 0, 0);
});

test('time: 12:45am', t => {
  expectTime(t, t.title, 0, 45);
});

test('time: 530', t => {
  expectTime(t, t.title, 17, 30);
});

test('time: 9:23:3', t => {
  expectTime(t, t.title, 9, 23, 3);
});

test('time: 12:42:49 PM', t => {
  expectTime(t, t.title, 12, 42, 49);
});

test('time: 08:22:34.028 CST', t => {
  expectTime(t, t.title, 8, 22, 34, 28);
});

test('time: 08:00:00.000 PDT', t => {
  expectTime(t, t.title, 8, 0, 0, 0);
});

test('time: 22:00:00.000 AST', t => {
  expectTime(t, t.title, 22, 0, 0, 0);
});

test('time: bad value', t => {
  const result = parseTime('bad value');
  t.falsy(result);
});

test('time: 2021-01-27', t => {
  const result = parseTime('2021-01-27');
  t.falsy(result);
});

test('time: 100/100/100', t => {
  const result = parseTime('100/100/100');
  t.falsy(result);
});

test('datetime: c', t => {
  const now = new Date();
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), false);
});

test('datetime: t', t => {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate());
});

test('datetime: y', t => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate());
});

test('datetime: y 08:36:50.900 CDT', t => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate(), 8, 36, 50, 900);
});

test('datetime: 1/1/2020 08:22:34.028 CST', t => {
  expectDateAndTimeISO(t, t.title, '2020-01-01T14:22:34.028Z');
});

test('datetime: 2021-01-27 08:36:50.900 CST', t => {
  expectDateAndTimeISO(t, t.title, '2021-01-27T14:36:50.900Z');
});

test('datetime: 55', t => {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth() + 1, last.getDate());
});

test('datetime: 4/26', t => {
  const now = new Date();
  expectDateAndTime(t, t.title, now.getFullYear(), 4, 26);
});

test('datetime: 9/55', t => {
  const now = new Date();
  expectDateAndTime(t, t.title, now.getFullYear(), 9, 30);
});

test('datetime: 2/31/2024', t => {
  expectDateAndTime(t, t.title, 2024, 2, 29);
});

test('datetime: +3 2:30p', t => {
  const now = new Date();
  now.setDate(now.getDate() + 3);
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate(), 14, 30);
});

test('datetime: 9', t => {
  const now = new Date();
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth() + 1, 9);
});

test('datetime: 9 but Preferring Time', t => {
  const now = new Date();
  expectDateAndTime(t, '9', now.getFullYear(), now.getMonth() + 1, now.getDate(), 9, 0, 0, 0, {preferTime: true});
});

test('datetime: 9 with options', t => {
  expectDateAndTime(t, '9', 1988, 4, 26, 9, 0, 0, 0, {preferTime: true, defaultDate: '1988-04-26'});
});

test('datetime: Valid Date with Slashes but Preferring Time', t => {
  expectDateAndTime(t, '4/26/1988', 1988, 4, 26, 0, 0, 0, 0, {preferTime: true});
});

test('datetime: Valid Date with Dashes but Preferring Time', t => {
  expectDateAndTime(t, '1988-04-26', 1988, 4, 26, 0, 0, 0, 0, {preferTime: true});
});

test('datetime: Valid Time but Preferring Time', t => {
  const now = new Date();
  expectDateAndTime(t, '08:36:50.900 CDT', now.getFullYear(), now.getMonth() + 1, now.getDate(), 8, 36, 50, 900, {preferTime: true});
});

test('datetime: Yesterday but Preferring Time', t => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  expectDateAndTime(t, 'y', yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate(), 0, 0, 0, 0, {preferTime: true});
});

test('datetime: PostgreSQL ISO 8601 +00', t => {
  expectDateAndTimeISO(t, '2016-02-01 11:19:16+00', '2016-02-01T11:19:16.000Z');
});

test('datetime: PostgreSQL ISO 8601 +0200', t => {
  expectDateAndTimeISO(t, '2016-02-01 11:19:16+0200', '2016-02-01T09:19:16.000Z');
});

test('datetime: PostgreSQL ISO 8601 -0200', t => {
  expectDateAndTimeISO(t, '2016-02-01 11:19:16-0200', '2016-02-01T13:19:16.000Z');
});

test('datetime: 3am', t => {
  const now = new Date();
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate(), 3);
});

test('datetime: 3pm', t => {
  const now = new Date();
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth() + 1, now.getDate(), 15);
});

test('datetime: 3am but preferring time', t => {
  const now = new Date();
  expectDateAndTime(t, '3am', now.getFullYear(), now.getMonth() + 1, now.getDate(), 3, 0, 0, 0, {preferTime: true});
});

test('datetime: 3pm but preferring time', t => {
  const now = new Date();
  expectDateAndTime(t, '3pm', now.getFullYear(), now.getMonth() + 1, now.getDate(), 15, 0, 0, 0, {preferTime: true});
});

test('datetime: 2022-02-01 13:00:00.000 PDT', t => {
  expectDateAndTimeISO(t, t.title, '2022-02-01T20:00:00.000Z');
});

test('datetime: 2022-02-01 12:00:00.000 Z', t => {
  expectDateAndTimeISO(t, t.title, '2022-02-01T12:00:00.000Z');
});

test('datetime: 2022-02-01T19:00:00.000Z', t => {
  expectDateAndTimeISO(t, t.title, '2022-02-01T19:00:00.000Z');
});

test('datetime: 2022-03-28T16:11:37.5158301-05:00', t => {
  expectDateAndTimeISO(t, t.title, '2022-03-28T21:11:37.515Z');
});

test('datetime: bad value', t => {
  const result = parseDateAndTime('bad value');
  t.falsy(result);
});

test('datetime: bad value preferring time', t => {
  const result = parseDateAndTime('bad value', {preferTime: true});
  t.falsy(result);
});