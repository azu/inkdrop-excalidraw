# Excalidraw for Inkdrop

Allows Inkdrop to embed Excalidraw contents to a note.

Note that printing and exporting are not supported since external contents are loaded asynchronously.

## Install

```sh
ipm install excalidraw
```

## usage

Write a link with `!Excalidraw` caption like:

```markdown
[!Excalidraw](/path/to/file.excalidraw)
```

Preview the note and you can edit the file as excalidraw file.

![Preview](https://raw.githubusercontent.com/azu/inkdrop-excalidraw/master//img.png)

**Limitation**

- Automatic saving is not supported yet
    - Related Issue: <https://github.com/excalidraw/excalidraw/issues/3532>

## Settings

You can change save dir from Preferences window:

- **saveDir**: path to save directory

## Context Menu

- **Create Excalidraw**: create `.excalidraw` file to **saveDir** and put the link into current selection

## Limitations

- You can't search embedded contents with keywords
- Printing and exporting not supported as they are loaded asynchronously