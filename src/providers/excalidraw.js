import fs from "fs";
import path from "path";
import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";
import { connect } from "react-redux";
import { _clearAppState, _clearElements } from "./helper";

export function test(_) {
    return true; // true
}

const readExcalidraw = async (filePath) => {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(content);
};

let exportToSvg = null;

const writeExcalidraw = async (filePath, { elements, appState }) => {
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
};

function ExcalidrawWrapper(props) {
    const excalidrawRef = useRef(null);
    const [Comp, setComp] = useState(null);
    const [viewModeEnabled] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [zenModeEnabled] = useState(false);
    const [gridModeEnabled] = useState(false);
    const onChange = useDebouncedCallback(
        useCallback(
            (elements, appState) => {
                writeExcalidraw(props.href, { elements, appState }).catch((error) => {
                    console.error("save error on " + props.href, error);
                });
            },
            [excalidrawRef]
        ),
        500
    );
    useEffect(() => {
        const DEFAULT_STATE = {
            elements: [],
            appState: { viewBackgroundColor: "#FFFFFF" }
        };
        if (!props.href.endsWith(".excalidraw")) {
            return setInitialData(DEFAULT_STATE);
        }
        readExcalidraw(props.href)
            .then((state) => setInitialData(state))
            .catch((error) => {
                console.error("parse error on " + props.href, error);
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
                    viewModeEnabled={viewModeEnabled}
                    zenModeEnabled={zenModeEnabled}
                    gridModeEnabled={gridModeEnabled}
                />
            )}
        </div>
    );
}

ExcalidrawWrapper.prototype.propTypes = {
    href: PropTypes.string,
    preview: PropTypes.object
};

const connector = connect(
    ({ preview }) => ({ preview }),
    (dispatch) => ({ dispatch })
);
export default connector(ExcalidrawWrapper);
