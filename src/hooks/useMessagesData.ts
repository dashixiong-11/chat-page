import { Centrifuge, StreamPosition, Subscription } from 'centrifuge';
import { useSub } from './useSub';
import { useEffect, useState } from 'react';

export function useMessagesData({ channelName }: { channelName?: string }) {
    const {sub} = useSub({channelName})
    const [streamPosition,setStreamPosition] = useState<StreamPosition|null>(null)
    const [newMessage,setNewMessage] = useState('')

    useEffect(() => {
        if(!channelName) return
        sub && sub.on('publication', async function (ctx) {
            console.log('新消息', ctx);
            //streamPosition.current = { offset: ctx.offset, epoch: streamPosition.current.epoch }
        })
    }, [])
    
    return {
        newMessage
    }

}