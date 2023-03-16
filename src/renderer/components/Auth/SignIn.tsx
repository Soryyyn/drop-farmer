import Icon from '@components/global/Icon';
import TextInput from '@components/global/Inputs/TextInput';
import SquareContainer from '@components/global/SquareContainer';
import { AuthContext } from '@contexts/AuthContext';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import React, { useContext } from 'react';

export default function SignIn() {
    const { signIn, signOut, signUp } = useContext(AuthContext);

    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="bg-pepper-600 rounded-xl shadow-xl shadow-pepper-600/25 h-fit w-1/2 p-8 flex flex-col gap-4">
                <p className="text-snow-300 text-center font-semibold text-3xl leading-none">
                    Authentication
                </p>

                <TextInput label="E-Mail" value={''} onChange={() => {}} />
                <TextInput
                    label="Password"
                    isPassword
                    value={''}
                    onChange={() => {}}
                />

                <div className="flex flex-col gap-4 mt-10">
                    <span className="text-center text-snow-300">
                        Don&apos;t have an account?{' '}
                        <button
                            className="bg-pepper-700 hover:bg-pepper-900 active:bg-pepper-800 text-snow-300 px-1.5 py-0.5 rounded-md font-medium"
                            onClick={() =>
                                api.sendOneWay(
                                    api.channels.openLinkInExternal,
                                    'https://drop-farmer.soryn.dev/sign-up'
                                )
                            }
                        >
                            Sign up
                        </button>{' '}
                        here.
                    </span>
                    <div className="flex flex-row gap-2">
                        <button className="w-full bg-pepper-700 hover:bg-pepper-900 active:bg-pepper-800 rounded-lg text-snow-300 font-medium">
                            Sign in
                        </button>
                        <SquareContainer
                            className="bg-pepper-700 hover:bg-pepper-900 active:bg-pepper-800 text-snow-300 p-3 rounded-lg cursor-pointer"
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
