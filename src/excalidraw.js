import createRemarkAnchor from "./remark-anchor";
import { markdownRenderer } from "inkdrop";

import { CompositeDisposable } from "event-kit";

import fs from "fs";
import url from "url";
import path from "path";
import dayjs from "dayjs";
import createRemarkImg from "./remark-img";

const insertText = (text) => {
    const cm = inkdrop.getActiveEditor().cm;
    cm.replaceSelection(text + "\n");
};

/**
 * Create new .excalidraw file and return file:/// url
 * @param dirPath
 * @returns {URL}
 */
const createExcalidraw = (dirPath) => {
    const DEFAULT_STATE = {
        type: "excalidraw",
        version: 2,
        source: "file://",
        elements: [],
        appState: {
            viewBackgroundColor: "#FFFFFF"
        }
    };
    if (!dirPath) {
        throw new Error("Please set dirPath");
    }
    const filePath = path.join(dirPath, dayjs().format("YYYY-MM-DD--HH-mm-ss") + ".excalidraw");
    fs.writeFileSync(filePath, JSON.stringify(DEFAULT_STATE), "utf-8");
    return url.pathToFileURL(filePath);
};
const subscriptions = new CompositeDisposable();
module.exports = {
    origAComponent: null,
    config: {
        saveDir: {
            title: "A saving directory for .excalidraw files",
            description: "Put the path to directory for saving .excalidraw files. e.g. /path/to/excalidraw-files/",
            type: "string",
            default: ""
        },
        inlineImageWidgets: {
            title: "Enable integration for inline image widgets",
            description: "If it is enabled, prefer to use image tag instead of link to .excalidraw",
            type: "boolean",
            default: false
        }
    },
    activate() {
        if (markdownRenderer) {
            this.setupLinkComponent();
        }
        subscriptions.add(
            inkdrop.commands.add(document.body, {
                "excalidraw:create": () => {
                    const saveDir = inkdrop.config.get("excalidraw.saveDir");
                    if (!saveDir) {
                        return alert("Please set saveDir of excalidraw plugin");
                    }
                    const outputFilePath = createExcalidraw(saveDir);
                    insertText(`[!Excalidraw](${outputFilePath.toString()})`);
                }
            })
        );
    },

    deactivate() {
        if (markdownRenderer) {
            this.unsetLinkComponent();
        }
        subscriptions.dispose();
    },

    setupLinkComponent() {
        const OrigA = markdownRenderer.remarkReactComponents.a;
        markdownRenderer.remarkReactComponents.a = createRemarkAnchor(OrigA);
        this.origAComponent = OrigA;
        const OrigImg = markdownRenderer.remarkReactComponents.img;
        markdownRenderer.remarkReactComponents.img = createRemarkImg(OrigA);
        this.orgImgComponent = OrigImg;
    },

    unsetLinkComponent() {
        markdownRenderer.remarkReactComponents.a = this.origAComponent;
        markdownRenderer.remarkReactComponents.img = this.orgImgComponent;
    }
};
