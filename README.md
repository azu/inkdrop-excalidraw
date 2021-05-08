# Excalidraw for Inkdrop

Allows Inkdrop to embed Excalidraw contents to a note.

Note that printing and exporting are not supported since external contents are loaded asynchronously.

## Features

- Save `.excalidraw` and `.exalidraw.png` automatically
- Integrate with inkdrop's inline image widgets
- FullScreen support

## Install

```sh
ipm install excalidraw
```

## usage

1. Setup **saveDir** from plugins' preferences window.
2. Open a note and Click "Create Excalidraw" of Context menu
3. Preview the node and edit Excalidraw!

### details of mechanism

Write a link with `!Excalidraw` caption like:

```markdown
[!Excalidraw](file:///path/to/file.excalidraw)
```

or 

```markdown
![Excalidraw](file:///path/to/file.excalidraw.png)
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
