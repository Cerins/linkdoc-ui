/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { useNavigate, useParams } from "react-router-dom";
import collectionURL from "../../../../utils/collections/url";
import standardDate from "../../../../utils/date/stamdard";
import DatePicker from "./DatePicker";
import SearchButton from "./SearchButton";
import Share from "./Share";
import { Mode } from "../utils";
import { apply } from "../../../../utils/css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faEye, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import config from "../../../../services/config";
import { fetchCSRFToken } from "../../../../services/login";
import useModalContext, { ModalLike } from "../../../../contexts/Modal";
import Spinner from "../../../../components/Spinner";
import { useState } from "react";
import useTextContext from "../../../../contexts/Text";

function UploadPopup() {
    return (
        <ModalLike>
            <Spinner />
        </ModalLike>
    )
}

export default function SubHeader({
    showEditor,
    showRead,
    setMode,
    cmRef
}:{
    showEditor: boolean;
    showRead: boolean;
    setMode: React.Dispatch<React.SetStateAction<Mode>>;
    cmRef: React.MutableRefObject<CodeMirror.Editor | undefined>
}) {
    const navigator = useNavigate();
    const { uuid: colUUID } = useParams();
    
    function onDatePick(date: Date | null) {
        if (date === null) return;
        const stDate = standardDate(date);
        navigator(collectionURL(colUUID!, stDate));
    }
    // Allow to toggle between editor and read mode
    // or both
    function onToggleClick() {
        setMode((mode) => (mode % Mode.BOTH) + 1);
    }
    const [uploading, setUploading] = useState(false);
    const { showMessage } = useModalContext();
    const { text } = useTextContext();
    return (
        <>
            {
                uploading && <UploadPopup />
            }
            <div className="flex">
                <div className="flex items-center grow">
                    <SearchButton />
                    <DatePicker date={null} setDate={onDatePick} />
                    {/* The component which allows to upload a file */}
                    <form
                        style={{
                            display: showEditor ? "block" : "none",
                        }}
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                    // Include cookies
                    >
                        {/* Hidden input to pass colUUID to file upload */}
                        <input type="text" name="colUUID" value={colUUID} readOnly hidden />

                        <label htmlFor="file-upload" className="mx-2">
                            <FontAwesomeIcon icon={faPaperclip} />
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            name="file"
                            onChange={async(e) => {
                                const file = e.target.files?.[0];
                                setUploading(true);
                                if (file === undefined) {
                                    setUploading(false);
                                    return;
                                }
                                // Instantly trigger the upload
                                // of the form
                                // If the file exceeds 10MB, instantly show error
                                // TODO: Remove hard coded value
                                if(file.size > 10 * 1024 * 1024) {
                                    showMessage({
                                        message: text('FILE_TOO_LARGE'),
                                        buttons: [
                                            {
                                                name: text('BUTTON_OK'),
                                                callback: () => {},
                                            }
                                        ],
                                    })
                                    setUploading(false);
                                    return;
                                }
                                const CSRRFToken = await fetchCSRFToken();
                                const formData = new FormData(e.target.form as HTMLFormElement);
                                const mimeType = file.type;
                                // Simply send the file to the server
                                const xhr = new XMLHttpRequest();
                                xhr.open("POST", `${config.apiURL}/file`);
                                // Add cookies
                                xhr.withCredentials = true;
                                // Have to send the token to prevent CSRF
                                xhr.setRequestHeader("CSRF-Token", CSRRFToken);
                                xhr.send(formData);
                                xhr.onload = () => {
                                    const code = xhr.status;
                                    // Get uuid from response
                                    if(code === 200) {
                                        const response = JSON.parse(xhr.response);
                                        const { uuid } = response.data;
                                        const imgMimeType = [
                                            "image/png",
                                            "image/jpeg",
                                            "image/gif",
                                            "image/webp",
                                        ];
                                        // Add image pointer to the document in alternative text format
                                        if(imgMimeType.includes(mimeType)) {
                                        // Insert image
                                            const img = `\n![${file.name}](/file/${uuid})`;
                                            // Place at the end of the document in code mirror
                                            cmRef.current?.replaceRange(img, { line: cmRef.current?.lastLine()! + 1, ch: 0 }, { line: cmRef.current?.lastLine()! + 1, ch: 0 })
                                            // Also scroll to the end of the document
                                            cmRef.current?.scrollIntoView({line: cmRef.current?.lastLine()! + 1, ch: 0})
                                        }
                                        // Insert a link to the file
                                        else {
                                        // Insert link
                                            const link = `\n[${file.name}](/file/${uuid})`;
                                            // Place at the end of the document in code mirror
                                            cmRef.current?.replaceRange(link, { line: cmRef.current?.lastLine()! + 1, ch: 0 }, { line: cmRef.current?.lastLine()! + 1, ch: 0 })
                                            // Also scroll to the end of the document
                                            cmRef.current?.scrollIntoView({line: cmRef.current?.lastLine()! + 1, ch: 0})

                                        }
                                    // Display if the file is too large
                                    // Should not happen if the client respects the limit
                                    } else if(code === 413) {
                                        showMessage({
                                            message: text('FILE_TOO_LARGE'),
                                            buttons: [
                                                {
                                                    name: text('BUTTON_OK'),
                                                    callback: () => {},
                                                }
                                            ],
                                        })
                                    } else {
                                        showMessage({
                                            message: text('ERROR_GENERIC'),
                                            buttons: [
                                                {
                                                    name: text('BUTTON_OK'),
                                                    callback: () => {},
                                                }
                                            ],
                                        })
                                    }


                                };
                                xhr.onerror = () => {
                                    showMessage({
                                        message: text('ERROR_GENERIC'),
                                        buttons: [
                                            {
                                                name: text('BUTTON_OK'),
                                                callback: () => {},
                                            }
                                        ],
                                    })
                                }
                                // Xhr finally
                                // So not matter what happens upload is finished
                                xhr.onloadend = () => {
                                    setUploading(false);
                                };
                            }}
                            hidden
                        />

                    </form>
                </div>
                <div className="flex gap-2 items-center shrink justify-end px-2">
                    <Share />
                    <button className="border p-2" onClick={onToggleClick}>
                        {
                            <FontAwesomeIcon
                                className={`${apply(showEditor, "visible", "invisible")} mr-2`}
                                icon={faPen}
                            />
                        }
                        {
                            <FontAwesomeIcon
                                className={`${apply(showRead, "visible", "invisible")}`}
                                icon={faEye}
                            />
                        }
                    </button>
                </div>
            </div>
        </>
    )
}