import SignIn from '@components/Auth/SignIn';
import Dashboard from '@components/Dashboard';
import { AuthContext } from '@contexts/AuthContext';
import React, { useContext } from 'react';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';

export default function Router() {
    const { session } = useContext(AuthContext);

    return (
        <MemoryRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        // <>
                        //     {session ? (
                        <Navigate to="/dashboard" />
                        //     ) : (
                        //         <Navigate to="/signIn" />
                        //     )}
                        // </>
                    }
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/signIn" element={<SignIn />} />
            </Routes>
        </MemoryRouter>
    );
}
