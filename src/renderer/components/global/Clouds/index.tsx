import Cloud1 from '@assets/clouds/cloud_1.svg';
import Cloud2 from '@assets/clouds/cloud_2.svg';
import Cloud3 from '@assets/clouds/cloud_3.svg';
import React from 'react';

export default function Clouds() {
    return (
        <div className="overflow-hidden absolute top-0 left-0 h-screen w-screen opacity-50">
            <Cloud1 className="absolute top-1/3 left-4" />
            <Cloud2 className="absolute top-14 -right-[5%]" />
            <Cloud3 className="absolute top-[50%] right-[17%]" />
            <Cloud2 className="absolute top-[80%] left-[20%] -scale-x-100" />
            <Cloud1 className="absolute top-[90%] right-[10%] -scale-x-100" />
            <Cloud3 className="absolute -top-[5%] left-[17%] -scale-x-100" />
            <Cloud1 className="absolute top-[60%] -left-[10%]" />
            <Cloud1 className="absolute top-[75%] -right-[10%]" />
        </div>
    );
}
