import { Session } from 'electron';
import React, { createContext, useState } from 'react';

export const AuthContext = createContext<{
    session: Session | null;
    signIn: (email: string, password: string) => void;
    signUp: (email: string, password: string) => void;
    signOut: () => void;
}>({
    session: null,
    signIn: () => {},
    signUp: () => {},
    signOut: () => {}
});

export function AuthContextProvider({ children }: DefaultContextProps) {
    const [session, setSession] = useState<Session | null>(null);

    function signIn(email: string, password: string) {}

    function signUp(email: string, password: string) {}

    function signOut() {}

    return (
        <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
