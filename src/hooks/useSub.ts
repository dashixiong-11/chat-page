import { Centrifuge, Subscription } from 'centrifuge';
import { useState, useRef, useEffect } from "react";
import { useStore } from './useStore';
import { get as getGlobalData } from "@/utils/globalData";


export function useSub() {
    const subRef = useRef<Subscription | undefined>(undefined)
    const setNewMessage = useStore((state) => state.setNewMessage)
    const setSub = useStore((state) => state.setSub)
    const setStreamPosition = useStore((state) => state.setStreamPosition)
    const subCount = useRef(0)
    const id = useRef(0)
    const [client] = useState<Centrifuge | undefined>(() => {
        return getGlobalData('client')
    })

    const newSub = (channelName: string, cb: () => void) => {
        if (!channelName || !client) return
        subRef.current = undefined
        const subscriptions = client.getSubscription(channelName)
        if (subscriptions && subscriptions?.state !== "unsubscribed") {
            return
        }
        const s = client.newSubscription(channelName);
        subRef.current = s;
        setSub(s)
        s.on('subscribed', async function (ctx) {
            console.log('订阅成功', ctx.streamPosition);
            ctx.streamPosition && setStreamPosition(ctx.streamPosition)
            id.current = setTimeout(() => {
                cb()
                clearTimeout(id.current)
            }, 500)
        }).on('publication', async function (ctx) {
            console.log('新消息', ctx);
            const { data, info, tags  } = ctx
            setNewMessage({ m: data, u: { id: info?.user || '', avatar: tags?.avatar || '', name: tags?.nickname || '', offset: ctx.offset || undefined } })
        }).on('error', function (err) {
            subCount.current++
            if (subCount.current > 3) {
                console.log('达到最大重连尝试次数，无法订阅');
                s.unsubscribe();
                client.removeSubscription(s)
            }
            console.log('订阅失败', err);
        })

        s.subscribe();
    }
    useEffect(() => {
        return () => {
            clearTimeout(id.current)
        }
    }, [])
    const unSub = () => {
        subRef.current?.unsubscribe();
        subRef.current && client?.removeSubscription(subRef.current)
        client?.removeAllListeners()
    }

    return { newSub, unSub }
}
