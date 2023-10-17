import { Centrifuge, StreamPosition, Subscription } from 'centrifuge';
import { useSub } from './useSub';
import { set as setGlobalData, get as getGlobalData } from '@/utils/globalData';
import { useEffect, useState } from 'react';

type MessageListType = { data_type: 'multimodal_text', value: { data_type: 'text' | 'image' | 'voice', value: string }[] }
    | { data_type: 'text' | 'voice', value: string }

type NewMessageType = {
    m?: MessageListType[]
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
            const { data, info, tags, offset } = ctx
            const stream_position = getGlobalData('stream_position') || { epoch: "", offset: 0 }
            setGlobalData('stream_position', Object.assign(stream_position, { offset: offset }))
            setNewMessage({ m: data, u: { id: info?.user || '', avatar: tags?.avatar || '', name: tags?.nickname || '', offset: ctx.offset || undefined } })
        })
    }, [sub, channelName])

    return {
        newMessage
    }

}

export { useMessagesData }
export type { NewMessageType, MessageListType }