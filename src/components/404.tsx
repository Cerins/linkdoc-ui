import useTextContext from "../contexts/Text";

export default function NonExistentPage() {
    const { text } = useTextContext();
    // Default text if for some reason the text context is not available
    // This can include not only 404 cases so naming is a bit deceiving
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <p>{text("404")}</p>
        </div>
    )
}