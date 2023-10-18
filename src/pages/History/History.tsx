import { useEffect, useState, useRef, UIEventHandler } from "react"
import { StreamPosition, Subscription } from 'centrifuge';
import './History.scss'
import { get as getGlobalData } from "@/utils/globalData"



const  ListItem = (item:any) => {
    return <div className="history-list-item"></div>
}
function History() {
    const [sub] = useState<Subscription | undefined>(() => getGlobalData('sub'))
    const [list, setList] = useState<any[]>([])
    const divend = useRef<HTMLDivElement>(null)
    const listDivRef = useRef<HTMLDivElement>(null)
    const [scrollOffset, setScrollOffset] = useState(0);
    const jsControl = useRef(false)

    const loadMoreItems = () => {
        console.log('load more');
        loadMore.current = true
    };

    useEffect(() => {
        const l = []
        for (let i = 20; i >= 0; i--) {
            const x = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
            l.push({
                height: x
            })
        }
        //   setList(l)
    }, [])

    useEffect(() => {
        if (!divend.current) return
        setTimeout(() => {
            scrollDown()
        }, 100)
    }, [divend.current])

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

    const getHistory = async () => {
        const stream_position: StreamPosition = getGlobalData('stream_position') || {
            offset: 0,
            epoch: ''
        }
        const resp = await sub?.history({
            since: stream_position,
            limit: 50, reverse: true
        });
        console.log(resp);
    }

    useEffect(() => {
        console.log('sub',sub);
        
        getHistory()
    },[sub])



    const loadMore = useRef(false)
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
                    loadMoreItems()
                } else {
                    console.log('div b 不在 div a 的视口内。');
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
                <div id='first-child' > loading...</div>
                {list.length > 0 && list.map((item, index) =>
                    <div key={index} style={{ height: item.height + 'px' }} className="scroll-list-item">
                        {'height-' + item.height}
                    </div>
                )}
            </div>
        </div>
        <div ref={divend} className="end" />
    </div>

}

export default History