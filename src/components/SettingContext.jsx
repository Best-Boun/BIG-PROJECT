import { createContext, useEffect, useState } from "react";

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        darkMode: false,
        fontSize: "medium",
        language: "th",
        themeColor: "#c084fc", // purple default
        notifications: true,
        layout: "wide",
        defaultPage: "public",
    });

    // โหลดจาก localStorage
    useEffect(() => {
        const saved = localStorage.getItem("settings");
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    // อัปเดต DOM ทุกครั้งที่ settings เปลี่ยน
    useEffect(() => {

        document.body.classList.toggle("dark-mode", settings.darkMode);

        document.body.style.setProperty("--font-size",
            settings.fontSize === "small" ? "14px" :
                settings.fontSize === "large" ? "18px" :
                    "16px"
        );


        document.body.style.setProperty("--theme-color", settings.themeColor);

        const sizeMap = {
            small: "14px",
            medium: "16px",
            large: "18px",
        };
        document.documentElement.style.setProperty("--font-size", sizeMap[settings.fontSize]);


        document.documentElement.style.setProperty("--theme-color", settings.themeColor);


        document.body.classList.toggle("layout-compact", settings.layout === "compact");
    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}