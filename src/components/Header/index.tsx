import React, { ReactNode, useRef, useState } from "react";
import useTextService, { Locale } from "../../contexts/Text";
import Logo from "../Logo";

function FlagSelect({
    currentLocale,
    onSelect,
}: {
  currentLocale: Locale;
  onSelect: (locale: Locale) => void;
}) {
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
                <FlagSelect currentLocale={locale} onSelect={setLocale} />
                {rightItems}
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
