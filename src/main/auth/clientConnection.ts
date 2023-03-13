import { log } from '@main/util/logging';
import { AuthChangeEvent, createClient, Session } from '@supabase/supabase-js';

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
export function signIn(email: string, password: string): void {}

/**
 * Sign up the user.
 */
export function signUp(email: string, password: string): void {}

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
