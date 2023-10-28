import { StreamPosition, Subscription, Centrifuge } from 'centrifuge';
import { showNotification } from '@/utils/loading';
import { post } from '@/utils/server';
import { create } from "zustand";

type SubsetKeys<T> = { [K in keyof T]?: T[K] };
type StoreType = {
    ws: Centrifuge | null,
    sub: Subscription | null,
    newMessage: NewMessageType,
    currentSubName: string,
    history: Array<NewMessageType>,
    messageList: { list: Array<NewMessageType>, changeType: 'new' | 'history' },
    streamPosition: StreamPosition,
    initializeWs: (token: string, cb: () => void) => void,
    initializeSub: (channelName: string, cb?: () => void) => void,
    setHistory: (message: NewMessageType) => void,
    getHistory: (cb?: () => void) => void,
    setSub: (s: Subscription | null) => void,
    setNewMessage: (message: NewMessageType) => void,
    modifyList: (message: NewMessageType | NewMessageType[]) => void,
    setStreamPosition: (position: SubsetKeys<StreamPosition>) => void,
    removeSub: () => void,
}

const useStore = create<StoreType>((set, get) => {
    const wsIp = import.meta.env.VITE_WS_IP_VALUE
    console.log('wsip', wsIp);


    // const maxReconnectAttempts = 3; // 最大重连尝试次数
    // const reconnectInterval = 3000; // 重连间隔（毫秒）

    return {
        ws: null,
        sub: null,
        currentSubName: '',
        messageList: { list: [], changeType: 'new' },
        history: [],
        newMessage: {},
        streamPosition: { epoch: "", offset: 0 },
        setSub: (s) => { set(state => ({ ...state, sub: s })) },
        setHistory: (message) => { set((state) => ({ ...state, history: [message, ...state.history] })) },
        getHistory: async (cb) => {
            const sub = get().sub;
            const sp = get().streamPosition;
            if (sp.offset === 1) {
                cb && cb()
                return
            }
            const resp = await sub?.history({
                since: sp,
                limit: 50, reverse: true
            });
            cb && cb()
            if (!resp) return
            const publications: any = resp.publications;
            const resArray = (publications as PublicationsType[]).map(item => ({ m: item.data, u: { id: item.info?.user, avatar: item.tags?.avatar, offset: item.offset, name: item.tags?.nickname, seed: item.tags?.seed } }))
            get().modifyList(resArray)
        },
        initializeWs: (token: string, cb) => {
            const ws = get().ws || new Centrifuge(`${wsIp}/im/connection/websocket`, {
                getToken: () => new Promise(() => {
                    wx.miniProgram.reLaunch({
                        url: '/pages/login/login'
                    })
                })
            })
            ws.on('connecting', function (ctx) {
                console.log('连接中', ctx);
                showNotification({
                    message: '连接中...'
                })
            }).on('connected', function (ctx) {
                console.log('连接成功', ctx);
                console.log('ws.subscriptions()', ws.subscriptions());
                showNotification({
                    message: '连接成功',
                    type: 'success',
                    duration: 1500
                })

                const id = setTimeout(() => {
                    cb()
                    clearTimeout(id)
                }, 500)
                //     reconnectAttempts.current = 0
            }).on('error', function (ctx) {
                console.log('连接失败', ctx);
                showNotification({
                    message: '连接失败',
                    type: 'error',
                    duration: 1500,
                    success: () => {
                        const { error } = ctx
                        if (error.code === 109 || error.code === 12) {
                            ws.disconnect()
                            ws.removeAllListeners()
                        } else {
                            //               tReconnect()
                        }
                    }
                })
            }).on('disconnected', function (ctx) {
                console.log('关闭连接', ctx);
                showNotification({
                    message: '连接被关闭',
                    type: 'error',
                })
            })
            set({ ws: ws })
            ws.setToken(token)
            ws.connect()
        },
        initializeSub: (channelName, cb?) => {
            const ws = get().ws
            if (get().sub) {
                get().removeSub()
            }
            if (!ws) return
            const subscriptions = ws.getSubscription(channelName)
            if (subscriptions && subscriptions?.state !== "unsubscribed") {
                return
            }
            const s = ws.newSubscription(channelName);
            set({ sub: s })
            s.on('subscribed', async function (ctx) {
                console.log('订阅成功', ctx.streamPosition);
                ctx.streamPosition && get().setStreamPosition(ctx.streamPosition)
                post('/im/api/clear-context', { offset: ctx.streamPosition ? ctx.streamPosition.offset : 0, channel: channelName })
                const id = setTimeout(() => {
                    cb && cb()
                    clearTimeout(id)
                }, 500)
            }).on('publication', async function (ctx) {
                console.log('新消息', ctx);
                const { data, info, tags } = ctx
                const msg = { m: data, u: { id: info?.user || '', avatar: tags?.avatar || '', name: tags?.nickname || '', offset: ctx.offset || undefined } }
                get().setNewMessage(msg)
                get().modifyList(msg)
            }).on('error', () => {

            })
            s.subscribe();
        },
        removeSub: () => {
            console.log('取消订阅');

            get().sub?.unsubscribe();
            get().ws?.removeSubscription(get().sub)
        },
        modifyList: (data: Array<NewMessageType> | NewMessageType) => {
            const ml = get().messageList;
            const sp = get().streamPosition;
            if (!data) return

            if (Object.prototype.toString.call(data) === '[object Array]') {
                const data0 = (data as NewMessageType[])[0]
                set({ streamPosition: { ...sp, offset: data0?.u?.offset || 0 } })
                set({ messageList: { list: [...(data as NewMessageType[]), ...ml.list], changeType: 'history' } })
            } else if (Object.prototype.toString.call(data) === '[object Object]') {
                const cp: NewMessageType[] = [...ml.list]
                if (cp.length === 0) return
                const index = cp.findIndex(item => item && item.u?.offset === (data as NewMessageType).u?.offset);
                if (index !== -1) {
                    (cp as NewMessageType[])[index] = data as NewMessageType;
                } else {
                    cp.push((data as NewMessageType));
                }
                set({ messageList: { list: cp, changeType: 'new' } })
            }
        },
        setNewMessage: (message: NewMessageType) =>
            set(state => {
                return ({
                    ...state,
                    newMessage: message,
                    history: [...state.history, message]
                })
            }),
        setStreamPosition: position => {
            return set(
                state => {
                    const cp = { ...state.streamPosition };
                    return ({ ...state, streamPosition: Object.assign(cp, position) })
                }
            )
        },

    }
}
);

export { useStore };