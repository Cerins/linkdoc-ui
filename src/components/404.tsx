import useTextContext from "../contexts/Text";

export default function NonExistentPage() {
    const { text } = useTextContext();
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <p>{text("404")}</p>
        </div>
    )
}