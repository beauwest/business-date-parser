function calculateFullYear(input) {
  const currentShortYear = parseInt((new Date()).getFullYear().toString().substring(2), 10);
  const inputAsInt = parseInt(input, 10);
  const prefix = (inputAsInt > currentShortYear + 10 ? '19' : '20');
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

function adjustMeridiem(hour) {
  hour = parseInt(hour, 10);
  if (hour >= 1 && hour <= 6) {
    return hour + 12;
  }
  return hour;
}

export function parseDateAndTime(input) {
  if (isDate(input)) {
    return input;
  }

  input = input.toString().trim();

  let datePart = input;
  let timePart = '00:00:00';

  const firstSpace = input.indexOf(' ');
  if (firstSpace !== -1) {
    datePart = input.substring(0, firstSpace);
    timePart = input.substring(firstSpace + 1);
  }

  const parsedDate = parseDate(datePart);
  const parsedTime = parseTime(timePart);

  if (parsedTime) {
    parsedDate.setHours(parsedTime.getHours(), parsedTime.getMinutes(), parsedTime.getSeconds(), parsedTime.getMilliseconds());
  }

  return parsedDate;
}

export function parseDate(input) {
  if (isDate(input)) {
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
      regex: /^(\d{1,2})[\/\\\-.,;](\d{1,2})$/, // MM/DD
      parse: (matches) => {
        const date = new Date();
        date.setMonth(parseInt(matches[1], 10) - 1);
        date.setDate(parseInt(matches[2], 10));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{1,2})[\/\\\-.,;](\d{1,2})[\/\\\-.,;](\d{2,4})$/, // MM/DD/YYYY or MM/DD/YY
      parse: (matches) => {
        let year = matches[3];
        if (year.length === 2) {
          year = calculateFullYear(year);
        }

        const date = new Date();
        date.setFullYear(parseInt(year, 10));
        date.setMonth(parseInt(matches[1], 10) - 1);
        date.setDate(parseInt(matches[2], 10));
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    {
      regex: /^(\d{4})[\/\\\-.,;](\d{1,2})[\/\\\-.,;](\d{1,2})$/, // YYYY-MM-DD
      parse: (matches) => {
        const date = new Date();
        date.setFullYear(parseInt(matches[1], 10));
        date.setMonth(parseInt(matches[2], 10) - 1);
        date.setDate(parseInt(matches[3], 10));
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

  for (const syntax of parseRules) {
    if (syntax.regex.test(input)) {
      const matches = input.match(syntax.regex);
      return syntax.parse(matches, input);
    }
  }

  return null;
}

export function parseTime(input) {
  if (isDate(input)) {
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
      regex: /^(\d{1,2})[:.,;\-]?(\d{1,2})?[:.,;\-]?(\d{1,2})?[:.,;\-]?(\d{1,3})?[:.,;\-]?\s*([ap]m?)?\s*(\w+)?/i,
      parse: (matches) => {
        let hours = matches[1];
        const minutes = matches[2] || 0;
        const seconds = matches[3] || 0;
        const milliseconds = matches[4] || 0;
        const meridiem = matches[5] || 0;
        const timezone = matches[6];

        if (!meridiem && !hours.startsWith('0')) {
          hours = adjustMeridiem(hours);
        }

        const date = new Date();
        date.setHours(hours, minutes, seconds, milliseconds);
        return date;
      }
    },
    {
      regex: /xxx.*/,
      parse: (matches, string) => {
        let parsed = systemParseDate(string);

        if (!isDate(parsed)) {
          const now = new Date();
          parsed = systemParseDate(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${string}`);
        }
        return parsed;
      }
    }
  ];

  for (const syntax of parseRules) {
    if (syntax.regex.test(input)) {
      const matches = input.match(syntax.regex);
      return syntax.parse(matches, input);
    }
  }

  return null;
}