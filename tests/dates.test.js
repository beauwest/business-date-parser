import {parseDate, parseTime, parseDateAndTime} from '../index.js';

import {createRequire} from 'module'

const require = createRequire(import.meta.url);
const test = require('ava');

function expectDate(t, input, year, month, date, hours = 0, minutes = 0, seconds = 0) {
  if (input.replace) {
    input = input.replace('date: ', '');
  }
  const result = parseDate(input);
  t.is(result.getFullYear(), year);
  t.is(result.getMonth(), month);
  t.is(result.getDate(), date);
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

function expectDateAndTime(t, input, year, month, date, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
  if (input.replace) {
    input = input.replace('datetime: ', '');
  }
  const result = parseDateAndTime(input);
  t.is(result.getFullYear(), year);
  t.is(result.getMonth(), month);
  t.is(result.getDate(), date);
  t.is(result.getHours(), hours);
  t.is(result.getMinutes(), minutes);
  t.is(result.getSeconds(), seconds);
  t.is(result.getMilliseconds(), milliseconds);
}

test('Date Object', t => {
  const now = new Date();
  expectDate(t, now, now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
});

test('c', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
});

test('t', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth(), now.getDate() + 1);
});

test('y', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth(), now.getDate() - 1);
});

test('f', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth(), 1);
});

test('l', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth(), new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
});

test('11', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), now.getMonth(), 11);
});

test('4/26', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 3, 26);
});

test('4-26', t => {
  const now = new Date();
  expectDate(t, t.title, now.getFullYear(), 3, 26);
});

test('4/26/1988', t => {
  expectDate(t, t.title, 1988, 3, 26);
});

test('4/26/88', t => {
  expectDate(t, t.title, 1988, 3, 26);
});

test('5-3-18', t => {
  expectDate(t, t.title, 2018, 4, 3);
});

test('4-26-1988', t => {
  expectDate(t, t.title, 1988, 3, 26);
});

test('1988-04-26', t => {
  expectDate(t, t.title, 1988, 3, 26);
});

test('2025-03-01', t => {
  expectDate(t, t.title, 2025, 2, 1);
});

test('-20', t => {
  const now = new Date();
  now.setDate(now.getDate() - 20);
  expectDate(t, t.title, now.getFullYear(), now.getMonth(), now.getDate());
});

test('+20', t => {
  const now = new Date();
  now.setDate(now.getDate() + 20);
  expectDate(t, t.title, now.getFullYear(), now.getMonth(), now.getDate());
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

test('2', t => {
  expectTime(t, t.title, 14);
});

test('02', t => {
  expectTime(t, t.title, 2);
});

test('15', t => {
  expectTime(t, t.title, 15);
});

test('2a', t => {
  expectTime(t, t.title, 2);
});

test('2 am', t => {
  expectTime(t, t.title, 2);
});

test('2:45p', t => {
  expectTime(t, t.title, 14, 45);
});

test('2:45 pm', t => {
  expectTime(t, t.title, 14, 45);
});

test('530', t => {
  expectTime(t, t.title, 17, 30);
});

test('08:22:34.028 CST', t => {
  expectTime(t, t.title, 8, 22, 34, 28);
});

test('1/1/2020 08:22:34.028 CST', t => {
  expectDateAndTime(t, t.title, 2020, 0, 1, 8, 22, 34, 28);
});

test('datetime: 4/26', t => {
  const now = new Date();
  expectDateAndTime(t, t.title, now.getFullYear(), 3, 26);
});

test('+3 2:30p', t => {
  const now = new Date();
  now.setDate(now.getDate() + 3);
  expectDateAndTime(t, t.title, now.getFullYear(), now.getMonth(), now.getDate(), 14, 30);
});