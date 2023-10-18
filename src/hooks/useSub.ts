import { Centrifuge, StreamPosition, Subscription } from 'centrifuge';
import { useEffect, useState, useRef } from "react";
import { get as getGlobalData, set as setGlobalData } from "@/utils/globalData";


export function useSub({ channelName }: { channelName?: string }) {
    const [sub, setSub] = useState<Subscription | null>(null)
    const [streamPosition, setStreamPosition] = useState<StreamPosition | null>(null)
    const subCount = useRef(0)
    const [client] = useState<Centrifuge | undefined>(() => {
        return getGlobalData('client')
    })

    useEffect(() => {
        if (!channelName || !client) {
            // console.log('toast: 无效的频道名');
            return
        }
        const s = client.newSubscription(channelName);
        s.on('subscribed', async function (ctx) {
            console.log('订阅成功', ctx.streamPosition);
            ctx.streamPosition && setStreamPosition(ctx.streamPosition)
            setGlobalData('stream_position', ctx.streamPosition)
        }).on('error', function (err) {
            subCount.current++
            if (subCount.current > 3) {
                console.log('达到最大重连尝试次数，无法订阅');
                s.unsubscribe();
                client.removeSubscription(s)
            }
            console.log('订阅失败', err);
        })
        setGlobalData('sub', s)
        setSub(s)
        s.subscribe();

        return () => {
            console.log('unsub');
            s.unsubscribe();
            client.removeSubscription(s)
        }
    }, [client, channelName])

    return { streamPosition, sub }
}
