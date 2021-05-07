import * as React from "react";
import PropTypes from "prop-types";
import providers from "./providers";

export default function createRemarkImg(OrigA) {
    return class RemarkImg extends React.Component {
        static propTypes = {
            alt: PropTypes.string,
            src: PropTypes.string,
            children: PropTypes.node
        };

        render() {
            const alt = this.props.alt;
            if (typeof alt === "string" && alt === "Excalidraw") {
                for (const provider of providers) {
                    if (provider.test(this.props.src)) {
                        const filePath = this.props.src.replace(/\.svg(\?updated=.*)?$/, "");
                        const Component = provider.default;
                        return <Component filePath={filePath} />;
                    }
                }
            }
            if (OrigA) {
                return <OrigA {...this.props}>{this.props.children}</OrigA>;
            } else {
                return <a {...this.props}>{this.props.children}</a>;
            }
        }
    };
}
