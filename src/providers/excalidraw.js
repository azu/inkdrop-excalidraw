import fs from "fs";
import path from "path";
import React from "react";
import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";

export function test(_) {
    return true; // true
}

const readExcalidraw = async (filePath) => {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(content);
};

let exportToSvg = null;
const writeExcalidraw = async (filePath, { elements, appState }) => {
    if (exportToSvg) {
        const svg = await exportToSvg({
            elements,
            appState
        });
        const serializer = new XMLSerializer();
        const str = serializer.serializeToString(svg);
        return fs.promises.writeFile(filePath + ".svg", str);
    }
    // const serializedData = serializeAsJSON(elements, appState);
    // return fs.promises.writeFile(filePath, serializedData, "utf-8");
};

function DynamicExcalidraw(props) {
    const [Comp, setComp] = useState(null);
    useEffect(() => {
        if (!props.initialData) {
            return;
        }
        // Load from local to avoid CSP error
        window.EXCALIDRAW_ASSET_PATH = path.join(__dirname, "../../resources") + "/";
        import("@excalidraw/excalidraw").then((comp) => {
            exportToSvg = comp.exportToSvg;
            setComp(comp.default);
        });
    }, [props.initialData]);
    return <>{Comp && <Comp {...props} />}</>;
}

DynamicExcalidraw.prototype.propTypes = {
    initialData: PropTypes.object
};

export default function ExcalidrawWrapper(props) {
    const excalidrawRef = useRef(null);
    const [viewModeEnabled] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [zenModeEnabled] = useState(false);
    const [gridModeEnabled] = useState(false);
    const onChange = useDebouncedCallback((elements, appState) => {
        writeExcalidraw(props.href, { elements, appState }).catch((error) => {
            console.error("save error on " + props.href, error);
        });
    }, 500);
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
    }, []);
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
            <DynamicExcalidraw
                ref={excalidrawRef}
                initialData={initialData}
                onChange={onChange}
                viewModeEnabled={viewModeEnabled}
                zenModeEnabled={zenModeEnabled}
                gridModeEnabled={gridModeEnabled}
            />
        </div>
    );
}

ExcalidrawWrapper.prototype.propTypes = {
    href: PropTypes.string
};
