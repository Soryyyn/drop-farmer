import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import Icon from '@renderer/components/global/Icon';
import InlineLink from '@renderer/components/global/Inline/InlineLink';
import TextInput from '@renderer/components/global/Inputs/TextInput';
import SquareContainer from '@renderer/components/global/SquareContainer';
import { AuthContext } from '@renderer/contexts/AuthContext';
import { useKeyPress } from '@renderer/hooks/useKeyPress';
import clsx from 'clsx';
import React, { useContext, useEffect, useState } from 'react';

export default function SignIn() {
    const { signIn, signUp, resetPassword } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const enter = useKeyPress('Enter');

    useEffect(() => {
        if (enter) signIn({ email, password });
    }, [enter, email, password, signIn]);

    return (
        <>
            <div className="h-full w-full flex items-center justify-center">
                <div className="bg-pepper-600 rounded-xl shadow-xl shadow-pepper-600/25 backdrop-blur-2xl h-fit w-1/2 p-8 flex flex-col gap-4">
                    <p className="text-snow-300 text-center font-semibold text-3xl leading-none">
                        Authentication
                    </p>

                    <TextInput
                        label="E-Mail"
                        value={email}
                        onChange={(changed) => {
                            setEmail(changed);
                        }}
                    />
                    <TextInput
                        label="Password"
                        isPassword
                        value={password}
                        onChange={(changed) => {
                            setPassword(changed);
                        }}
                    />

                    <div className="flex flex-col gap-4 mt-8">
                        <p className="leading-none -mb-4 text-center text-snow-300">
                            Click
                            <InlineLink
                                content="here"
                                className="text-amethyst-550 font-medium mx-1 p-1 rounded-md hover:bg-pepper-700 active:brightness-90"
                                onClick={resetPassword}
                            />
                            to reset your password
                        </p>
                        <p className="leading-none text-center text-snow-300">
                            Don&apos;t have an account?
                            <InlineLink
                                content="Sign up here."
                                className="text-amethyst-550 font-medium mx-1 p-1 rounded-md hover:bg-pepper-700 active:brightness-90"
                                onClick={signUp}
                            />
                        </p>

                        <div className="flex flex-row gap-2">
                            <button
                                onClick={() => signIn({ email, password })}
                                className={clsx(
                                    'w-full bg-pepper-700 hover:bg-pepper-900 active:brightness-90 rounded-lg text-snow-300 font-medium',
                                    {
                                        'brightness-90': enter
                                    }
                                )}
                            >
                                Sign in
                            </button>
                            <SquareContainer
                                className="bg-pepper-700 hover:bg-pepper-900 text-snow-300 p-3 rounded-lg cursor-pointer hover:bg-gradient-to-tr hover:from-blood-500 hover:to-blood-550 hover:text-pepper-200 active:brightness-90"
                                onClick={() =>
                                    window.api.sendOneWay(
                                        window.api.channels.shutdown
                                    )
                                }
                            >
                                <Icon sprite={faPowerOff} size="1x" />
                            </SquareContainer>
                        </div>
                    </div>
                </div>
            </div>

            <p className="bg-pepper-600/70 text-snow-300 shadow-xl shadow-pepper-600/25 backdrop-blur-2xl px-6 py-1.5 rounded-lg text-center absolute bottom-8 left-1/2 -translate-x-1/2 w-fit">
                {window.api.currentVersion}
            </p>
        </>
    );
}
