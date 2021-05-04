// FIXME: Copy from https://github.com/excalidraw/excalidraw/blob/5c73c5813ce92d3c7b0610530f78ccb06a47d983/src/data/json.ts#L16-L27
// License: https://github.com/excalidraw/excalidraw/blob/master/LICENSE

const APP_STATE_STORAGE_CONF = {
    theme: { browser: true, export: false },
    collaborators: { browser: false, export: false },
    currentChartType: { browser: true, export: false },
    currentItemBackgroundColor: { browser: true, export: false },
    currentItemEndArrowhead: { browser: true, export: false },
    currentItemFillStyle: { browser: true, export: false },
    currentItemFontFamily: { browser: true, export: false },
    currentItemFontSize: { browser: true, export: false },
    currentItemLinearStrokeSharpness: { browser: true, export: false },
    currentItemOpacity: { browser: true, export: false },
    currentItemRoughness: { browser: true, export: false },
    currentItemStartArrowhead: { browser: true, export: false },
    currentItemStrokeColor: { browser: true, export: false },
    currentItemStrokeSharpness: { browser: true, export: false },
    currentItemStrokeStyle: { browser: true, export: false },
    currentItemStrokeWidth: { browser: true, export: false },
    currentItemTextAlign: { browser: true, export: false },
    cursorButton: { browser: true, export: false },
    draggingElement: { browser: false, export: false },
    editingElement: { browser: false, export: false },
    editingGroupId: { browser: true, export: false },
    editingLinearElement: { browser: false, export: false },
    elementLocked: { browser: true, export: false },
    elementType: { browser: true, export: false },
    errorMessage: { browser: false, export: false },
    exportBackground: { browser: true, export: false },
    exportEmbedScene: { browser: true, export: false },
    exportWithDarkMode: { browser: true, export: false },
    fileHandle: { browser: false, export: false },
    gridSize: { browser: true, export: true },
    height: { browser: false, export: false },
    isBindingEnabled: { browser: false, export: false },
    isLibraryOpen: { browser: false, export: false },
    isLoading: { browser: false, export: false },
    isResizing: { browser: false, export: false },
    isRotating: { browser: false, export: false },
    lastPointerDownWith: { browser: true, export: false },
    multiElement: { browser: false, export: false },
    name: { browser: true, export: false },
    offsetLeft: { browser: false, export: false },
    offsetTop: { browser: false, export: false },
    openMenu: { browser: true, export: false },
    pasteDialog: { browser: false, export: false },
    previousSelectedElementIds: { browser: true, export: false },
    resizingElement: { browser: false, export: false },
    scrolledOutside: { browser: true, export: false },
    scrollX: { browser: true, export: false },
    scrollY: { browser: true, export: false },
    selectedElementIds: { browser: true, export: false },
    selectedGroupIds: { browser: true, export: false },
    selectionElement: { browser: false, export: false },
    shouldAddWatermark: { browser: true, export: false },
    shouldCacheIgnoreZoom: { browser: true, export: false },
    showHelpDialog: { browser: false, export: false },
    showStats: { browser: true, export: false },
    startBoundElement: { browser: false, export: false },
    suggestedBindings: { browser: false, export: false },
    toastMessage: { browser: false, export: false },
    viewBackgroundColor: { browser: true, export: true },
    width: { browser: false, export: false },
    zenModeEnabled: { browser: true, export: false },
    zoom: { browser: true, export: false },
    viewModeEnabled: { browser: false, export: false }
};
export const _clearAppState = (appState) => {
    const stateForExport = {};
    for (const key of Object.keys(appState)) {
        const propConfig = APP_STATE_STORAGE_CONF[key];
        if (propConfig?.["export"]) {
            // @ts-ignore see https://github.com/microsoft/TypeScript/issues/31445
            stateForExport[key] = appState[key];
        }
    }
    return stateForExport;
};
export const isLinearElementType = (elementType) => {
    return elementType === "arrow" || elementType === "line" || elementType === "draw";
};

export const _clearElements = (elements) => {
    return elements.map((element) =>
        isLinearElementType(element.type) ? { ...element, lastCommittedPoint: null } : element
    );
};
