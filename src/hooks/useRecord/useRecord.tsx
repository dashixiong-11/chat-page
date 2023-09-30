import { useState } from "react"
import useProtal from "../useProtal/useProtal"
import './useRecord.scss'


export function useRecord() {
    const { protal, remove } = useProtal()
    const [record, setRecord] = useState(() => {
        return {
            start:() => {
                protal(<div className="record-view">
                    record
                </div>,<div className="reocrd-mask"></div>)
            },
            stop:()=>{},
            cancel:() =>{},
            on:()=>{}
        }
    })





    return { record }
}