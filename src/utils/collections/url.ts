/**
 * Generates a URL for a collection and document.
 * 
 * @param colUUID - The UUID of the collection.
 * @param docName - The name of the document.
 * @returns The generated URL.
 */
export default function collectionURL(colUUID: string, docName: string) {
    return `/collections/${colUUID}/${docName}`;
}
