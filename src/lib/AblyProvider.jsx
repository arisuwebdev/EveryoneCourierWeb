import Ably from 'ably';
import { createContext, useContext, useEffect, useRef } from 'react';
import api from '../api/ApiServices/chat/ablyAuthService';  

const AblyContext = createContext(null);

export function AblyProvider({ children }) {
    const clientRef = useRef(null);

    useEffect(() => {
        // Use token auth — never hard-code the secret key in React
        const client = new Ably.Realtime({
            authCallback: async (_, callback) => {
                try {
                    // GET /api/ablyAuth?job_id=... called later per channel
                    // For initial connection we only need a general token
                    const res = await api.get('/ablyAuth', { params: { job_id: 1 } });
                    callback(null, res.data.payload.tokenRequest);
                } catch (err) {
                    callback(err, null);
                }
            },
        });
        clientRef.current = client;
        return () => client.close();
    }, []);

    return <AblyContext.Provider value={clientRef}>{children}</AblyContext.Provider>;
}
