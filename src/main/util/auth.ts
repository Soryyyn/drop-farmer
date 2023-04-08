import { SignInObject } from '@df-types/auth.types';
import { Toasts } from '@main/common/constants';
import { log } from '@main/util/logging';
import {
    AuthChangeEvent,
    createClient,
    Session,
    User
} from '@supabase/supabase-js';
import { randomBytes, scryptSync } from 'crypto';
import { sendToast } from './toast';

/**
 * The current supabase session.
 */
let currentSession: Session | null;

/**
 * The currently logged in user.
 */
let currentUser: User | null;

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
 * Encrypt the given password.
 */
function encryptPassword(text: string): string {
    const salt = randomBytes(16).toString('hex');
    return scryptSync(text, salt, 32).toString('hex') + salt;
}

/**
 * Get the current session.
 */
export function getCurrentSession(): Session | null {
    return currentSession;
}

/**
 * Get the current user.
 */
export function getCurrentUser(): User | null {
    return currentUser;
}

/**
 * Sign in the user.
 */
export function signIn(signInObject: SignInObject): void {
    /**
     * The sign in promise to handle inside the toast.
     */
    const signInPromise = new Promise(async (resolve, reject) => {
        log('info', 'Trying to sign in user');

        /**
         * Hash the password.
         */
        signInObject.password = encryptPassword(signInObject.password);

        if (
            signInObject.email.trim().length === 0 ||
            signInObject.password.trim().length === 0
        ) {
            log('warn', 'Email or/and password may be empty and not valid');
            reject(new Error('Email or password are not valid'));
        }

        /**
         * Try to sign in.
         */
        const { data, error } = await supabase.auth.signInWithPassword({
            email: signInObject.email,
            password: signInObject.password
        });

        /**
         * When no error is returned set the session and user.
         */
        if (!error) {
            currentSession = data.session;
            currentUser = data.user;

            log('info', 'Succeeded with sign in, session and user are set');
            resolve(undefined);
        } else {
            log('warn', `Failed signing in user, reason: ${error.message}`);
            reject(error.message);
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
}

/**
 * Sign out the user.
 */
export function signOut(): void {
    const signOutPromise = new Promise(async (resolve, reject) => {
        log('info', 'Trying to sign out user');

        const { error } = await supabase.auth.signOut();

        if (!error) {
            currentSession = null;
            currentUser = null;

            log('info', 'Succeeded with sign out');
            resolve(undefined);
        } else {
            log('warn', `Failed signing out user, reason: ${error.message}`);
            reject(error.message);
        }
    });

    sendToast({
        toast: {
            id: Toasts.SignOut,
            type: 'promise',
            duration: 4000,
            textOnLoading: 'Signing out...',
            textOnSuccess: 'Signed out successfully.',
            textOnError: 'Failed to sign out.'
        },
        promise: signOutPromise
    });
}

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
    log('info', `Session changed, event: ${event}`);
}

/**
 * Handle supabase events.
 */
supabase.auth.onAuthStateChange(handleSessionChange);
