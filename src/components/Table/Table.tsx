import { useState, ChangeEvent, useRef, useCallback } from 'react';
import usePortal from "@/hooks/usePortal/usePortal"
import { post } from '@/utils/server';
import { useStore } from '@/hooks/useStore';
import { useSearchParams } from 'react-router-dom';
import './Table.scss'
import { showToast } from '@/utils/loading';
type Column = {
    title: string;
    dataIndex: string;
};

type Columns = Column[];

type DataSourceItem = {
    [K in Columns[number]['dataIndex']]?: string;
};

const Model = ({ column, data, remove, cb }: { column: Column, data: DataSourceItem, remove: () => void, cb: (id: string | undefined, key: string, value: string | undefined) => void }) => {
    const [value, setValue] = useState(data[column.dataIndex])
    const currentValue = useRef(data[column.dataIndex])

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setValue(value)
    }
    const onConfirmHandle = useCallback(() => {
        remove()
        if (currentValue.current === value) return
        cb(data['id'], column.dataIndex, value)
    }, [value])

    return <div className='table-model'>
        <div className="table-model-header">{column.title}</div>
        <input type="text" value={value} onChange={onChange} autoFocus />
        <div className="table-model-footer">
            <div className="cancel" onClick={remove}>取消</div>
            <div className="confirm" onClick={onConfirmHandle}>确定</div>
        </div>
    </div >
}
export function Table({ columns, dataSource }: { columns: Columns, dataSource: DataSourceItem[] }) {
    const [params] = useSearchParams()
    const channelName = params.get('channel_name')
    const { portal, remove } = usePortal()
    const [_columns] = useState<Columns>(columns)
    const [_dataSource, set_dataSource] = useState<DataSourceItem[]>(dataSource)
    const streamPosition = useStore((state) => state.streamPosition)

    const cb = async (id: string | undefined, key: string, value: string | undefined) => {
        const cp: DataSourceItem[] = JSON.parse(JSON.stringify(dataSource))
        const index = cp.findIndex(d => d.id === id)
        cp[index][key] = value
        set_dataSource(cp)
        console.log(streamPosition);
        const res = await post<any, any>('/im/api/updateLabTests', {
            channel: channelName,
            original_offset: streamPosition.offset,
            lab_tests: cp
        }).catch(err => {
            showToast({
                message: '修改失败',
                duration: 1500
            })
            throw new Error(err)
        })
        if (res.code === 0) {
            showToast({
                message: '成功',
                duration: 1500
            })
        }
    }

    const onClick = (c: Column, d: DataSourceItem) => {
        portal(<Model column={c} data={d} remove={remove} cb={cb} />)
    }

    return <table className="my-table">
        <thead>
            <tr>
                {_columns && _columns.map(c => <th key={c.dataIndex}>{c.title}</th>)}
            </tr>
        </thead>
        <tbody>
            {_dataSource && _dataSource.map((data, index) => (
                <tr key={data.name && data.name + index}>
                    {_columns && _columns.map(c => <td key={c.dataIndex} onClick={() => onClick(c, data)} >{data[c.dataIndex]}</td>)}
                </tr>
            ))}
        </tbody>
    </table>

}
