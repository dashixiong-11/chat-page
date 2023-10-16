import { post } from "@/utils/server"
import usePortal from "../usePortal/usePortal"
import { useShowToast } from "../useShowToast/useShowToast"
import { ChangeEvent, useEffect, useState } from "react"
import { Select } from "@/components/Select/Select"
import close from '@/assets/icons/close.svg'
import { pinyin } from 'pinyin-pro';
import './useAddChannel.scss'



type CategoryListType = {
  text: string,
  value: number | string
}[]

const Model = ({ cb, remove, list }: { cb: () => void, remove: () => void, list: CategoryListType }) => {
  const { showToast } = useShowToast()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('男')
  const [channelName, setChannelName] = useState('')
  const [cnChannelName, setCnChannelName] = useState('')
  const [category, setCategory] = useState<number | string>(() => list[0].value)

  const data = [
    { text: '男', value: '男' },
    { text: '女', value: '女' },
  ]


  const m = {
    'category': setCategory,
    'cnChannelName': setCnChannelName,
    'name': setName,
    'age': setAge,
    'sex': setSex
  }

  useEffect(() => {
    console.log('cnChannelName', cnChannelName);

  }, [cnChannelName])
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
    const res = await post('/miniprogram/api/create-channel', {
      name: channelName,
      cn_name: cnChannelName,
      category: parseInt(category as string),
      chan_info: category == '3' ? {
        "patient_name": name,
        "patient_age": age,
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
      <span>当前选择</span>
      <div className="select">
        <Select data={list} onSelected={e => onFormInputChange(e, 'category')} />
      </div>
    </div>
    <div className="col">
      <span>群组名称</span>
      <div className="ipt">
        <input type="text" className="channel-name" onChange={e => onFormInputChange(e, 'cnChannelName')} />
      </div>
    </div>
    {
      category == '3' && <>
        <div className="col">
          <span>患者姓名</span>
          <div className="ipt">
            <input type="text" className="name" onChange={e => onFormInputChange(e, 'name')} />
          </div>
        </div>
        <div className="col">
          <span>患者年龄</span>
          <div className="ipt">
            <input type="number" className="age" onChange={e => onFormInputChange(e, 'age')} />
          </div>
        </div>
        <div className="col">
          <span>患者性别</span>
          <div className="select">
            <Select data={data} onSelected={e => onFormInputChange(e, 'sex')} />
          </div>
        </div>
      </>}
    <button className="add-channel-btn" onClick={onConfirm}> 确定 </button>
  </div>
}

export function useAddChannel({ cb, categoryList }: { cb: () => void, categoryList: CategoryListType }) {
  const { portal, remove } = usePortal()
  const show = () => {
    portal(
      <Model cb={cb} remove={remove} list={categoryList} />
    )
  }
  return {
    show,
  }
}

export type { CategoryListType }