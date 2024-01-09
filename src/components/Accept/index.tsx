import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import terms from "./terms";
import useTextContext from "../../contexts/Text";
import useModalContext from "../../contexts/Modal";

export interface TermsListHandles {
  accepted: () => boolean;
}

const TermsList = forwardRef<TermsListHandles, unknown>((_, ref) => {
    // By default no terms are accepted
    const [acceptedTerms, setAcceptedTerms] = useState<boolean[]>(
        terms.map(() => false)
    );

    const handleCheckboxChange = (index: number, isChecked: boolean) => {
        // The the state to the fact that the checkbox was checked
        setAcceptedTerms((prev) => {
            const updated = [...prev];
            updated[index] = isChecked;
            return updated;
        });
    };

    useImperativeHandle(ref, () => ({
        // Allow parent to check if all terms were accepted
        accepted: () => {
            return Object.values(acceptedTerms).every(value => value);
        },
    }));
    const { locale, text } = useTextContext();
    const { showMessage } = useModalContext();
    useEffect(()=>{

    }, [locale])
    return (
        <div>
            {terms.map((termLangs, index) => {
                const {short, long } = termLangs[locale];
                return (
                    <div key={index}>
                        <input
                            type="checkbox"
                            checked={!!acceptedTerms[index]}
                            onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                        />
                        {/* Label should look like a link */}
                        <label
                            className="mx-2 text-blue-500 cursor-pointer hover:text-blue-700"
                            onClick={() => showMessage({
                                message: long,
                                buttons: [
                                    {
                                        name: text('BUTTON_OK'),
                                        callback: () => {},
                                    }
                                ],
                            })}
                        >{short}</label>
                    </div>
                )})}
        </div>
    );
});

export default TermsList;