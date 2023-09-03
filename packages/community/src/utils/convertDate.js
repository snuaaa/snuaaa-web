export function convertDate(date) {
  let convertedDate = new Date(date);

  let year = convertedDate.getFullYear().toString().substring(2);
  let month = convertedDate.getMonth() + 1;
  let day = convertedDate.getDate();

  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;

  return (year + '.' + month + '.' + day);
}

export function convertDateWithDay(date) {
  let convertedDate = new Date(date);

  let year = convertedDate.getFullYear().toString();
  let month = convertedDate.getMonth() + 1;
  let day = convertedDate.getDate();

  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;

  return (year + '.' + month + '.' + day);
}

export function convertFullDate(date) {
  if(!date) {
    return '';
  }
  let convertedDate = new Date(date);

  let year = convertedDate.getFullYear();
  let month = convertedDate.getMonth() + 1;
  let day = convertedDate.getDate();
  let hour = convertedDate.getHours();
  let min = convertedDate.getMinutes();

  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;
  hour = hour < 10 ? '0' + hour : hour;
  min = min < 10 ? '0' + min : min;

  return (`${year}.${month}.${day} ${hour}:${min}`);
}

export function convertTime(time) {
  if (!time) {
    return '----';
  }
  if (time < 1000) {
    time = '0' + time;
  }
  if (time < 100) {
    time = '0' + time;
  }
  if (time < 10) {
    time = '0' + time;
  }
  return `${time.toString().substring(0, 2)}:${time.toString().substring(2)}`;
}

export function convertDynamicTime(time) {
  let convertedDate = new Date(time);
  let now = new Date();

  if (now.getTime() - convertedDate.getTime() > 24 * 60 * 60 * 1000) {
    return convertDate(time);
  }
  else if (now.getTime() - convertedDate.getTime() > 1 * 60 * 60 * 1000) {
    return `${Math.floor((now.getTime() - convertedDate.getTime()) / (60 * 60 * 1000))}시간 전`;
  }
  else if (now.getTime() - convertedDate.getTime() > 1 * 60 * 1000){
    return `${Math.floor((now.getTime() - convertedDate.getTime()) / (60 * 1000))}분 전`;        
  }
  else {
    return '방금';
  }
}
