import fs from "fs";
import path from "path";
import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";
import { connect } from "react-redux";
import { _clearAppState, _clearElements } from "./helper";
import dayjs from "dayjs";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { BsArrowsFullscreen } from "react-icons/bs";

export function test(filePathOrUrl) {
    if (!filePathOrUrl) {
        return false;
    }
    if (!path.isAbsolute(filePathOrUrl)) {
        return false;
    }
    try {
        // support .excalidraw.png and .excalidraw.png?updated=xxx
        return filePathOrUrl.endsWith(".excalidraw") || filePathOrUrl.includes(".excalidraw.png");
    } catch {
        return false;
    }
}

const readExcalidraw = async (filePath) => {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(content);
};

let exportToBlob = null;

const updateNoteExcalidrawWithImage = (filePath) => {
    /**
     * @type {CodeMirror.Editor}
     */
    const cm = inkdrop.getActiveEditor().cm;
    const text = cm.getValue();

    const updatedText = text
        // Update timstamp ![Excalidraw](/path/to/file.excalidraw.png?updated=timestamp)
        .replace(/(!\[Excalidraw]\((.*\.excalidraw)\.png\?updated=.*?\))/g, (all, link, matchFilePath) => {
            if (matchFilePath !== filePath) {
                return all; // no change
            }
            const imageFilePath = matchFilePath + ".png";
            if (fs.existsSync(imageFilePath)) {
                const timeStamp = "?updated=" + dayjs().format("YYYY-MM-DD--HH-mm-ss");
                return `![Excalidraw](${imageFilePath + timeStamp})`;
            } else {
                return all;
            }
        })
        // [!Excalidraw](/path/to/file.excalidraw) → ![Excalidraw](/path/to/file.excalidraw.png?updated=timestamp)
        .replace(/(\[!Excalidraw]\((.*\.excalidraw)\))/g, (all, link, matchFilePath) => {
            if (matchFilePath !== filePath) {
                return all; // no change
            }
            const imageFilePath = matchFilePath + ".png";
            if (fs.existsSync(imageFilePath)) {
                const timeStamp = "?updated=" + dayjs().format("YYYY-MM-DD--HH-mm-ss");
                return `![Excalidraw](${imageFilePath + timeStamp})`;
            } else {
                return all;
            }
        });

    if (text !== updatedText) {
        cm.setValue(updatedText);
    }
};

const writeExcalidraw = async (filePath, { elements, appState }) => {
    if (elements.length === 0) {
        return; // does not save when no element
    }
    if (!fs.existsSync(filePath)) {
        return;
    }
    if (exportToBlob) {
        const blob = await exportToBlob({
            elements,
            appState
        });
        await new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = function () {
                fs.promises
                    .writeFile(filePath + ".png", Buffer.from(new Uint8Array(fileReader.result)))
                    .then(resolve, reject);
            };
            fileReader.readAsArrayBuffer(blob);
        });
    }
    const serializedData = {
        type: "excalidraw",
        version: 2,
        source: "file://",
        elements: _clearElements(elements),
        appState: _clearAppState(appState)
    };
    await fs.promises.writeFile(filePath, JSON.stringify(serializedData), "utf-8");

    const enabledInlineImageWidgets = inkdrop.config.get("excalidraw.inlineImageWidgets");
    if (enabledInlineImageWidgets) {
        updateNoteExcalidrawWithImage(filePath);
    }
};

function ExcalidrawWrapper(props) {
    const excalidrawRef = useRef(null);
    const [Comp, setComp] = useState(null);
    const [viewModeEnabled] = useState(false);
    // excalidraw call onChange when startup
    // for avoiding hidden updating
    const [updateAtLeastOne, setUpdateAtLeastOne] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [zenModeEnabled] = useState(false);
    const [gridModeEnabled] = useState(false);
    const handle = useFullScreenHandle();

    const onChange = useDebouncedCallback(
        useCallback(
            (elements, appState) => {
                if (!updateAtLeastOne) {
                    return;
                }
                writeExcalidraw(props.filePath, { elements, appState }).catch((error) => {
                    console.error("save error on " + props.filePath, error);
                });
            },
            [excalidrawRef, updateAtLeastOne]
        ),
        500
    );
    const onPointerUpdate = useCallback(() => {
        setUpdateAtLeastOne(true);
    }, []);

    useEffect(() => {
        const DEFAULT_STATE = {
            elements: [],
            appState: { viewBackgroundColor: "#FFFFFF" }
        };
        if (!props.filePath.endsWith(".excalidraw")) {
            return setInitialData(DEFAULT_STATE);
        }
        readExcalidraw(props.filePath)
            .then((state) => setInitialData(state))
            .catch((error) => {
                console.error("parse error on " + props.filePath, error);
                setInitialData(DEFAULT_STATE);
            });
        return () => {
            setInitialData(null);
        };
    }, [props.preview.renderId]);
    useEffect(() => {
        if (!initialData) {
            return;
        }
        // Load from local to avoid CSP error
        window.EXCALIDRAW_ASSET_PATH = path.join(__dirname, "../../resources") + "/";
        import("@excalidraw/excalidraw").then((comp) => {
            exportToBlob = comp.exportToBlob;
            setComp(comp.default);
        });
    }, [initialData]);
    return (
        <div className={"inkdrop-excalidraw-container"}>
            {Comp && (
                <>
                    <div className={"inkdrop-excalidraw-toolbar"}>
                        <button onClick={handle.enter} className={"inkdrop-excalidraw-fullscreenButton"}>
                            <BsArrowsFullscreen />
                        </button>
                    </div>
                    <FullScreen handle={handle} className={"inkdrop-excalidraw-fullscreen"}>
                        <Comp
                            ref={excalidrawRef}
                            initialData={initialData}
                            onChange={onChange}
                            onPointerUpdate={onPointerUpdate}
                            viewModeEnabled={viewModeEnabled}
                            zenModeEnabled={zenModeEnabled}
                            gridModeEnabled={gridModeEnabled}
                        />
                    </FullScreen>
                </>
            )}
        </div>
    );
}

ExcalidrawWrapper.prototype.propTypes = {
    filePath: PropTypes.string,
    preview: PropTypes.object
};

const connector = connect(
    ({ preview }) => ({ preview }),
    (dispatch) => ({ dispatch })
);
export default connector(ExcalidrawWrapper);
