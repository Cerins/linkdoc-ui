import { FormEvent, useState } from "react";
import useTextContext from "../../contexts/Text";
import { apply } from "../../utils/css";
import { getLoginToken } from "../../services/login";

function TextInput(
    {
        label,
        type,
        value,
        setValue,
        error,
        disabled
    }: {
        label: string;
        value: string;
        type: 'text' | 'password'
        setValue: (name: string) => void;
        error?: string;
        disabled?: boolean;
    }
) {
    return (
        <div>
              <label htmlFor={label}>{label}</label>
              <input 
                  className={`border p-2 w-full my-2 ${apply(disabled, 'bg-neutral-200')} ${apply(error, 'border-rose-500')}`}
                  autoFocus
                  type={type}
                  name={label}
                  value={value}
                  onChange={(e)=>setValue(e.currentTarget.value)}
                  disabled={disabled}
              />
            {/* <p
                className={`${apply(error, 'visible', 'invisible')} text-rose-500`}
            >
                {error}
            </p> */}
        </div>
    );
}

function LoginForm(
) {
    const { text } = useTextContext();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [disabled, setDisabled] = useState(false);
    async function onSubmit(e: FormEvent) {
        setDisabled(true);
        e.preventDefault();
        console.log(name, password);
        try{
            setError('');
            const token = await getLoginToken(name, password);
            console.log(token);
        }catch(err){
            let error = text('ERROR_GENERIC');
            if(err instanceof Error){
                if(err.message === 'AUTH_FAILED') {
                    error = text('LOGIN_ERROR_BAD_CREDS');
                }
            }
            setError(error);
        } finally {
            setDisabled(false);
        }
    }
    return (
        <form onSubmit={onSubmit} className="w-96 border-2 px-8 py-8 rounded grid grid-rows-1 gap-y-4 bg-neutral-50 shadow-lg">
            <TextInput 
                label={text("LOGIN_USERNAME")}
                type={'text'}
                value={name}
                setValue={setName}
                error={error}
                disabled={disabled}
            />
            <TextInput 
                label={text('LOGIN_PASSWORD')}
                type="password"
                value={password}
                setValue={setPassword}
                error={error}
                disabled={disabled}
            />
            <p className={`bg-rose-400 text-white rounded-2xl p-2 ${apply(error, 'visible', 'invisible')}`}>
                {error ?? " "}
            </p>
            <button disabled={disabled} type="submit" className="px-4 py-4 font-semibold text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-md shadow-sm opacity-100 w-8/12 mx-auto disabled:bg-sky-200">
                {text('LOGIN_ACTION')}
            </button>
        </form>
    );
}

export default function Login() {
    return (
        <div className="flex h-full items-center justify-center">
            <LoginForm />
        </div>
    );
}
