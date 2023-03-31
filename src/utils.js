/**
 * Returns date time string.
 *
 * @return {string} date
 */
function getDateTime() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let secconds = today.getSeconds();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    if (secconds < 10) secconds = '0' + secconds;

    const formattedToday = dd + '.' + mm + '.' + yyyy + ' ' + hours + ':' + minutes + ':' + secconds;
    return formattedToday;
}