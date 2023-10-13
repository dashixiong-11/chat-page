import { Centrifuge, StreamPosition, Subscription } from 'centrifuge';
import { useSub } from './useSub';
import { useEffect, useState } from 'react';

type NewMessageType = {
    m?: { value: string, data_type: string }[]
    u?: {
        avatar: string, id: string, name: string, offset: number | undefined
    }
}
function useMessagesData({ channelName }: { channelName?: string }) {
    const { sub } = useSub({ channelName })
    const [streamPosition, setStreamPosition] = useState<StreamPosition | null>(null)
    const [newMessage, setNewMessage] = useState<NewMessageType>({})

    useEffect(() => {
        if (!channelName || !sub) return
        sub && sub.on('publication', async function (ctx) {
            console.log('新消息', ctx);
            const { data, info, tags } = ctx
            setNewMessage({ m: data, u: { id: info?.user || '', avatar: tags?.avatar || '', name: tags?.nickname || '', offset: ctx.offset || undefined } })
        })
    }, [sub, channelName])

    return {
        newMessage
    }

}

export { useMessagesData }
export type { NewMessageType }