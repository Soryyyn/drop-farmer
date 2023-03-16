import Icon from '@components/global/Icon';
import InlineLink from '@components/global/Inline/InlineLink';
import TextInput from '@components/global/Inputs/TextInput';
import SquareContainer from '@components/global/SquareContainer';
import { AuthContext } from '@contexts/AuthContext';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { useAppVersion } from '@hooks/useAppVersion';
import React, { useContext, useState } from 'react';

export default function SignIn() {
    const { signIn, signUp, resetPassword } = useContext(AuthContext);
    const appVersion = useAppVersion();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="bg-pepper-600 rounded-xl shadow-xl shadow-pepper-600/25 h-fit w-1/2 p-8 flex flex-col gap-4">
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

                    <p className="leading-none text-center text-snow-300/30 -mb-2">
                        {appVersion}
                    </p>

                    <div className="flex flex-row gap-2">
                        <button
                            onClick={() => signIn(email, password)}
                            className="w-full bg-pepper-700 hover:bg-pepper-900 active:brightness-90 rounded-lg text-snow-300 font-medium"
                        >
                            Sign in
                        </button>
                        <SquareContainer
                            className="bg-pepper-700 hover:bg-pepper-900 text-snow-300 p-3 rounded-lg cursor-pointer hover:bg-gradient-to-tr hover:from-blood-500 hover:to-blood-550 hover:text-pepper-200 active:brightness-90"
                            onClick={() =>
                                api.sendOneWay(api.channels.shutdown)
                            }
                        >
                            <Icon sprite={faPowerOff} size="1x" />
                        </SquareContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
