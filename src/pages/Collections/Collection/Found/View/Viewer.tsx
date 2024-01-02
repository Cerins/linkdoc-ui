import Markdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import collectionURL from "../../../../../utils/collections/url";
import config from "../../../../../services/config";

export default function Viewer({
    state,
}: {
    state: {
        text: string;
    };
}) {
    const { uuid: colUUID } = useParams();
    const processCustomLinks = (markdown: string) => {
        // TODO []([[]]) syntax
        // Have to allow custom [[]] syntax
        return markdown.replace(/\[\[(.*?)\]\]/g, (_, content) => {
            // Create a custom URL or perform other logic based on 'content'
            const customUrl = collectionURL(colUUID!, content);
            return `[${content}](${customUrl})`;
        });
    };
    const UseImage = ( { alt, src }: any) => {
        // If start with /file, then it's a file
        if(src.startsWith('/file')) {
            const fullUrl = `${config.apiURL}${src}`;
            return (
                <img alt={alt} src={fullUrl} />
            )
        }
        // Otherwise do nothing
        return (
            <img alt={alt} src={src} />
        )
    }
    const UseLink = ({ children, href }: any) => {
    // Check if the href should be handled by React Router
        if(href.startsWith('/file')) {
            const fullUrl = `${config.apiURL}${href}`;
            // Return a regular <a> tag if it's a file
            return (
                <a href={fullUrl} target="_blank">
                    {children}
                </a>
            )
        }
        if (href.startsWith("/")) {
            return <Link to={href}>{children}</Link>;
        }

        // For external links, use a regular <a> tag
        return (
            <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        );
    };
    return (
        <div
            className="panel"
            style={{
                flex: `1 1`,
            }}
        >
            <Markdown
                components={{
                    a: UseLink,
                    img: UseImage,
                }}
                className={"markdown"}
            >
                {processCustomLinks(state.text)}
            </Markdown>
        </div>
    )
}