/* Adhan - Adhan player
 * Copyright (C) 2016 Imran Haider
 *
 * This library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Retro is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Retro.  If not, see <http://www.gnu.org/licenses/>.
 */

var PrayerTimes = require('prayer-times');
var exec = require('child_process').exec;

var config = {
    // Directory that contains the Adhan audio files
    dir: '/home/username/audio',

    // Audio file to play for Fajr salat
    fajrAdhan: 'Athan - Al Fajr - Mecca.mp3',

    // Audio file to play for all salats except Fajr
    standardAdhan: 'Athan - Mecca.mp3',

    // GPS coordinates. This can be retrieved from
    // http://www.gps-coordinates.net/
    coordinates: [12.3456, 12.3456],

    // Time methods to be used for the prayer time calculation.
    // Possible values are:
    //   MWL:     Muslim World League
    //   ISNA:    Islamic Society of North America (ISNA) [default]
    //   Egypt:   Egyptian General Authority of Survey
    //   Makkah:  Umm Al-Qura University, Makkah
    //   Karachi: University of Islamic Sciences, Karachi
    //   Tehran:  Institute of Geophysics, University of Tehran
    //   Jafari:  Shia Ithna-Ashari, Leva Institute, Qum
    timeMethod: 'ISNA',

    commandLineArgs: '-quiet -ao pulse'
};

function genExecCallback(prefix) {
    return function(error, stdout, stderr) {
        console.log(prefix + ':', stdout);
        console.error(prefix + ':', stderr);
    };
}

function genPlayAdhan(isFajr) {
    return function() {
        console.log("Playing Adhan...");

        var filename = config.dir + '/';
        filename += (isFajr)? config.fajrAdhan : config.standardAdhan;

        exec('mplayer ' + config.commandLineArgs + ' "' + filename + '"',
             genExecCallback('mplayer'));

        waitForNextAdhan();
    };
}

function scheduleAdhan(isFajr, waitTime) {
    // Break down the waiting time into hours, minutes, and seconds
    var hours = Math.floor(waitTime / 3600000);
    var timeLeft = waitTime % 3600000;
    var minutes = Math.floor(timeLeft / 60000);
    timeLeft = timeLeft % 60000;
    var seconds = Math.floor(timeLeft / 1000);

    // Stringify the integers
    hours = (hours < 10 && '0' || '') + hours;
    minutes = (minutes < 10 && '0' || '') + minutes;
    seconds = (seconds < 10 && '0' || '') + seconds;

    console.log('Time left until next Adhan: ' + hours + ':' + minutes + ':' + seconds);
    setTimeout(genPlayAdhan(isFajr), waitTime);
}

function waitForNextAdhan() {
    // Compute salat times
    var prayerTimes = new PrayerTimes();

    prayerTimes.setMethod(config.timeMethod);
    var salatTimes = prayerTimes.getTimes(new Date(), config.coordinates);

    // The salat times returned by prayerTimes.getTimes() is in string format.
    // We need it to be stored as a Date object
    var regex = /(.*) \d\d:\d\d:\d\d [A-Z][A-Z][A-Z]/;
    var datePrefix = (new Date()).toGMTString().match(regex)[1];

    for (salat in salatTimes) {
        salatTimes[salat] = new Date(datePrefix + ' ' + salatTimes[salat]);
    }

    // Convert the salat times table into a 'milliseconds remaining' table
    for (salat in salatTimes) {
        salatTimes[salat] = Math.floor(salatTimes[salat] - new Date());
    }

    if (salatTimes.fajr >= 0) {
        scheduleAdhan(true, salatTimes.fajr);
    }
    else if (salatTimes.dhuhr >= 0) {
        scheduleAdhan(false, salatTimes.dhuhr);
    }
    else if (salatTimes.asr >= 0) {
        scheduleAdhan(false, salatTimes.asr);
    }
    else if (salatTimes.maghrib >= 0) {
        scheduleAdhan(false, salatTimes.maghrib);
    }
    else if (salatTimes.isha >= 0) {
        scheduleAdhan(false, salatTimes.isha);
    }
}

function main() {
    waitForNextAdhan();
}

main();

