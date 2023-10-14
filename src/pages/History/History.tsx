import { useEffect, useState, useRef, UIEventHandler } from "react"
import './History.scss'



function History() {
    const [list, setList] = useState<any[]>([])
    const divend = useRef<HTMLDivElement>(null)
    const listDivRef = useRef<HTMLDivElement>(null)
    const [scrollOffset, setScrollOffset] = useState(0);
    const jsControl = useRef(false)

    const loadMoreItems = () => {
        console.log('load more');
        loadMore.current = true

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const newData = Array.from({ length: 10 }, (_, i) => {
                    const x = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
                    return {
                        height: x
                    }
                });
                setList(prevItems => [...newData, ...prevItems]);
                loadMore.current = false
                resolve();
            }, 1000);
        });

    };

    useEffect(() => {
        const l = []
        for (let i = 20; i >= 0; i--) {
            const x = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
            l.push({
                height: x
            })
        }
        setList(l)
    }, [])

    useEffect(() => {
        console.log(divend.current);
        if (!divend.current) return
        setTimeout(() => {
            scrollDown()
        }, 100)
    }, [divend.current])

    const [listDivWrapperHeight, setListDivWrapperHeight] = useState(0)

    useEffect(() => {
        if (listDivRef.current && list.length > 0) {
            console.log(listDivRef.current.clientHeight);
            setListDivWrapperHeight(listDivRef.current.clientHeight)
        }
    }, [list, listDivRef.current])

    const scrollDown = () => {
        jsControl.current = true
        divend.current && divend.current.scrollIntoView({
            block: "end"    // 上边框与视窗顶部平齐
        });
    }



    const loadMore = useRef(false)
    const t = useRef(0)
    const onPageScroll: UIEventHandler<HTMLDivElement> = (event) => {
        const { scrollTop } = event.currentTarget;
        if (jsControl.current) {
            console.log('js 触发');

        } else {

            if (scrollTop <= 50 && !loadMore.current) {
                loadMoreItems()
            }
        }
        clearTimeout(t.current)
        setTimeout(() => {
            jsControl.current = false
            clearTimeout(t.current)
        }, 150)



    }

    return <div className="history" onScroll={onPageScroll}>
        <div className="scroll-container">
            <div className="scroll-list" ref={listDivRef} id='list-wrapper' style={{ height: listDivWrapperHeight ? listDivWrapperHeight + 'px' : '' }}>
                {list.length && list.map((item, index) =>
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