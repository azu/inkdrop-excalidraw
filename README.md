# Excalidraw for Inkdrop

Allows Inkdrop to embed Excalidraw contents to a note.

Note that printing and exporting are not supported since external contents are loaded asynchronously.

## Features

- Save `.excalidraw` and `.exalidraw.svg` automatically
- Integrate with inkdrop's inline image widgets
- FullScreen support

## Install

```sh
ipm install excalidraw
```

## usage

Write a link with `!Excalidraw` caption like:

```markdown
[!Excalidraw](/path/to/file.excalidraw)
```

or 

```markdown
![Excalidraw](/path/to/file.excalidraw.svg)
```

Preview the note, and you can edit the file as excalidraw file.

![Preview](https://raw.githubusercontent.com/azu/inkdrop-excalidraw/main/img.png)

:memo: This plugin save the updates automatically.

## Settings

You can change save dir from Preferences window:

- **saveDir**: A saving directory for .excalidraw files
- **inlineImageWidgets**: Enable integration for inline image widgets
    - Replace link to `.excalidraw` with img tag to `.excalidraw.svg` automatically

## Context Menu

- **Create Excalidraw**: create `.excalidraw` file to **saveDir** and put the link into current selection

## License

MIT
