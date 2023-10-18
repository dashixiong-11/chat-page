import { Centrifuge, StreamPosition, Subscription } from 'centrifuge';
import { useSub } from './useSub';
import { set as setGlobalData, get as getGlobalData } from '@/utils/globalData';
import { useEffect, useState } from 'react';

function useMessagesData({ channelName }: { channelName?: string }) {
    console.log('useMessagesData');
    
    const { sub } = useSub({ channelName })
    const [streamPosition, setStreamPosition] = useState<StreamPosition | null>(null)
    const [newMessage, setNewMessage] = useState<NewMessageType>({})

    useEffect(() => {
        if (!channelName || !sub) return
        sub && sub.on('publication', async function (ctx) {
            console.log('新消息', ctx);
            const { data, info, tags, offset } = ctx
            const stream_position = getGlobalData('stream_position') || { epoch: "", offset: 0 }
            setGlobalData('stream_position', Object.assign(stream_position, { offset: offset }))
            setNewMessage({ m: data, u: { id: info?.user || '', avatar: tags?.avatar || '', name: tags?.nickname || '', offset: ctx.offset || undefined } })
        })

        setTimeout(async() => {

            const stream_position: StreamPosition = getGlobalData('stream_position') || {
                offset: 0,
                epoch: ''
            }
            const resp = await sub?.history({
                since: stream_position,
                limit: 50, reverse: true
            });
            console.log(resp);
        }, 3000)
    }, [sub, channelName])


    return {
        newMessage
    }

}

export { useMessagesData }