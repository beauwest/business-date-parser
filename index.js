function calculateFullYear(input) {
  const currentYear = (new Date()).getFullYear().toString();
  const currentShortPrefix = parseInt(currentYear.substring(0, 2), 10);
  const currentShortSuffix = parseInt(currentYear.substring(2), 10);
  const inputAsInt = parseInt(input, 10);
  const prefix = (inputAsInt > currentShortSuffix + 10 ? currentShortPrefix - 1 : currentShortPrefix);
  return `${prefix}${input}`;
}

function systemParseDate(input) {
  let parsed = new Date(input);
  if (isDate(parsed)) {
    return parsed;
  } else {
    parsed = Date.parse(input);
    if (Number.isInteger(parsed)) {
      return new Date(parsed);
    }
  }
  return null;
}

function isDate(input) {
  return input instanceof Date && !isNaN(input.valueOf());
}

function isTimeStamp(input) {
  return Number.isFinite(input);
}

function isNotValid(input) {
  return (!isTimeStamp(input) && !input);
}

function isLikelyDateFormat(input) {
  return (input.includes('-') || input.includes('/'));
}

function isLikelyISOFormat(input) {
  // We only want this to match full formats that include full date, separator, and something after the time.
  // YYYY-MM-DDTHH:MM:SSZ
  if (input.length >= 20 && isLikelyDateFormat(input)) {
    // Check for the "T" delimiter
    if (/\d{2}T\d{2}/.test(input)) {
      return true;
    }
    // See if it ends in a timezone, or offset.
    if (/([A-Z]{1,5})|([+-]\d{1,4})$/.test(input)) {
      return true;
    }
  }
  return false;
}

function adjustForBusinessHours(hour) {
  hour = parseInt(hour, 10);
  if (hour >= 1 && hour <= 6) {
    return hour + 12;
  }
  return hour;
}

function adjustForMeridiem(hours, meridiem) {
  const intHours = parseInt(hours, 10);
  if (meridiem && meridiem.toLowerCase().startsWith('p') && intHours < 12) {
    hours = intHours + 12;
  }
  if (meridiem && meridiem.toLowerCase().startsWith('a') && intHours === 12) {
    hours = intHours - 12;
  }
  if (!meridiem && !hours.startsWith('0')) {
    hours = adjustForBusinessHours(hours);
  }
  return hours.toString();
}

function limitDayToLastOfMonth(year, month, day) {
  const last = new Date(year, month + 1, 0);
  return Math.min(day, last.getDate());
}

function testForMatches(input = '', userRules = [], systemRules = [], userRejectRules = [], systemRejectRules = []) {
  for (const syntax of [...userRejectRules, ...systemRejectRules]) {
    if (syntax.regex.test(input)) {
      return null;
    }
  }
  for (const syntax of [...userRules, ...systemRules]) {
    if (syntax.regex.test(input)) {
      const matches = input.match(syntax.regex);
      return syntax.parse(matches, input);
    }
  }
  return null;
}

export function parseDateAndTime(input, options = {rules: [], reject: [], preferTime: false, defaultDate: null}) {
  if (isDate(input)) {
    return input;
  }

  if (isTimeStamp(input)) {
    return new Date(input);
  }

  if (isNotValid(input)) {
    return input;
  }

  input = input.toString().trim();

  const parseRules = [
    {
      regex: /^c$/i,
      parse: () => {
        return new Date();
      }
    }
  ];

  const ruleResult = testForMatches(input, options.rules, parseRules, options.reject);
  if (isDate(ruleResult)) {
    return ruleResult;
  }

  const parts = input.replace(/  +/g, ' ').split(' ');

  let datePart = parts.shift() || input;
  let timePart = parts.join(' ') || '00:00:00';

  if (isLikelyISOFormat(input)) {
    datePart = input;
    timePart = null;
  }

  if (options.preferTime && !isLikelyDateFormat(input)) {
    const likelyTime = parseTime(input, options);
    if (isDate(likelyTime)) {
      datePart = options.defaultDate || new Date();
      timePart = likelyTime;
    }
  }

  let parsedDate = parseDate(datePart, options);
  if (!parsedDate) {
    const likelyTime = parseTime(input, options);
    if (isDate(likelyTime)) {
      parsedDate = new Date();
      timePart = likelyTime;
    }
  }

  const parsedTime = parseTime(timePart, options);
  if (parsedDate && parsedTime) {
    parsedDate.setHours(parsedTime.getHours(), parsedTime.getMinutes(), parsedTime.getSeconds(), parsedTime.getMilliseconds());
  }

  return parsedDate;
}

export function parseDate(input, options = {rules: [], reject: []}) {
  if (isDate(input)) {
    return input;
  }

  if (isTimeStamp(input)) {
    return new Date(input);
  }

  if (isNotValid(input)) {
    return input;
  }

  input = input.toString().trim();

  const parseRules = [
    {
      regex: /^c$/i,
      parse: () => {
        return new Date();
      }
    },
    {
      regex: /^t$/i,
      parse: () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^y$/i,
      parse: () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^f$/i,
      parse: () => {
        const date = new Date();
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^l$/i,
      parse: () => {
        const date = new Date();
        date.setDate(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate());
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^\+(\d+)/, // +#
      parse: (matches) => {
        const date = new Date();
        date.setDate(date.getDate() + parseInt(matches[1], 10));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^-(\d+)/, // -#
      parse: (matches) => {
        const date = new Date();
        date.setDate(date.getDate() - parseInt(matches[1], 10));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{1,2})$/, // DD
      parse: (matches) => {
        const date = new Date();
        const parsedDay = parseInt(matches[1], 10);
        date.setDate(limitDayToLastOfMonth(date.getFullYear(), date.getMonth(), parsedDay));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{1,2})[\/\\\-.,;](\d{1,2})?$/, // MM/ or MM/DD
      parse: (matches, input) => {
        const date = new Date();
        const parsedMonth = parseInt(matches[1], 10) - 1;
        const parsedDay = parseInt(matches[2] || 1, 10);
        date.setMonth(parsedMonth, limitDayToLastOfMonth(date.getFullYear(), parsedMonth, parsedDay));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{1,2})[\/\\\-.,;](\d{1,2})[\/\\\-.,;](\d{2,4})?$/, // MM/DD/ or MM/DD/YYYY or MM/DD/YY
      parse: (matches) => {
        let year = matches[3];
        if (year?.length === 2) {
          year = calculateFullYear(year);
        }

        const date = new Date();
        if (year) {
          date.setFullYear(parseInt(year, 10));
        }
        const parsedMonth = parseInt(matches[1], 10) - 1;
        const parsedDay = parseInt(matches[2], 10);
        date.setMonth(parsedMonth, limitDayToLastOfMonth(year || date.getFullYear(), parsedMonth, parsedDay));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{4})[\/\\\-.,;](\d{1,2})[\/\\\-.,;](\d{1,2})$/, // YYYY-MM-DD
      parse: (matches) => {
        const date = new Date();
        const parsedYear = parseInt(matches[1], 10);
        const parsedMonth = parseInt(matches[2], 10) - 1;
        const parsedDay = parseInt(matches[3], 10);
        date.setFullYear(parsedYear, parsedMonth, limitDayToLastOfMonth(parsedYear, parsedMonth, parsedDay));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{8})$/,
      parse: (matches, input) => {
        // YYYYMMDD
        let year = parseInt(input.substring(0, 4), 10);
        let month = parseInt(input.substring(4, 6), 10);
        let day = parseInt(input.substring(6, 8), 10);

        // MMDDYYYY
        if (month > 12 || day > 31) {
          year = parseInt(input.substring(4, 8), 10);
          month = parseInt(input.substring(0, 2), 10);
          day = parseInt(input.substring(2, 4), 10);
        }

        // DDMMYYYY
        if (month > 12 || day > 31) {
          year = parseInt(input.substring(4, 8), 10);
          month = parseInt(input.substring(2, 4), 10);
          day = parseInt(input.substring(0, 2), 10);
        }
        
        const date = new Date();
        date.setFullYear(year, month - 1, limitDayToLastOfMonth(year, month - 1, day));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /.*/,
      parse: (matches, input) => {
        return systemParseDate(input);
      }
    }
  ];

  return testForMatches(input, options.rules, parseRules, options.reject);
}

export function parseTime(input, options = {rules: [], reject: []}) {
  if (isDate(input)) {
    return input;
  }

  if (isTimeStamp(input)) {
    return new Date(input);
  }

  if (isNotValid(input)) {
    return input;
  }

  input = input.toString().trim();

  const rejectRules = [
    {regex: /^(\d+)[\/\\\-](\d+)[\/\\\-](\d{2,})$/}
  ];

  const parseRules = [
    {
      regex: /^c$/i,
      parse: () => {
        return new Date();
      }
    },
    {
      regex: /^-(\d+)/, // -#
      parse: (matches) => {
        const date = new Date();
        date.setMinutes(date.getMinutes() - parseInt(matches[1], 10), 0, 0);
        return date;
      }
    },
    {
      regex: /^\+(\d+)/, // +#
      parse: (matches) => {
        const date = new Date();
        date.setMinutes(date.getMinutes() + parseInt(matches[1], 10), 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{1,4})\s*([ap]m?)?$/i,
      parse: (matches) => {
        const numbers = matches[1];
        const meridiem = matches[2];
        let hour;
        let minutes = 0;
        switch (numbers.length) {
          case 1:
          case 2:
            hour = numbers;
            break;
          case 3:
            hour = numbers.substring(0, 1);
            minutes = numbers.substring(1);
            break;
          case 4:
            hour = numbers.substring(0, 2);
            minutes = numbers.substring(2)
        }

        hour = adjustForMeridiem(hour, meridiem);

        const date = new Date();
        date.setHours(hour, minutes, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{2}):(\d{2}):(\d{2})([.]\d{1,3})?([-+]\d{1,4})$/, // ISO 8601 Time Part
      parse: (matches, input) => {
        return systemParseDate(`${new Date().toISOString().substring(0, 10)} ${input}`);
      }
    },
    {
      regex: /^(\d{1,2})[:.,;\-]?(\d{1,2})?[:.,;\-]?(\d{1,2})?[:.,;\-]?(\d{1,3})?[:.,;\-]?\s*([ap](?=m|^\w|$))?/i,
      parse: (matches) => {
        let hours = matches[1];
        const minutes = matches[2] || 0;
        const seconds = matches[3] || 0;
        const milliseconds = matches[4] || 0;
        const meridiem = matches[5];

        hours = adjustForMeridiem(hours, meridiem);

        const date = new Date();
        date.setHours(hours, minutes, seconds, milliseconds);
        return date;
      }
    }
  ];

  return testForMatches(input, options.rules, parseRules, options.reject, rejectRules);
}