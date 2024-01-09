import React, { ReactNode, useRef, useState } from "react";
import useTextService, { Locale } from "../../contexts/Text";
import Logo from "../Logo";
import useSocket, { SocketStatus } from "../../contexts/Socket";
import { Link } from "react-router-dom";

function FlagSelect({
    currentLocale,
    onSelect,
}: {
  currentLocale: Locale;
  onSelect: (locale: Locale) => void;
}) {
    // Language dropdown
    const [showDropdown, setShowDropdown] = useState(false);
    const flagRef = useRef<HTMLImageElement>(null);

    return (
        <div className="relative">
            <img
                ref={flagRef}
                className="h-6 hover:opacity-75 cursor-pointer"
                src={`/flags/${currentLocale}.svg`}
                onClick={() => setShowDropdown(!showDropdown)}
            />
            {/* If dropdown the show an absolute div with other language options */}
            {showDropdown && (
                <div
                    className="absolute right-0 shadow-lg bg-white"
                    style={{ width: flagRef.current?.offsetWidth }}
                >
                    <div className="py-1">
                        {(["lv", "en"] as const).map((locale) => (
                            <button
                                key={locale}
                                className="block w-full text-center text-gray-700 hover:bg-gray-100 mt-2"
                                onClick={() => {
                                    onSelect(locale);
                                    setShowDropdown(false);
                                }}
                            >
                                {/* Flags are stored in public folder */}
                                <img
                                    className="h-5 inline mx-auto"
                                    src={`/flags/${locale}.svg`}
                                    alt={locale}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface HeaderTemplateProps {
  leftItems?: ReactNode;
  rightItems?: ReactNode;
}

/**
 * Component which allows to visit login/logout page depending on the socket status
 * 
 */
function SessionToggle() {
    const { text } = useTextService();
    const { status } = useSocket();
    if(status === SocketStatus.CONNECTING) {
        return <></>
    }
    if(status === SocketStatus.CONNECTED) {
        return <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline" to={'/logout'}>{text('LOGOUT')}</Link>
    }
    return <Link className="font-medium text-blue-600 dark:text-blue-500 hover:underline" to={'/login'}>{text('LOGIN')}</Link>
}

export const Header: React.FC<HeaderTemplateProps> = ({
    leftItems,
    rightItems,
}) => {
    const { locale, setLocale } = useTextService();

    return (
        <div className="flex h-12 justify-between items-center p-2 border-b-4">
            <div className="flex justify-start items-center space-x-3">
                <Logo className="h-9" />
                {leftItems}
            </div>

            <div className="flex justify-end items-center space-x-3">
                {/* Change locale if the flag in the dropdown was clicked */}
                <FlagSelect currentLocale={locale} onSelect={setLocale} />
                {rightItems}
                <SessionToggle />
            </div>
        </div>
    );
};

interface LayoutProps {
  header?: ReactNode;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ header, children }) => {
    return (
        <div className="flex flex-col h-screen">
            {header}
            <div className="grow">{children}</div>
        </div>
    );
};
