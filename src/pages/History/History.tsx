import { useEffect, useState, useRef, UIEventHandler } from "react"
import { useStore } from '@/hooks/useStore';
import ai_avatar from '@/assets/icons/ai_avatar.png'
import './History.scss'



const ListItem = ({ item }: { item: NewMessageType }) => {

    const getMessageView = (message: MessageListType) => {
        if (message.data_type === 'text') {
            return <span key={item.u?.offset}> {message.value}</span>
        } else if (message.data_type === 'multimodal_text') {
            return (message.value as { data_type: 'text' | 'image', value: string }[])
                .map((m, index) => <span key={index + '-' + m.data_type}>{m.data_type === 'image' ? '[图片]' : m.value} </span>)
        }
    }

    return <li className='message-wrapper' key={item.u?.offset}>
        <div className="user-message m">
            <img src={item.u?.avatar} className='avatar' alt="" />
            <div className="user-message-right right">
                <span className='name'>{item.u?.id === localStorage.getItem('id') ? '我' : item.u?.name} </span>
                <div className='message user-block'>
                    {item['m'] && item['m'][0] && getMessageView(item['m'][0])}
                </div>
            </div>
        </div>
        {
            item['m'] && item['m'].length > 0 && item['m'][1] &&
            <div className="ai-message m">
                <img src={ai_avatar} className='avatar' alt="" />
                <div className="ai-message-right right">
                    <span className='name'>ai</span>
                    <div className="message ai-block">
                        {item.m && item.m.filter((_, index2) => {
                            return index2 === 1
                            // if (item.u?.id === localStorage.getItem('id')) {
                            //     return index2 !== 1 && index2 !== 0
                            // } else {
                            //     return index2 === 1
                            // }
                        }).map((msg) => { return getMessageView(msg) }
                        )}
                    </div>
                </div>
            </div>
        }
    </li>

}
function History() {
    const { history, getHistory } = useStore()
    const divend = useRef<HTMLDivElement>(null)
    const listDivRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsloading] = useState(false)
    const [currentOffset, setCurrentOffset] = useState<number | undefined>(0)
    const jsControl = useRef(false)
    useEffect(() => {
        if (!divend.current) return
        setTimeout(() => {
            scrollDown()
        }, 100)
    }, [divend.current])

    useEffect(() => {
        if (history.list.length > 0) {
            console.log(history.list[0].u?.offset);
            setCurrentOffset(history.list[0].u?.offset)
        }
        console.log('message list', history);
        if (history.changeType === 'new') {
            scrollDown()
        }

    }, [history])

    const [listDivWrapperHeight, setListDivWrapperHeight] = useState(0)

    const c = document.querySelector('#container')
    useEffect(() => {
        if (listDivRef.current && history.list.length > 0) {
            if (listDivRef.current.clientHeight - listDivWrapperHeight > 0) {
                c && (c.scrollTop = listDivRef.current.clientHeight - listDivWrapperHeight)
            }
            setListDivWrapperHeight(listDivRef.current.clientHeight)
        }
    }, [history, listDivRef.current])

    const scrollDown = () => {
        jsControl.current = true
        divend.current && divend.current.scrollIntoView({
            block: "end"    // 上边框与视窗顶部平齐
        });
    }


    useEffect(() => {
        getHistory()
    }, [])



    const t = useRef(0)
    const onPageScroll: UIEventHandler<HTMLDivElement> = () => {
        clearTimeout(t.current)
        setTimeout(() => {
            jsControl.current = false
            clearTimeout(t.current)
        }, 150)
    }

    useEffect(() => { ob() }, [])

    const ob = () => {
        const container = document.getElementById('container');
        const firstChild = document.getElementById('first-child');
        // 创建 IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !jsControl.current) {
                    setIsloading(true)
                    getHistory(currentOffset, () => {
                        setIsloading(false)
                    })
                }
            });
        }, {
            root: container, // div a 作为观察的根元素
            threshold: 0.1  // 至少10%的div b可见时，回调将被触发
        });

        // 开始观察 div b
        if (!firstChild) return
        observer.observe(firstChild);
    }

    return <div className="history" onScroll={onPageScroll} id='container'>
        <div className="scroll-container" id='scroll-container' >
            <div className="scroll-list" ref={listDivRef} id='list-wrapper' >
                <div id='first-child' >  </div>
                {history.list && history.list.map((item, index) => <ListItem key={index} item={item} />)}
            </div>
        </div>
        <div ref={divend} className="end" />
    </div>

}

export default History