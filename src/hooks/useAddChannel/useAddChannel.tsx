import { post } from "@/utils/server"
import usePortal from "../usePortal/usePortal"
import { useShowToast } from "../useShowToast/useShowToast"
import { ChangeEvent, useState } from "react"
import { Select } from "@/components/Select/Select"
import close from '@/assets/icons/close.svg'
import { pinyin } from 'pinyin-pro';
import './useAddChannel.scss'




type P = {
  name: string, cn_name: string, category_id: number, chan_info: { patient_name: string, patient_age: number, patient_gender: string } | {},
}

const Model = ({ cb, remove, item }: { cb: () => void, remove: () => void, item: Item }) => {
  const { showToast } = useShowToast()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('男')
  const [channelName, setChannelName] = useState('')
  const [cnChannelName, setCnChannelName] = useState('')

  const data = [
    { text: '男', value: '男' },
    { text: '女', value: '女' },
  ]


  const m = {
    'cnChannelName': setCnChannelName,
    'name': setName,
    'age': setAge,
    'sex': setSex
  }

  const onFormInputChange = (e: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>, type: keyof typeof m) => {

    if (type === 'cnChannelName') {
      setChannelName(pinyin(e.target.value, {
        toneType: 'none'
      }))
    }
    m[type](e.target.value)
  }
  const hide = () => { remove() }
  const onConfirm = async () => {
    const res = await post<any, P>('/miniprogram/api/channel/' + item.root_id, {
      name: channelName,
      cn_name: cnChannelName,
      category_id: item.id,
      chan_info: Object.keys(item.chan_info).length > 0 ? {
        "patient_name": name,
        "patient_age": parseInt(age),
        "patient_gender": sex
      } : {}
    }).catch(error => {

      showToast({
        messages: '创建失败',
        duration: 1500
      })
      throw new Error(error)
    })
    if (res.code === 0) {
      cb()
      remove()
    }
  }

  return <div className="add-channel">
    <div className="add-channel-title">
      <div style={{ textAlign: 'end' }} onClick={hide}>
        <img src={close} alt="" className="close" />
      </div>
      <div >新增频道</div>
    </div>
    <div className="col">
      <div className="col-wrapper">
        <span>群组名称</span>
        <div className="ipt">
          <input type="text" className="channel-name" onChange={e => onFormInputChange(e, 'cnChannelName')} />
        </div>
      </div>
    </div>
    {
      item.id === 4  && <>
        <div className="col">
          <div className="col-wrapper">
            <span>患者姓名</span>
            <div className="ipt">
              <input type="text" className="name" onChange={e => onFormInputChange(e, 'name')} />
            </div>
          </div>
        </div>
        <div className="col">
          <div className="col-wrapper">
            <span>患者年龄</span>
            <div className="ipt">
              <input type="number" className="age" onChange={e => onFormInputChange(e, 'age')} />
            </div>
          </div>
        </div>
        <div className="col">
          <div className="col-wrapper">
            <span>患者性别</span>
            <div className="select">
              <Select data={data} onSelected={e => onFormInputChange(e, 'sex')} />
            </div>
          </div>
        </div>
      </>}
    <button className="add-channel-btn" onClick={onConfirm}> 确定 </button>
  </div>
}

export function useAddChannel({ cb }: { cb: () => void }) {
  const { portal, remove } = usePortal()
  const show = (item: Item) => {
    portal(
      <Model cb={cb} remove={remove} item={item} />
    )
  }
  return {
    show,
  }
}
