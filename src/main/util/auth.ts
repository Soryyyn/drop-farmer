import { Toasts } from '@main/common/constants';
import { log } from '@main/util/logging';
import { AuthChangeEvent, createClient, Session } from '@supabase/supabase-js';
import { sendToast } from './toast';

/**
 * The current supabase session.
 */
let currentSession: Session | null;

/**
 * Create the supabase client and connect it to the backend.
 */
const supabase = createClient(
    process.env.SUPABASE_BACKEND_URL ?? '',
    process.env.SUPABASE_BACKEND_ANON_KEY ?? '',
    {
        auth: {
            autoRefreshToken: true,
            detectSessionInUrl: true,
            persistSession: true
        }
    }
);

/**
 * Check if a session is already available (user is already signed in).
 * The session is null if there is none.
 */
function getInitialSession(): void {
    supabase.auth.getSession().then(({ data: { session } }) => {
        currentSession = session;

        log(
            'info',
            `Setting the initial session, session: ${
                session === null ? 'null' : 'set'
            }`
        );
    });
}

/**
 * Get the current session.
 */
export function getCurrentSession(): Session | null {
    return currentSession;
}

/**
 * Sign in the user.
 */
export function signIn(signInObject: SignInObject): void {
    /**
     * The sign in promise to handle inside the toast.
     */
    const signInPromise = new Promise((resolve, reject) => {
        if (
            signInObject.email.trim().length === 0 ||
            signInObject.password.trim().length === 0
        ) {
            reject(new Error('Credentials are not valid'));
        }
    });

    sendToast({
        toast: {
            id: Toasts.SignIn,
            type: 'promise',
            duration: 4000,
            textOnLoading: 'Signing in...',
            textOnSuccess: 'Signed in successfully.',
            textOnError: 'Failed to sign in.'
        },
        promise: signInPromise
    });

    // if (
    //     signInObject.email.trim().length > 0 &&
    //     signInObject.password.trim().length > 0
    // ) {
    //     supabase.auth
    //         .signInWithPassword({
    //             email: signInObject.email,
    //             password: signInObject.password
    //         })
    //         .then(({ data, error }) => {
    //             console.log(data, error);
    //         });
    // } else {
    //     sendT
    // }
}

/**
 * Sign out the user.
 */
export function signOut(): void {}

/**
 * The initial auth flow.
 */
export function initAuth(): void {
    getInitialSession();
}

/**
 * Handle a change of the session
 */
function handleSessionChange(
    event: AuthChangeEvent,
    session: Session | null
): void {
    currentSession = session;

    log('info', 'Session changed');
}

/**
 * Handle supabase events.
 */
supabase.auth.onAuthStateChange(handleSessionChange);
