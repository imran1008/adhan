# Adhan
Adhan is a simple node.js application that plays the user-specified adhan
audio file.

## Requirements
- node.js
- prayer-times npm (https://github.com/elwafdy/prayer-times)
- mplayer
- pulseaudio

PulseAudio is a soft dependency. The dependency can be removed by changing the
commandLineArgs in the config object.

## Configuration
The configuration can be specified in the 'config' object defined at the top
of the adhan.js file.

## Running
Simply execute the command line: 'node adhan.js'

