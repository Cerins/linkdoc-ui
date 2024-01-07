import { FormEvent, useEffect, useRef, useState } from "react";
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
import TermsList, { TermsListHandles } from "../../components/Accept";

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
    // const [remember, setRemember] = useState(true);
    const remember = true;
    const currentLocation = (useLocation() as { state?: {from?: To}});
    const { connect, status } = useSocket();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const termList = useRef<TermsListHandles>(null);
    useEffect(() => {
        if (disabled && status === SocketStatus.ERROR) {
            setError("ERROR_GENERIC");
            setDisabled(false);
        }
    }, [disabled, status]);
    useEffect(() => {
        if (status === SocketStatus.CONNECTED) {
            const defaultRoute = currentLocation.state?.from ?? "/collections";
            navigate(defaultRoute, { replace: true });
        }
    }, [status, navigate, currentLocation]);

    function onToken(token: string, name: string) {
        dispatch(setUsername(name));

        connect(`${config.socketURL}?token=${token}`);
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        const accepted = termList.current?.accepted() ?? false;
        if (!accepted) {
            setError("LOGIN_NOT_ACCEPTED");
            return;
        }
        setDisabled(true);
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
        if(tryCookie && status === SocketStatus.DISCONNECTED) {
            (async ()=>{
                try{
                    const { name, token } = await loginThroughSession()
                    onToken(token, name)
                } catch(err) {
                    setTryCookie(false);
                }
            })()
        }
    }, [tryCookie, status])
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
                <TermsList 
                    ref={termList}
                />
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
