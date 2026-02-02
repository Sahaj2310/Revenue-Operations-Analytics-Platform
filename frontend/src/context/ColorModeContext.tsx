import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
    mode: ColorMode;
    toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
    mode: 'dark',
    toggleColorMode: () => {},
});

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setMode] = useState<ColorMode>('dark');

    const colorMode = useMemo(
        () => ({
            mode,
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [mode],
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            {children}
        </ColorModeContext.Provider>
    );
};

export const useColorMode = () => useContext(ColorModeContext);
