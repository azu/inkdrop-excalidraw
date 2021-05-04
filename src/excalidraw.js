import createRemarkAnchor from "./remark-anchor";
import { markdownRenderer } from "inkdrop";

import { CompositeDisposable } from "event-kit";

import fs from "fs";
import path from "path";
import dayjs from "dayjs";

const insertText = (text) => {
    const cm = inkdrop.getActiveEditor().cm;
    cm.replaceSelection(text + "\n");
};
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
    return filePath;
};
const subscriptions = new CompositeDisposable();
module.exports = {
    origAComponent: null,
    config: {
        saveDir: {
            title: "save directory for .excalidraw files",
            type: "string",
            default: ""
        }
    },
    activate() {
        if (markdownRenderer) {
            this.setupLinkComponent();
        }
        subscriptions.add(
            inkdrop.commands.add(document.body, {
                "excalidraw:create": () => {
                    const outputFilePath = createExcalidraw(inkdrop.config.get("excalidraw.saveDir"));
                    insertText(`[!Excalidraw](${outputFilePath})`);
                }
            })
        );
        window.addEventListener("message", this.handleMessageFromFrame, false);
    },

    deactivate() {
        if (markdownRenderer) {
            this.unsetLinkComponent();
        }
        subscriptions.dispose();
        subscriptions.window.removeEventListener("message", this.handleMessageFromFrame, false);
    },

    setupLinkComponent() {
        const OrigA = markdownRenderer.remarkReactComponents.a;
        const RemarkAnchor = createRemarkAnchor(OrigA);
        markdownRenderer.remarkReactComponents.a = RemarkAnchor;
        this.origAComponent = OrigA;
    },

    unsetLinkComponent() {
        markdownRenderer.remarkReactComponents.a = this.origAComponent;
    }
};
