import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome() {
    const [userId, setUserId] = useState('n/a');

    window.addEventListener('message', (event) => {
        setUserId(event.data.userId);
    });

    return (
        <>
            <Head title="TheIndivisuals">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex flex-col gap-4 p-12">
                <Button onClick={() => setUserId('n/a')}>Reset</Button>
                <span>UserID: {userId}</span>
            </div>
        </>
    );
}
