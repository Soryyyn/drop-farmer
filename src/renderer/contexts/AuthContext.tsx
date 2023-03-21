import { Session } from 'electron';
import React, { createContext, useState } from 'react';

export const AuthContext = createContext<{
    session: Session | null;
    signIn: (singInObject: SignInObject) => void;
    signUp: () => void;
    signOut: () => void;
    resetPassword: () => void;
}>({
    session: null,
    signIn: () => {},
    signUp: () => {},
    signOut: () => {},
    resetPassword: () => {}
});

export function AuthContextProvider({ children }: DefaultContextProps) {
    const [session, setSession] = useState<Session | null>(null);

    function signIn(signInObject: SignInObject) {
        api.sendOneWay(api.channels.signIn, signInObject);
    }

    /**
     * Move the user to the sign up page in the browser.
     */
    function signUp() {
        api.sendOneWay(
            api.channels.openLinkInExternal,
            'https://drop-farmer.soryn.dev/sign-up'
        );
    }

    function signOut() {}

    function resetPassword() {}

    return (
        <AuthContext.Provider
            value={{ session, signIn, signUp, signOut, resetPassword }}
        >
            {children}
        </AuthContext.Provider>
    );
}
