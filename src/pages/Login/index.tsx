import { FormEvent, useEffect, useState } from "react";
import useTextService, { TextCode } from "../../contexts/Text";
import { apply } from "../../utils/css";
import { getLoginToken, loginThroughSession } from "../../services/login";
import useSocket, { SocketStatus } from "../../contexts/Socket";
import config from "../../services/config";
import { To, useLocation, useNavigate } from "react-router-dom";
import { Header, Layout } from "../../components/Header";
import { useDispatch } from "react-redux";
import { setUsername } from "../../reducers/login";
import Spinner from "../../components/Spinner";

function TextInput({
    label,
    type,
    value,
    setValue,
    error,
    disabled,
}: {
  label: string;
  value: string;
  type: "text" | "password";
  setValue: (name: string) => void;
  error?: string;
  disabled?: boolean;
}) {
    return (
        <div>
            <label htmlFor={label}>{label}</label>
            <input
                className={`border p-2 w-full my-2 ${apply(
                    disabled,
                    "bg-neutral-200"
                )} ${apply(error, "border-rose-500")}`}
                autoFocus
                type={type}
                name={label}
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
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

function LoginForm() {
    const { text } = useTextService();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<TextCode | null>(null);
    const [disabled, setDisabled] = useState(false);
    const [tryCookie, setTryCookie] = useState(true);
    const [remember, setRemember] = useState(true);
    const currentLocation = (useLocation() as { state?: {from?: To}});
    const { connect, status } = useSocket();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(() => {
        if (disabled && status === SocketStatus.ERROR) {
            setError("ERROR_GENERIC");
            setDisabled(false);
        }
    }, [disabled, status]);
    console.log(currentLocation)
    useEffect(() => {
        const defaultRoute = currentLocation.state?.from ?? "/collections"
        if (status === SocketStatus.CONNECTED) {
            navigate(defaultRoute);
        }
    }, [status, navigate, currentLocation]);

    function onToken(token: string, name: string) {
        dispatch(setUsername(name));
        connect(`${config.socketURL}?token=${token}`);
    }

    async function onSubmit(e: FormEvent) {
        setDisabled(true);
        e.preventDefault();
        try {
            setError(null);
            const token = await getLoginToken(name, password, remember);
            onToken(token, name);
        } catch (err) {
            let error: TextCode = "ERROR_GENERIC";
            if (err instanceof Error) {
                if (err.message === "AUTH_FAILED") {
                    error = "LOGIN_ERR_BAD_CREDS";
                }
            }
            console.error(err);
            setError(error);
            setDisabled(false);
        } finally {
            // setDisabled(false);
        }
    }
    useEffect(()=>{
        if(tryCookie) {
            (async ()=>{
                try{
                    const { name, token } = await loginThroughSession()
                    onToken(token, name)
                } catch(err) {
                    setTryCookie(false);
                }
            })()
        }
    }, [tryCookie])
    if(tryCookie) {
        return (
            <Spinner />
        )
    }
    return (
        <form
            onSubmit={onSubmit}
            className="w-96 border-2 px-8 py-8 rounded grid grid-rows-1 gap-y-4 bg-neutral-50 shadow-lg"
        >
            <TextInput
                label={text("LOGIN_USERNAME")}
                type={"text"}
                value={name}
                setValue={setName}
                error={error || ""}
                disabled={disabled}
            />
            <TextInput
                label={text("LOGIN_PASSWORD")}
                type="password"
                value={password}
                setValue={setPassword}
                error={error || ""}
                disabled={disabled}
            />
            <div className="flex justify-center items-center">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={remember}
                        onChange={(e)=>setRemember(e.target.checked)}
                    />
                    <span className="ml-2 text-gray-600">{text("REMEMBER_ME")}</span>
                </label>
            </div>

            <p
                className={`bg-rose-400 text-white rounded-2xl p-2 ${apply(
                    error,
                    "visible",
                    "invisible"
                )}`}
            >
                {error ? text(error) : " "}
            </p>

            <button
                disabled={disabled}
                type="submit"
                className="px-4 py-4 font-semibold text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-md shadow-sm opacity-100 w-8/12 mx-auto disabled:bg-sky-200"
            >
                {text("LOGIN_ACTION")}
            </button>
        </form>
    );
}

export default function Login() {
    return (
        <Layout header={<Header />}>
            <div className="flex h-full items-center justify-center">
                <LoginForm />
            </div>
        </Layout>
    );
}
