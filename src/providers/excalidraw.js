import fs from "fs";
import path from "path";
import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";
import { connect } from "react-redux";
import { _clearAppState, _clearElements } from "./helper";
import dayjs from "dayjs";

export function test(filePathOrUrl) {
    if (!filePathOrUrl) {
        return false;
    }
    if (!path.isAbsolute(filePathOrUrl)) {
        return false;
    }
    try {
        // support .excalidraw.svg and .excalidraw.svg?updated=xxx
        return filePathOrUrl.endsWith(".excalidraw") || filePathOrUrl.includes(".excalidraw.svg");
    } catch {
        return false;
    }
}

const readExcalidraw = async (filePath) => {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(content);
};

let exportToSvg = null;

const updateNoteExcalidrawWithSvg = (filePath) => {
    /**
     * @type {CodeMirror.Editor}
     */
    const cm = inkdrop.getActiveEditor().cm;
    const text = cm.getValue();

    const updatedText = text
        // Update timstamp ![Excalidraw](/path/to/file.excalidraw.svg?updated=timestamp)
        .replace(/(!\[Excalidraw]\((.*\.excalidraw)\.svg\?updated=.*?\))/g, (all, link, matchFilePath) => {
            if (matchFilePath !== filePath) {
                return all; // no change
            }
            const svgFilePath = matchFilePath + ".svg";
            if (fs.existsSync(svgFilePath)) {
                const timeStamp = "?updated=" + dayjs().format("YYYY-MM-DD--HH-mm-ss");
                return `![Excalidraw](${svgFilePath + timeStamp})`;
            } else {
                return all;
            }
        })
        // [!Excalidraw](/path/to/file.excalidraw) → ![Excalidraw](/path/to/file.excalidraw.svg?updated=timestamp)
        .replace(/(\[!Excalidraw]\((.*\.excalidraw)\))/g, (all, link, matchFilePath) => {
            if (matchFilePath !== filePath) {
                return all; // no change
            }
            const svgFilePath = matchFilePath + ".svg";
            if (fs.existsSync(svgFilePath)) {
                const timeStamp = "?updated=" + dayjs().format("YYYY-MM-DD--HH-mm-ss");
                return `![Excalidraw](${svgFilePath + timeStamp})`;
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
    if (exportToSvg) {
        const svg = await exportToSvg({
            elements,
            appState
        });
        const serializer = new XMLSerializer();
        const str = serializer.serializeToString(svg);
        await fs.promises.writeFile(filePath + ".svg", str);
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
        updateNoteExcalidrawWithSvg(filePath);
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
            exportToSvg = comp.exportToSvg;
            setComp(comp.default);
        });
    }, [initialData]);
    return (
        <div
            style={{
                width: "100%",
                height: "600px",
                minWidth: "800px",
                minHeight: "600px",
                maxWidth: "100%",
                maxHeight: "100%"
            }}
        >
            {Comp && (
                <Comp
                    ref={excalidrawRef}
                    initialData={initialData}
                    onChange={onChange}
                    onPointerUpdate={onPointerUpdate}
                    viewModeEnabled={viewModeEnabled}
                    zenModeEnabled={zenModeEnabled}
                    gridModeEnabled={gridModeEnabled}
                />
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
