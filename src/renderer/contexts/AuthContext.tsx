import { Session } from 'electron';
import React, {
    createContext,
    useEffect,
    useLayoutEffect,
    useState
} from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext<{
    session: Session | null;
    signIn: (email: string, password: string) => void;
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
    const navigate = useNavigate();

    /**
     * Move the user to the sign in route if he has no session.
     */
    useEffect(() => {
        if (session === null) {
            navigate('/signIn');
        } else {
            navigate('/');
        }
    }, [session]);

    function signIn(email: string, password: string) {}

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
