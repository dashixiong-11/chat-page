import useProtal from "../useProtal/useProtal"
import { ChangeEvent } from "react"
import './useAddChannel.scss'
import { Select } from "@/components/Select/Select"

type FormItemType = {
  type: string,
  key: string,
  label: string
}

const onSelected = (e: ChangeEvent<HTMLSelectElement>)=>{
  console.log(e.target.value);
}



export function useAddChannel() {
  const { protal, remove } = useProtal()
  const data = [
    { text: '选项1', value: '1' },
    { text: '选项2', value: '2' },
    { text: '选项3', value: '3' },
  ]

  const show = () => {
    protal(<div className="add-channel">
      <span className="channel-pinyin"></span>
      <div className="col">
        <span>类型</span>
        <div className="select">
          <Select data={data} onSelected={onSelected} />
        </div>
      </div>
      <div className="col">
        <span>频道名</span>
        <div className="ipt">
          <input type="text" className="channel-name" />
        </div>
      </div>
      <div className="col">
        <span>姓名</span>
        <div className="ipt">
          <input type="text" className="name" />
        </div>
      </div>
      <div className="col">
        <span>年龄</span>
        <div className="ipt">
          <input type="text" className="age" />
        </div>
      </div>
      <div className="col">
        <span>性别</span>
        <div className="select">
          <Select data={data} onSelected={onSelected} />
        </div>
      </div>
    </div>)
  }
  const hide = () => { remove() }
  return {
    show,
  }
}