import { useRef, useState, useEffect, ChangeEvent } from 'react';
import { Select } from "@/components/Select/Select"
import close from '@/assets/icons/close.svg'
import { useShowToast } from "@/hooks/useShowToast/useShowToast"
import { post } from "@/utils/server"
import { createPortal } from 'react-dom';
import './AddChannel.scss'
import { pinyin } from 'pinyin-pro';

type PropTyep = {
  visible: boolean,
  onClose: () => void
}
type CategoryListType = {
  text: string,
  value: number | string
}[]

export const AddChannel = ({ visible, onClose }: PropTyep) => {
  const node = useRef<HTMLElement | null>(null);
  const { showToast } = useShowToast()
  node.current = document.createElement('div')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('男')
  const [channelName, setChannelName] = useState('')
  const [cnChannelName, setCnChannelName] = useState('')
  const [category, setCategory] = useState<number | string>('')
  const [categoryList, setCategoryList] = useState<CategoryListType>([])
  const data = [
    { text: '男', value: '男' },
    { text: '女', value: '女' },
  ]

  useEffect(() => {
    getCategory()
  }, [])

  const getCategory = async () => {
    const res = await post('/miniprogram/public/statuses', { "keys": ["channel_category"] }).catch(err => { throw new Error(err) })
    if (res.code === 0 && res.data) {
      const list = res.data.statuses?.channel_category
      list && setCategoryList(list)
      list && setCategory(list[0].value)
    }
  }

  const m = {
    'category': setCategory,
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
  const onConfirm = async() => {
    const res = await post('/miniprogram/api/create-channel', {
      name: channelName,
      cn_name: cnChannelName,
      category: category,
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
  }
  return visible ? createPortal(<>
    <div className="add-channel-mask" />
    <div className="add-channel-wrapper">
      <div className="add-channel">
        <div className="add-channel-title">
          <div style={{ textAlign: 'end' }} onClick={onClose}>
            <img src={close} alt="" className="close" />
          </div>
          <div >新增频道</div>
        </div>
        <div className="col">
          <span>当前选择</span>
          <div className="select">
            <Select data={categoryList} onSelected={e => onFormInputChange(e, 'category')} />
          </div>
        </div>
        <div className="col">
          <span>群组名称</span>
          <div className="ipt">
            <input type="text" className="channel-name" value={cnChannelName} onChange={e => onFormInputChange(e, 'cnChannelName')} />
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
    </div>
  </>, document.body) : null
}