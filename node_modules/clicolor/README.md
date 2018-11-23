
# clicolor

Display pretty colored text and single-line status updates in your CLI tool.

Example:

```javascript
const clicolor = require("clicolor");
const cli = clicolor();

cli.display(cli.color("purple", "ATTENTION"), ": ", cli.color("green", "I am feeling green today."));

cli.status(cli.format(formats, "Building space station <progress>(24%)</progress> ...");
```


# API

## Setup

A `clicolor` object tracks quiet mode, whether we're using color codes, and the state of any single-line status display.

- `clicolor(options: Options = {}): CliColor`
  The `Options` object has these fields:
    - `width?: number`: Screen width. Defaults to the current terminal width, if possible, or 80 otherwise.
    - `frequency?: number`: Minimum delay (in milliseconds) between updates to a single-line status, to avoid flooding a terminal. Default is 100.
    - `useColor?: boolean`: True or false: Should we emit color codes? If false, only plain text is emitted. By default, clicolor will use "true" if it detects a TTY, or "false" if not.
    - `quiet?: boolean`: True or false: If false, "verbose" and single-line status updates will be displayed. If true, they will be squelched.
    - `styles?: { [key: string]: string }`: Map of additional color names to use when resolving colors (described below).

These methods can be used to configure modes after constructing the object:

  - `useColor(v: boolean): void`
  - `quiet(v: boolean): void`

## Color spans

Clicolor uses "span" objects internally to represent text with embedded formatting. Each method will accept either strings, span objects, or a mix. You don't need to use span objects directly; you can combine them and then pass them to a display method without ever looking inside. If you want to render one immediately, call `toString()` on it.

Color names may be common American names like "green" or "brown", or hex codes like "fff" or "3a3acc". (Check out the [antsy](https://www.npmjs.com/package/antsy) module for the full list.) They may also be one of these special names, defined in the default `styles` object:

  + `dim` - a dimmer but still readable white
  + `timestamp` - a lovely shade of teal, suitable for timestamps
  + `warning` - a bright warning orange, used by `displayWarning`
  + `error` - a bright error red, used by `displayError`

You may add or override styles by passing them in a `styles` object in the constructor. For example, to define the color "frog" as a deep green:

```es6
const cli = clicolor({ styles: { frog: "#3f3" } });
```

Each of these methods takes one or more strings (or spans), for convenience, and applies an effect to the whole set of strings/spans combined. For example,

```es6
cli.color("green", "this is ", "all green.");
```

makes the whole string ("this is all green") green.

An array of spans or strings is defined as `type Spans = Array<Span | string>`.

Methods on `CliColor` are:

  - `color(colorName: string, ...spans: Spans): Span`: Set the foreground color to the named color or style.

  - `backgroundColor(colorName: string, ...spans: Spans): Span`: Set the background color to the named color or style.

  - `bold(...spans: Spans): Span`: Display this combined string/span in bold (strong weight).

  - `underline(...spans: Spans): Span`: Underline this combined string/span.

  - `italic(...spans: Spans): Span`: Italicize this combined string/span.

  - `padLeft(length: number, ...spans: Spans): Span`: Pad the combined string/span with spaces on the left, until it reaches the desired length.

  - `padRight(length: number, ...spans: Spans): Span`: Pad the combined string/span with spaces on the right, until it reaches the desired length.

  - `merge(...spans: Spans): Span`: Combine multiple strings/spans into one.

## Format

If you have a preset format that you'd like to use to fill in colors or padding, `format` is the method for you. It formats a string by mapping embedded XML-ish codes (like `<warning>`) to format descriptions.

- `format(formatters: { [key: string]: Format }, s: string): Span`

For example,

```es6
const myFormat = {
  debug: { color: "cyan" },
  n: { color: "blue", padLeft: 4 }
};
cli.display(cli.format(myFormat, `<debug>Downloading launch codes (<n>${soFar}</n> of <n>${total}</n>)</debug>`));
```

would display something like

```
Downloading launch codes (  23 of  739)
```

with the "23" and "739" in blue, and the rest in cyan.

Valid fields in a `Format` object are:

  - `color?: string`: foreground color or style
  - `backgroundColor?: string`: background color or style
  - `bold?: boolean`: true/false to bold this span
  - `underline?: boolean`: true/false to underline this span
  - `italic?: boolean`: true/false to italicize this span
  - `padLeft?: number`: fill on the left with spaces to the desired length
  - `padRight?: number`: fill on the right with spaces to the desired length

## Display

Several methods exist to display a formatted span (or ordinary string) to the terminal. If color codes have been turned off, the formatting will be ignored. If a single-line status is currently active, it will be cleared first.

  - `display(...spans: Spans): void` - Write the formatted text to stdout, followed by a linefeed.

  - `displayVerbose(...spans: Spans): void` - Write the formatted text to stdout, followed by a linefeed, but only if quiet mode is off.

  - `displayWarning(...spans: Spans): void` - Write the formatted text to stderr, followed by a linefeed, using the "warning" color style.

  - `displayError(...spans: Spans): void` - Write the formatted text to stderr, followed by a linefeed, using the "error" color style.

## Status

A single-line status update can be used to display progress in interactive applications. A status update is just text (possibly with color codes) that's displayed without a linefeed. Periodically, the text is updated by sending a CR, a line full of spaces, another CR, and the new text. This makes it update in place without moving to a new line. The updates are rate-limited (to 10 per second by default, or 100ms). If the text is longer than the screen width, it's truncated so it won't cause the line to wrap.

- `status(...spans: Spans): void` - Update the status display, if connected to a TTY and not in quiet mode. To clear the status line and return to normal, call `status()` with no parameters.

## Helpers

- `screenWidth(): number` - Return our current guess about the screen width.

# License

Apache 2 (open-source) license, included in 'LICENSE.txt'.

# Authors

@robey - Robey Pointer <robeypointer@gmail.com>
