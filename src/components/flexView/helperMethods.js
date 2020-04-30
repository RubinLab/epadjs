const validateNumber = inputtxt => {
    const letterNumber = /^[0-9]+$/;
    return inputtxt.match(letterNumber);
  };

  export const clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace('^', ' ');
      }
      return string;
    }
  };

  export const reverseCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace(' ', '^');
      }
      return string;
    }
  };

  const validateDateTime = (str, length) => {
    let validNumber = true;
    str
      .substring(0, length)
      .split()
      .forEach(letter => {
        if (!validateNumber(letter)) {
          validNumber = false;
        }
      });
    return validNumber;
  };

  export const formatTime = time => {
    if (validateDateTime(time, 4)) {
      const hour = time.substring(0, 2);
      const min = time.substring(2, 4);
      return hour + ':' + min;
    } else return time;
  };

  export const formatDate = date => {
    if (validateDateTime(date, 8)) {
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);
      return year + '-' + month + '-' + day;
    } else return date;
  };