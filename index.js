function calculateFullYear(input) {
  const currentYear = (new Date()).getFullYear().toString();
  const currentShortPrefix = parseInt(currentYear.substring(0, 2), 10);
  const currentShortSuffix = parseInt(currentYear.substring(2), 10);
  const inputAsInt = parseInt(input, 10);
  const prefix = (inputAsInt > currentShortSuffix + 10 ? currentShortPrefix - 1 : currentShortPrefix);
  return `${prefix}${input}`;
}

function systemParseDate(input) {
  let parsed = Date.parse(input);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }
  if (!isDate(parsed)) {
    parsed = new Date(input);
  }

  if (isDate(parsed)) {
    return;
  }
  return input;
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

function testForMatches(input = '', userRules = [], systemRules = []) {
  for (const syntax of [...userRules, ...systemRules]) {
    if (syntax.regex.test(input)) {
      const matches = input.match(syntax.regex);
      return syntax.parse(matches, input);
    }
  }
  return null;
}

export function parseDateAndTime(input, options = {rules: [], preferTime: false, defaultDate: null}) {
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

  let datePart = input;
  let timePart = '00:00:00';

  const firstSpace = input.indexOf(' ');
  if (firstSpace !== -1) {
    datePart = input.substring(0, firstSpace);
    timePart = input.substring(firstSpace + 1);
  } else {
    if (options.preferTime && !isLikelyDateFormat(input)) {
      datePart = options.defaultDate || new Date();
      timePart = input;
    }
  }

  const parsedDate = parseDate(datePart, options);
  const parsedTime = parseTime(timePart, options);

  if (parsedTime) {
    parsedDate.setHours(parsedTime.getHours(), parsedTime.getMinutes(), parsedTime.getSeconds(), parsedTime.getMilliseconds());
  }

  return parsedDate;
}

export function parseDate(input, options = {rules: []}) {
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
        date.setDate(parseInt(matches[1], 10));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{1,2})[\/\\\-.,;](\d{1,2})?$/, // MM/ or MM/DD
      parse: (matches, input) => {
        const date = new Date();
        date.setMonth(parseInt(matches[1], 10) - 1, parseInt(matches[2] || 1, 10));
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
        date.setMonth(parseInt(matches[1], 10) - 1, parseInt(matches[2], 10));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{4})[\/\\\-.,;](\d{1,2})[\/\\\-.,;](\d{1,2})$/, // YYYY-MM-DD
      parse: (matches) => {
        const date = new Date();
        date.setFullYear(parseInt(matches[1], 10));
        date.setMonth(parseInt(matches[2], 10) - 1, parseInt(matches[3], 10));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /.*/,
      parse: (matches, string) => {
        return Date.parse(string) || new Date(string);
      }
    }
  ];

  return testForMatches(input, options.rules, parseRules);
}

export function parseTime(input, options = {rules: []}) {
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
      regex: /^(\d{1,2})[:.,;\-]?(\d{1,2})?[:.,;\-]?(\d{1,2})?[:.,;\-]?(\d{1,3})?[:.,;\-]?\s*([ap]m?)?/i,
      parse: (matches, input) => {
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

  return testForMatches(input, options.rules, parseRules);
}