import * as React from "react";
import PropTypes from "prop-types";
import providers from "./providers";

export default function createRemarkAnchor(OrigA) {
    return class RemarkAnchor extends React.Component {
        static propTypes = {
            href: PropTypes.string,
            children: PropTypes.node
        };

        render() {
            const [label] = Array.isArray(this.props.children) ? this.props.children : [];
            if (typeof label === "string" && label.startsWith("!Excalidraw")) {
                for (const provider of providers) {
                    if (provider.test(this.props.href)) {
                        const Component = provider.default;
                        return <Component href={this.props.href} />;
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
