import { useEffect, useState, useRef, UIEventHandler } from "react"
import { useStore } from '@/hooks/useStore';
import './History.scss'



const ListItem = ({ item }: { item: any }) => {
    if (item.data_type === 'text') {
        return <span> {item.value}</span>
    } else if (item.data_type === 'multimodal_text') {
        return (item.value as { data_type: 'text' | 'image', value: string }[])
            .map((m, index) => <span key={index}>{m.data_type === 'image' ? '[图片]' : m.value} </span>)
    }

    return <div className="history-list-item"></div>
}
function History() {
    const { messageList, getHistory } = useStore()
    const [list, setList] = useState<any[]>([])
    const divend = useRef<HTMLDivElement>(null)
    const listDivRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsloading] = useState(false)
    const jsControl = useRef(false)
    useEffect(() => {
        if (!divend.current) return
        setTimeout(() => {
            scrollDown()
        }, 100)
    }, [divend.current])

    useEffect(() => {
        console.log('messageList', messageList);

    }, [messageList])

    const [listDivWrapperHeight, setListDivWrapperHeight] = useState(0)

    const c = document.querySelector('#container')
    useEffect(() => {
        if (listDivRef.current && list.length > 0) {
            if (listDivRef.current.clientHeight - listDivWrapperHeight > 0) {
                c && (c.scrollTop = listDivRef.current.clientHeight - listDivWrapperHeight)
            }
            setListDivWrapperHeight(listDivRef.current.clientHeight)
        }
    }, [list, listDivRef.current])

    const scrollDown = () => {
        jsControl.current = true
        divend.current && divend.current.scrollIntoView({
            block: "end"    // 上边框与视窗顶部平齐
        });
    }

    // const getHistory = async () => {
    //     setIsloading(true)
    //     const resp = await sub?.history({
    //         since: stream_position,
    //         limit: 50, reverse: true
    //     });
    //     setIsloading(false)
    //     console.log(resp);
    // }
    useEffect(() => {
        getHistory()
    }, [])



    const t = useRef(0)
    const onPageScroll: UIEventHandler<HTMLDivElement> = (event) => {
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
                    //  getHistory()
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
                <div id='first-child' > {isLoading ? '加载中...' : ''} </div>
                {messageList && messageList.list && messageList.list.map((item, index) => <ListItem key={index} item={item} />)}
            </div>
        </div>
        <div ref={divend} className="end" />
    </div>

}

export default History