# Reading notebook

A working application using the real installed native npm package, with a pinned npm lockfile. No native API mocks or JavaScript substitutes.

Run `npm ci` and `npm start`. Local acceptance uses Chromium against the actual HTTP server. This is a public Dev acceptance application; do not enter personal data or real credentials.

Class: **native npm**. Runtime exceptions are preserved for diagnosis.

Release 2 embeds HTML/CSS and reports genuine native import errors at /api/runtime, to distinguish package loading from static-file access. No native implementation is replaced. SQLite health uses a separate temporary in-memory probe only; user notes always remain file-backed.
