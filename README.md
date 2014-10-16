hackmaster
======

Combat tracker for my character in hackmaster


Tech
====
- Haskel
- Scotty-web
- sqlite-simple
- aeson
- zepto.js
- bacon.js

Plan
====
Haskel serves static files and provides persistance for event json
Bacon tracks all events and handles derived fields (properties)
entire combat replay possible from event journal
modification and replay from initial value while playing

first time
==========

`cabal sandbox init`


build
=====

`cabal install`


run
===

`./start.sh`
