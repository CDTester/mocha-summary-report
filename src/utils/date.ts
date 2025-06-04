import moment from "moment";

/**
 * wait a specific amount of time
 * @param {number} ms - time in milliseconds
 */
export async function wait (ms) {
  console.log(`\x1b[90m \t waiting ${ms} milliseconds \x1b[0m`);
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * getWeekday - checks if date is mon-fri. if not then it retuns the next date that is a weekday
 * @param {string} date - 
 * @param {boolean} nextWeekday - Optional, defaults to true. set to false if you want previous date
 * @param {format} format - Optional format of date, defaults to YYYY-MM-DD
 * @return {string} date
 */
export function getWeekday (date:string, nextWeekday: boolean = true, format:string = 'YYYY-MM-DD'): string {
  const day:number = moment(date).isoWeekday();
  let returnDate:string = moment(date).format(format);
  if (day > 5) {
    returnDate = nextWeekday ? moment(date).add(8 - day, 'd').format(format) : moment(date).subtract(day - 5, 'd').format(format);
  }
  return returnDate;
}