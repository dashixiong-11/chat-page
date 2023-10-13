import { useEffect, useState, useRef } from "react"
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import './History.scss'



function History() {
    const [list, setList] = useState<any[]>([])
    const listRef = useRef<any>(null)
    const isItemLoaded = (index: any) => {
        return !!list[index]
    }; // 根据你的数据结构调整
    const loadMoreItems = (startIndex: any, stopIndex: any) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const newData = Array.from({ length: 10 }, (_, i) => `Item ${list.length + i}`);
                setList(prevItems => [...prevItems, ...newData]);
                resolve();
            }, 1000);
        });

        // 从服务器或其他来源加载历史消息
    };

    useEffect(() => {
        const l = []
        for (let i = 0; i <= 50; i++) {
            l.push(i)
        }

        setList(l)
    }, [])
    useEffect(() => {
        if (!listRef.current) return
        listRef.current?.scrollToItem(list.length, "end");
    }, [listRef.current])

    return <div className="history">  <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={list.length}
        loadMoreItems={loadMoreItems}
        threshold={2}

    >
        {({ onItemsRendered }: any) => (
            <List
                ref={listRef as React.RefObject<List>}
                width='100%'
                height={window.innerHeight}
                className="list-v"
                itemCount={list.length}
                itemSize={50}
                onItemsRendered={onItemsRendered}
                style={{ overflowAnchor: "none" }} // 为了避免滚动跳跃
                layout="vertical"
                direction="ltr"
                innerElementType="div"
            >
                {Row}
            </List>
        )}
    </InfiniteLoader>
    </div>
    function Row(props: any) {
        const { index, style } = props;
        return (
            <div style={style} className="item">
                {list[index] ? list[index] : 'loading'}
            </div>
        );
    }
}

export default History